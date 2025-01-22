import { ReactElement } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useTrackingBoardStore } from '../../state';
import { getSelectors } from '../../../shared/store/getSelectors';

const EMPTY_STATE = { label: 'All states', value: null };

export function StateSelect(): ReactElement {
  const { availableStates, state } = getSelectors(useTrackingBoardStore, ['availableStates', 'state']);
  const options = [EMPTY_STATE, ...availableStates.map((state) => ({ label: state, value: state }))];

  const randomState = availableStates[Math.floor(Math.random() * availableStates.length)];

  const handleStateChange = (_e: any, { value }: { label: string | null; value: string | null }): void => {
    localStorage.setItem('selectedState', value || '');
    useTrackingBoardStore.setState((prevState) => ({ ...prevState, state: value }));
  };

  return (
    <Autocomplete
      value={state ? { label: state, value: state } : EMPTY_STATE}
      onChange={handleStateChange}
      getOptionLabel={(state) => state.label || 'Unknown'}
      isOptionEqualToValue={(option, tempValue) => option.value === tempValue.value}
      options={options}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.value}>
            {option.label}
          </li>
        );
      }}
      fullWidth
      disableClearable
      renderInput={(params) => <TextField name="state" {...params} label="State" />}
    />
  );
}
