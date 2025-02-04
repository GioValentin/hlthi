import React, { ReactElement, useState } from 'react';
import { TableRow, TableCell, Button } from '@mui/material';
import { DateTime } from 'luxon';
import { ExternalLabsStatusChip } from './ExternalLabsStatusChip';
import { DiagnosisDTO, PROJECT_NAME_UPPER } from 'utils';
import CancelExternalLabDialog from './CancelExternalLabOrderDialog';
import { useNavigate } from 'react-router-dom';
import { ExternalLabsStatus } from '../helpers/types';
import { deleteIcon } from '@theme/icons';
import { otherColors } from '@theme/colors';

export interface MockLabOrderData {
  type: string; // ServiceRequest.code (representing test)
  location: string; // Organization.name (representing lab company)
  orderAdded: DateTime; // Task(1).authoredOn (we’ll reserve SR.authoredOn for when the SR is finished and sent to Oystehr)
  provider: string; // SR.requester -> Practitioner - user filling out the request form
  diagnosis: DiagnosisDTO; // SR.reasonCode
  // isPSC: boolean; // SR.performerType = PSC - this is shown in the figma but docs mention it being rolled back for MVP
  status: ExternalLabsStatus; // Task.status
}

interface ExternalLabsTableRowProps {
  externalLabsData: MockLabOrderData;
}

export default function ExternalLabsTableRow({ externalLabsData }: ExternalLabsTableRowProps): ReactElement {
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigateTo = useNavigate();

  const handleRowClick = (): void => {
    if (!dialogOpen) {
      navigateTo('order-details'); // replace with actual route based on status and assignee
    }
  };

  const handleDeleteClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setDialogOpen(true);
  };

  const handleCloseDialog = (): void => setDialogOpen(false);

  return (
    <TableRow
      onClick={handleRowClick}
      sx={{
        '&:last-child td, &:last-child th': { border: 0 },
        '&:hover': {
          backgroundColor: otherColors.apptHover,
        },
      }}
    >
      <TableCell>{`${externalLabsData.type} / ${externalLabsData.location}`}</TableCell>
      <TableCell>
        {`${externalLabsData.orderAdded.toLocaleString(DateTime.DATE_SHORT)}`}
        <br />
        {`${externalLabsData.orderAdded.toLocaleString(DateTime.TIME_SIMPLE)}`}
      </TableCell>
      <TableCell>{externalLabsData.provider}</TableCell>
      <TableCell>{`${externalLabsData.diagnosis.code} - ${externalLabsData.diagnosis.display}`}</TableCell>
      <TableCell align="left">
        <ExternalLabsStatusChip status={externalLabsData.status} />
      </TableCell>
      <TableCell>
        {externalLabsData.status === 'pending' ? (
          <Button
            onClick={handleDeleteClick}
            sx={{
              textTransform: 'none',
              borderRadius: 28,
              fontWeight: 'bold',
            }}
          >
            <img src={deleteIcon} alt={`${PROJECT_NAME_UPPER} deleteIcon`} />
          </Button>
        ) : null}
      </TableCell>
      <CancelExternalLabDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        externalLabOrderTestType={externalLabsData.type}
      />
    </TableRow>
  );
}
