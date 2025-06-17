// cSpell:ignore AOEYes
import { AOEListQuestion } from './AOEListQuestion';
import { AOEMultiSelectListQuestion } from './AOEMultiSelectListQuestion';
import { AOEFreeTextQuestion } from './AOEFreeTextQuestion';
import { AOEDateQuestion } from './AOEDateQuestion';
import { Grid } from '@mui/material';
import { AOENumberQuestion } from './AOENumberQuestion';
import { AOEYesNoQuestion } from './AOEYesNoQuestion';
import { FormControl } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { QuestionnaireItem } from 'fhir/r4b';
import { LabQuestionnaireResponseItem } from 'utils';

interface AOEQuestionProps {
  question: QuestionnaireItem;
  answer?: LabQuestionnaireResponseItem;
  isReadOnly?: boolean;
}

export const AOEQuestion: React.FC<AOEQuestionProps> = (questionProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const { question, answer } = questionProps;
  const { linkId, text, type, required, extension, answerOption } = question;

  const defaultValue =
    type === 'choice' && answerOption && extension === undefined
      ? ''
      : type === 'choice' && answerOption && extension?.some((ext) => ext.valueString === 'multi-select list')
      ? []
      : undefined;

  if (!text) {
    throw new Error('question text is not defined');
  }

  return (
    // Athena TODO: consider Stack instead of grid...
    <Grid item xs={12}>
      <Controller
        name={linkId}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <>
            <FormControl fullWidth required={required} error={!!errors[linkId]}>
              {type === 'choice' && answerOption && extension === undefined && (
                <AOEListQuestion
                  questionText={text}
                  linkId={linkId}
                  answer={answer?.join(',')}
                  answerOption={answerOption}
                  required={required || false}
                  isReadOnly={questionProps.isReadOnly}
                  field={field}
                />
              )}
              {type === 'choice' &&
                answerOption &&
                extension?.some((ext) => ext.valueString === 'multi-select list') && (
                  <AOEMultiSelectListQuestion
                    questionText={text}
                    linkId={linkId}
                    answer={answer}
                    answerOption={answerOption}
                    required={required || false}
                    isReadOnly={questionProps.isReadOnly}
                    field={field}
                  />
                )}
              {type === 'text' && (
                <AOEFreeTextQuestion
                  questionText={text}
                  linkId={linkId}
                  answer={answer?.join(',')}
                  required={required || false}
                  isReadOnly={questionProps.isReadOnly}
                />
              )}
              {type === 'date' && extension && (
                <AOEDateQuestion
                  questionText={text}
                  linkId={linkId}
                  answer={answer?.join(',')}
                  extension={extension}
                  required={required || false}
                  isReadOnly={questionProps.isReadOnly}
                  field={field}
                />
              )}
              {type === 'integer' && extension && (
                <AOENumberQuestion
                  questionText={text}
                  linkId={linkId}
                  answer={answer?.join(',')}
                  extension={extension}
                  required={required || false}
                  isReadOnly={questionProps.isReadOnly}
                  idString={`integer-${linkId}`}
                  field={field}
                />
              )}
              {type === 'decimal' && extension && (
                <AOENumberQuestion
                  questionText={text}
                  linkId={linkId}
                  answer={answer?.join(',')}
                  extension={extension}
                  required={required || false}
                  isReadOnly={questionProps.isReadOnly}
                  idString={`decimal-${linkId}`}
                  field={field}
                />
              )}
              {type === 'boolean' && (
                <AOEYesNoQuestion
                  questionText={text}
                  linkId={linkId}
                  answer={answer?.join(',')}
                  required={required || false}
                  isReadOnly={questionProps.isReadOnly}
                  field={field}
                />
              )}
              {/* {!!errors[questionText] && <FormHelperText>{errors[questionText]}</FormHelperText>} */}
            </FormControl>
          </>
        )}
      />
    </Grid>
  );
};
