import { CircularProgress, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useCallback, useMemo, useState } from 'react';
// import { useEffect } from 'react';
import { PageForm, getFileTypeFromFile } from 'ui-components';
// import { filterObject, safelyCaptureException } from 'ui-components';
// import { PaperworkResponseWithResponses } from 'utils';
import { FileURLs, FileUpload, FormItemType, getSelectors } from 'utils';
import { useZapEHRAPIClient } from '../../utils';
import { useAppointmentStore } from '../appointments';
import { useCreateZ3ObjectMutation } from '../files';
// import { useGetPaperwork } from '../paperwork';
import { useUpdatePaperworkMutation } from '../paperwork';

// const getPaperworkPhotoFiles = (paperworkData: PaperworkResponseWithResponses | undefined): FileURLs => {
//   return paperworkData
//     ? (filterObject(paperworkData.files || {}, (key) => key.startsWith('patient-photos')) as FileURLs)
//     : {};
// };

export const UploadPhotosWrapper = ({ onClose }: { onClose: () => void }): JSX.Element => {
  const { appointmentID } = getSelectors(useAppointmentStore, ['appointmentID']);
  const createZ3Object = useCreateZ3ObjectMutation();
  const updatePaperwork = useUpdatePaperworkMutation();
  const apiClient = useZapEHRAPIClient();
  // const {
  //   data: paperworkData,
  //   isLoading,
  //   isFetching,
  // } = useGetPaperwork((data) => setFileURLs(getPaperworkPhotoFiles(data)));
  const isLoading = false;
  const isFetching = false;

  // const photos = useMemo(() => getPaperworkPhotoFiles(paperworkData), [paperworkData]);
  const photos = {};

  const [fileURLs, setFileURLs] = useState<FileURLs>(photos);
  const [fileUploads, setFileUploads] = useState<FileUpload>({});

  const requestPending = isLoading || isFetching || createZ3Object.isLoading || updatePaperwork.isLoading;

  // this is temprorary hack for settign fileUrls, cause for some reason there's some very strange bug in useState(initial) for photos
  // useEffect(() => {
  //   setFileURLs(photos);
  // }, [photos]);

  const formElements = useMemo(
    () => [
      {
        name: 'patient-photos',
        type: 'Photos' as FormItemType,
        label: '',
        defaultValue: fileURLs,
        fileOptions: {
          onUpload: setFileUploads,
          uploadFile: (fileType: string, tempURL: string) =>
            setFileURLs((prevState) => ({
              ...prevState,
              [fileType]: { ...prevState?.[fileType], localUrl: tempURL },
            })),
          uploadFailed: Object.keys(fileUploads)
            .map((name) => ({ name, uploadFailed: fileUploads[name].uploadFailed }))
            .reduce(
              (prev, curr) => {
                prev[curr.name] = curr.uploadFailed;
                return prev;
              },
              {} as Record<string, boolean>
            ),
          resetUploadFailed: (fileType: string) =>
            setFileUploads((prev) => ({
              ...prev,
              [fileType]: { ...prev[fileType], uploadFailed: false },
            })),
          onClear: (fileType: string) => {
            setFileUploads((prev) => {
              delete prev[fileType];
              return prev;
            });
            setFileURLs((prevState) => {
              delete prevState[fileType];
              return prevState;
            });
          },
          fileType: 'patient-photos',
          loading: requestPending,
        },
      },
    ],
    [fileURLs, fileUploads, requestPending]
  );

  const onSubmit = useCallback(async (): Promise<void> => {
    let uploadResponse: any;
    const fileUrlsToUpdate = { ...fileURLs };

    for (const photoItem in fileUploads) {
      const fileId = photoItem;
      const fileData = fileUploads[photoItem].fileData;

      if (fileData) {
        uploadResponse = await createZ3Object.mutateAsync({
          apiClient,
          fileType: fileId,
          fileFormat: getFileTypeFromFile(fileUploads[photoItem].fileData?.name || ''),
          file: fileData,
          appointmentID,
        });
      }

      if (fileData && !uploadResponse) {
        // Reset fields if Z3 upload fails
        setFileUploads((prev) => ({
          ...prev,
          [fileId]: { fileData: null, uploadFailed: true },
        }));
      } else if (fileData && uploadResponse) {
        // Reset file data when user continues to next page
        setFileUploads((prev) => ({
          ...prev,
          [fileId]: { fileData: null, uploadFailed: prev[fileId].uploadFailed },
        }));
      }

      if (uploadResponse) {
        // Update state.fileURLs
        fileUrlsToUpdate[fileId] = {
          ...fileUrlsToUpdate[fileId],
          z3Url: uploadResponse.z3URL,
          localUrl: uploadResponse.z3URL ? fileURLs?.[fileId].localUrl : undefined,
        };
        setFileURLs(fileUrlsToUpdate);
      }
    }

    if (!apiClient) {
      throw new Error('apiClient is not defined');
    }
    if (!appointmentID) {
      throw new Error('appointmentID is not defined');
    }

    // await updatePaperwork.mutateAsync(
    //   {
    //     apiClient,
    //     appointmentID,
    //     files: fileUrlsToUpdate,
    //   },
    //   {
    //     onSuccess: () => {
    //       onClose();
    //     },
    //     onError: (error) => {
    //       safelyCaptureException(error);
    //     },
    //   }
    // );
  }, [fileURLs, apiClient, appointmentID, fileUploads, createZ3Object]);
  return (
    <>
      <Typography variant="h2" color="primary.main" sx={{ pb: 3 }}>
        Patient condition photos
      </Typography>
      {isLoading || !apiClient ? (
        <Box sx={{ justifyContent: 'center', display: 'flex' }}>
          <CircularProgress />
        </Box>
      ) : (
        <PageForm
          formElements={formElements}
          onSubmit={onSubmit}
          controlButtons={{
            submitLabel: 'Save',
            backButtonLabel: 'Close',
            onBack: onClose,
            loading: isLoading || isFetching || updatePaperwork.isLoading || createZ3Object.isLoading,
          }}
        />
      )}
    </>
  );
};
