import dayjs from 'dayjs';
import { FC, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { isPhoneNumberValid, REQUIRED_FIELD_ERROR_MESSAGE } from 'utils';
import { BasicDatePicker as DatePicker, FormSelect, FormTextField } from '../../components/form';
import { PatientGuarantorFields, RELATIONSHIP_OPTIONS, SEX_OPTIONS } from '../../constants';
import { Row, Section } from '../layout';
import { dataTestIds } from '../../constants/data-test-ids';
import InputMask from '../InputMask';
import { FormFields as AllFormFields, STATE_OPTIONS } from '../../constants';
import { Autocomplete, Box, TextField } from '@mui/material';
import { isPostalCodeValid } from 'utils';

const FormFields = AllFormFields.responsibleParty;
const LocalDependentFields = [
  FormFields.firstName.key,
  FormFields.lastName.key,
  FormFields.birthDate.key,
  FormFields.birthSex.key,
  FormFields.phone.key,
  FormFields.addressLine1.key,
  FormFields.addressLine2.key,
  FormFields.city.key,
  FormFields.state.key,
  FormFields.zip.key,
];
export const ResponsibleInformationContainer: FC = () => {
  const { control, watch, setValue } = useFormContext();

  const patientData = watch(PatientGuarantorFields);
  const localData = watch(LocalDependentFields);
  const selfSelected = watch(FormFields.relationship.key) === 'Self';

  useEffect(() => {
    if (selfSelected) {
      for (let i = 0; i < localData.length; i++) {
        if (patientData[i] && localData[i] !== patientData[i]) {
          setValue(LocalDependentFields[i], patientData[i]);
        }
      }
    }
  }, [localData, patientData, selfSelected, setValue]);

  return (
    <Section title="Responsible party information" dataTestId={dataTestIds.responsiblePartyInformationContainer.id}>
      <Row
        label={FormFields.relationship.label}
        dataTestId={dataTestIds.responsiblePartyInformationContainer.relationshipDropdown}
        required
      >
        <FormSelect
          name={FormFields.relationship.key}
          control={control}
          options={RELATIONSHIP_OPTIONS}
          rules={{
            required: REQUIRED_FIELD_ERROR_MESSAGE,
            validate: (value: string) => RELATIONSHIP_OPTIONS.some((option) => option.value === value),
          }}
        />
      </Row>
      <Row label={FormFields.firstName.label} required inputId={FormFields.firstName.key}>
        <FormTextField
          name={FormFields.firstName.key}
          data-testid={dataTestIds.responsiblePartyInformationContainer.firstName}
          control={control}
          rules={{ required: REQUIRED_FIELD_ERROR_MESSAGE }}
          id={FormFields.firstName.key}
          disabled={selfSelected}
        />
      </Row>
      <Row label={FormFields.lastName.label} required inputId={FormFields.lastName.key}>
        <FormTextField
          data-testid={dataTestIds.responsiblePartyInformationContainer.lastName}
          name={FormFields.lastName.key}
          control={control}
          rules={{ required: REQUIRED_FIELD_ERROR_MESSAGE }}
          id={FormFields.lastName.key}
          disabled={selfSelected}
        />
      </Row>
      <Row label={FormFields.birthDate.label} required>
        <DatePicker
          name={FormFields.birthDate.key}
          control={control}
          rules={{
            required: REQUIRED_FIELD_ERROR_MESSAGE,
            validate: (value: string) => {
              if (!value) return true;
              const dob = dayjs(value);
              const today = dayjs();
              const age = today.diff(dob, 'year');
              return age >= 18 || 'Responsible party should be older than 18 years';
            },
          }}
          defaultValue={''}
          disabled={selfSelected}
          dataTestId={dataTestIds.responsiblePartyInformationContainer.dateOfBirthDropdown}
          component="Field"
        />
      </Row>
      <Row
        label={FormFields.birthSex.label}
        dataTestId={dataTestIds.responsiblePartyInformationContainer.birthSexDropdown}
        required
      >
        <FormSelect
          name={FormFields.birthSex.key}
          control={control}
          options={SEX_OPTIONS}
          rules={{
            required: REQUIRED_FIELD_ERROR_MESSAGE,
          }}
          required={true}
          disabled={selfSelected}
        />
      </Row>
      <Row label={FormFields.phone.label} inputId={FormFields.phone.key}>
        <FormTextField
          id={FormFields.phone.key}
          name={FormFields.phone.key}
          data-testid={dataTestIds.responsiblePartyInformationContainer.phoneInput}
          control={control}
          inputProps={{ mask: '(000) 000-0000' }}
          InputProps={{
            inputComponent: InputMask as any,
          }}
          rules={{
            validate: (value: string) => {
              if (!value) return true;
              return isPhoneNumberValid(value) || 'Phone number must be 10 digits in the format (xxx) xxx-xxxx';
            },
          }}
          disabled={selfSelected}
        />
      </Row>
      <Row label={FormFields.addressLine1.label} required inputId={FormFields.addressLine1.key}>
        <FormTextField
          data-testid={dataTestIds.responsiblePartyInformationContainer.addressLine1}
          name={FormFields.addressLine1.key}
          control={control}
          rules={{ required: REQUIRED_FIELD_ERROR_MESSAGE }}
          id={FormFields.addressLine1.key}
          disabled={selfSelected}
        />
      </Row>
      <Row label={FormFields.addressLine2.label} inputId={FormFields.addressLine2.key}>
        <FormTextField
          data-testid={dataTestIds.responsiblePartyInformationContainer.addressLine2}
          name={FormFields.addressLine2.key}
          control={control}
          id={FormFields.addressLine2.key}
          disabled={selfSelected}
        />
      </Row>
      <Row label="City, State, ZIP" required>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormTextField
            name={FormFields.city.key}
            control={control}
            rules={{
              required: REQUIRED_FIELD_ERROR_MESSAGE,
            }}
            data-testid={dataTestIds.responsiblePartyInformationContainer.city}
          />
          <Controller
            name={FormFields.state.key}
            control={control}
            rules={{
              required: REQUIRED_FIELD_ERROR_MESSAGE,
            }}
            render={({ field: { value }, fieldState: { error } }) => {
              return (
                <Autocomplete
                  options={STATE_OPTIONS.map((option) => option.value)}
                  value={value ?? ''}
                  data-testid={dataTestIds.responsiblePartyInformationContainer.state}
                  onChange={(_, newValue) => {
                    if (newValue) {
                      setValue(FormFields.state.key, newValue);
                    } else {
                      setValue(FormFields.state.key, '');
                    }
                  }}
                  disableClearable
                  fullWidth
                  renderInput={(params) => (
                    <TextField {...params} variant="standard" error={!!error} required helperText={error?.message} />
                  )}
                />
              );
            }}
          />
          <FormTextField
            name={FormFields.zip.key}
            control={control}
            rules={{
              required: REQUIRED_FIELD_ERROR_MESSAGE,
              validate: (value: string) => isPostalCodeValid(value) || 'Must be 5 digits',
            }}
            data-testid={dataTestIds.responsiblePartyInformationContainer.zip}
          />
        </Box>
      </Row>
    </Section>
  );
};
