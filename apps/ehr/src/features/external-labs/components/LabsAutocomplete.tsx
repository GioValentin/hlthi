import { FC, useState, useMemo } from 'react';
import { OrderableItemSearchResult } from 'utils';
import { Autocomplete, TextField, Box } from '@mui/material';

type LabsAutocompleteProps = {
  selectedLab: OrderableItemSearchResult | null;
  setSelectedLab: React.Dispatch<React.SetStateAction<OrderableItemSearchResult | null>>;
  labs: OrderableItemSearchResult[];
};

export const LabsAutocomplete: FC<LabsAutocompleteProps> = (props) => {
  const { selectedLab, setSelectedLab, labs } = props;
  const [inputValue, setInputValue] = useState('');

  const filterOptions = useMemo(() => {
    if (inputValue === '') return [];
    return labs.filter((item) => {
      return item.item.itemName.toLowerCase().includes(inputValue.toLowerCase());
    });
  }, [inputValue, labs]);

  return (
    <Box sx={{ paddingTop: '8px' }}>
      <Autocomplete
        size="small"
        options={filterOptions}
        getOptionLabel={(option) => `${option.item.itemName} / ${option.lab.labName}`}
        noOptionsText={
          inputValue && filterOptions.length === 0 ? 'No labs based on input' : 'Start typing to load labs'
        }
        value={selectedLab}
        onChange={(_, newValue) => setSelectedLab(newValue)}
        inputValue={inputValue}
        onInputChange={(_, newValue) => setInputValue(newValue)}
        renderInput={(params) => <TextField required {...params} label="Lab" variant="outlined" />}
      />
    </Box>
  );
};
