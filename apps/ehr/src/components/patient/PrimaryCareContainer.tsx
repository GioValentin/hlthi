import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { REQUIRED_FIELD_ERROR_MESSAGE } from 'utils';
import { Row, Section } from '../layout';
import { FormTextField } from '../form';
import { FormFields as AllFormFields } from '../../constants';

const FormFields = AllFormFields.primaryCarePhysician;
export const PrimaryCareContainer: FC = () => {
  const { control, watch, setValue } = useFormContext();

  const isActive = watch(FormFields.active.key, true);

  console.log('isActive', isActive);

  return (
    <Section title="Primary Care Physician">
      <Controller
        name={FormFields.active.key}
        control={control}
        render={({ field: { value } }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={!value}
                onClick={(e) => {
                  const checked = (e.target as HTMLInputElement).checked;
                  setValue(FormFields.active.key, !checked, { shouldDirty: true });
                }}
              />
            }
            label={<Typography>Patient doesn't have a PCP at this time</Typography>}
          />
        )}
      />
      <Box sx={{ display: isActive ? 'contents' : 'none' }}>
        <Row label="First name" inputId={FormFields.firstName.key} required={isActive}>
          <FormTextField
            name={FormFields.firstName.key}
            control={control}
            rules={isActive && { required: REQUIRED_FIELD_ERROR_MESSAGE }}
            id={FormFields.firstName.key}
          />
        </Row>
        <Row label="Last name" inputId={FormFields.lastName.key} required={isActive}>
          <FormTextField
            name={FormFields.lastName.key}
            control={control}
            rules={isActive && { required: REQUIRED_FIELD_ERROR_MESSAGE }}
            id={FormFields.lastName.key}
          />
        </Row>
        <Row label="Practice name" inputId={FormFields.practiceName.key}>
          <FormTextField name={FormFields.practiceName.key} control={control} id={FormFields.practiceName.key} />
        </Row>
        <Row label="Address" inputId={FormFields.address.key}>
          <FormTextField name={FormFields.address.key} control={control} id={FormFields.address.key} />
        </Row>
        <Row label="Mobile" inputId={FormFields.phone.key}>
          <FormTextField name={FormFields.phone.key} control={control} id={FormFields.phone.key} />
        </Row>
      </Box>
    </Section>
  );
};
