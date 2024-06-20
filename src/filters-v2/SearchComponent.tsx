import { useRecoilState } from 'recoil';
import { filterStateV10 } from './types';
import { useCallback } from 'react';
import { IconButton, TextField, TextFieldProps } from '@mui/material';
import { Close, Search } from '@mui/icons-material';

type Props = Omit<TextFieldProps, 'value' | 'onChange' | 'InputProps'>;

export const SearchComponent: React.FC<Props> = props => {
  //
  const [{ searchText }, setFilter] = useRecoilState(filterStateV10);
  const setSearchText = useCallback((text: string) => setFilter(prev => prev.setSearchText(text)), [setFilter]);

  return (
    <TextField
      //
      value={searchText}
      onChange={e => setSearchText(e.target.value)}
      InputProps={{
        endAdornment: searchText ? (
          <IconButton onClick={() => setSearchText('')}>
            <Close />
          </IconButton>
        ) : (
          <IconButton disabled>
            <Search />
          </IconButton>
        ),
      }}
      {...props}
    />
  );
};
