import { useMemo } from 'react';
import { Data, filterStateV10 } from './types';
import { DataGrid } from '@mui/x-data-grid';
import { useRecoilValue } from 'recoil';

type Props = {
  data: Data[];
};

export const DataComponent: React.FC<Props> = ({ data }) => {
  //
  const filter = useRecoilValue(filterStateV10);
  const filteredData = useMemo(() => filter.evaluateForList(data), [data, filter]);
  const columns = useMemo(
    () => [
      //
      { field: 'name', headerName: 'Name', width: 150 },
      { field: 'quantity', headerName: 'Quantity', width: 150 },
      { field: 'location', headerName: 'Location', width: 150 },
      { field: 'tags', headerName: 'Tags', width: 150 },
      { field: 'isActive', headerName: 'Active', width: 150 },
    ],
    [],
  );

  return <DataGrid rows={filteredData} columns={columns} autoHeight />;
};
