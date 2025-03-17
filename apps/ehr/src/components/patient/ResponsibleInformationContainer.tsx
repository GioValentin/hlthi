import { FC, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { phoneRegex, REQUIRED_FIELD_ERROR_MESSAGE } from 'utils';
import { BasicDatePicker as DatePicker, FormSelect, FormTextField } from '../../components/form';
import { PatientGuarantorFields, RELATIONSHIP_OPTIONS, SEX_OPTIONS } from '../../constants';
import { Row, Section } from '../layout';
import { dataTestIds } from '../../constants/data-test-ids';
import InputMask from '../InputMask';
import { FormFields as AllFormFields } from '../../constants';

const FormFields = AllFormFields.responsibleParty;
const LocalDependentFields = [
  FormFields.firstName.key,
  FormFields.lastName.key,
  FormFields.birthDate.key,
  FormFields.birthSex.key,
  FormFields.phone.key,
];
export const ResponsibleInformationContainer: FC = () => {
  const { control, watch, setValue } = useFormContext();

  const patientData = watch(PatientGuarantorFields);
  const localData = watch(LocalDependentFields);
  const selfSelected = watch(FormFields.relationship.key) === 'Self';

  if (!patient) return null;

  const contactIndex = patient.contact?.findIndex((contact) =>
    contact.relationship?.some((rel) =>
      rel.coding?.some((code) => code.system === 'http://terminology.hl7.org/CodeSystem/v2-0131' && code.code === 'BP')
    )
  );

  const responsiblePartyIndex = patient?.contact ? (contactIndex === -1 ? patient.contact.length : contactIndex) : 0;

  const responsiblePartyContact =
    responsiblePartyIndex !== undefined ? patient?.contact?.[responsiblePartyIndex] : undefined;

  const responsiblePartyFullNamePath = patientFieldPaths.responsiblePartyName.replace(
    /contact\/\d+/,
    `contact/${responsiblePartyIndex}`
  );

  const responsiblePartyFirstNamePath = patientFieldPaths.responsiblePartyFirstName.replace(
    /contact\/\d+/,
    `contact/${responsiblePartyIndex}`
  );

  const responsiblePartyLastNamePath = patientFieldPaths.responsiblePartyLastName.replace(
    /contact\/\d+/,
    `contact/${responsiblePartyIndex}`
  );

  const responsiblePartyRelationshipPath = patientFieldPaths.responsiblePartyRelationship.replace(
    /contact\/\d+/,
    `contact/${responsiblePartyIndex}`
  );

  const responsiblePartyBirthDatePath = patientFieldPaths.responsiblePartyBirthDate.replace(
    /contact\/\d+/,
    `contact/${responsiblePartyIndex}`
  );

  const responsiblePartyGenderPath = patientFieldPaths.responsiblePartyGender.replace(
    /contact\/\d+/,
    `contact/${responsiblePartyIndex}`
  );

  const relationship = responsiblePartyContact?.relationship?.find((rel) =>
    rel.coding?.some((coding) => coding.system === 'http://hl7.org/fhir/relationship')
  )?.coding?.[0].display;

  const fullName =
    responsiblePartyContact?.name?.family && responsiblePartyContact?.name?.given?.[0]
      ? `${responsiblePartyContact.name.family}, ${responsiblePartyContact.name.given[0]}`
      : '';

  const birthDate = responsiblePartyContact?.extension?.[0].valueString;

  const birthSex = responsiblePartyContact?.gender;

  const phoneNumberIndex = responsiblePartyContact?.telecom
    ? responsiblePartyContact?.telecom?.findIndex((telecom) => telecom.system === 'phone')
    : -1;

  const phone = responsiblePartyContact?.telecom?.[phoneNumberIndex]?.value;

  const responsiblePartyPhonePath = patientFieldPaths.responsiblePartyPhone
    .replace(/contact\/\d+/, `contact/${responsiblePartyIndex}`)
    .replace(/telecom\/\d+/, `telecom/${phoneNumberIndex}`);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    const fieldType = name === responsiblePartyPhonePath ? 'phone' : undefined;
    updatePatientField(name, value, undefined, fieldType);
  };

  const handleResponsiblePartyNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;

    // Auto-format: If there's a space between words but no comma, add the comma
    const formattedValue = value.includes(',')
      ? value
      : value.replace(/(\w+)\s+(\w+)/, (_, lastName, firstName) => `${lastName}, ${firstName}`);
    // Update the input value with formatted version
    setValue(patientFieldPaths.responsiblePartyName, formattedValue);
    const [lastName = '', firstName = ''] = formattedValue.split(',').map((part) => part.trim());

    // Update both name parts
    handleChange({
      target: {
        name: responsiblePartyLastNamePath,
        value: lastName,
      },
    } as any);

    handleChange({
      target: {
        name: responsiblePartyFirstNamePath,
        value: firstName,
      },
    } as any);
  };

  return (
    <Section title="Responsible party information" dataTestId={dataTestIds.responsiblePartyInformationContainer.id}>
      <Row label={FormFields.relationship.label} required>
        <FormSelect
          name={FormFields.relationship.key}
          data-testid={dataTestIds.responsiblePartyInformationContainer.relationshipDropdown}
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
          required={true}
          defaultValue={''}
          disabled={selfSelected}
        />
      </Row>
      <Row label={FormFields.birthSex.label} required>
        <FormSelect
          name={FormFields.birthSex.key}
          data-testid={dataTestIds.responsiblePartyInformationContainer.birthSexDropdown}
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
              return phoneRegex.test(value) || 'Phone number must be 10 digits in the format (xxx) xxx-xxxx';
            },
          }}
          disabled={selfSelected}
        />
      </Row>
    </Section>
  );
};
