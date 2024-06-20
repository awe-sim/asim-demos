import { useRecoilValue } from 'recoil';
import { SearchComponent } from './SearchComponent';
import { DATA, filterStateV10 } from './types';
import { useEffect } from 'react';
import { DataComponent } from './DataComponent';
import { MoreComponent } from './MoreComponent';
import { Box, Stack } from '@mui/material';
import { ConditionComponent } from './ConditionComponent';

export const FiltersMain: React.FC = () => {
  //
  const filter = useRecoilValue(filterStateV10);
  useEffect(() => {
    console.log('Filter', filter);
  }, [filter]);
  return (
    <Box p={1}>
      <Stack direction="column" spacing={2}>
        <Stack direction="row" spacing={2}>
          <SearchComponent size="small" variant="standard" placeholder="Search" />
          {filter.conditions.map(condition => (
            <ConditionComponent key={condition.id} condition={condition} size="small" />
          ))}
          <MoreComponent size="small" />
        </Stack>
        <DataComponent data={DATA} />
      </Stack>
    </Box>
  );
};
