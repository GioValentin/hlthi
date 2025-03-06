import { ReactElement } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box } from '@mui/material';
import ExternalLabsTableRow from './ExternalLabsTableRow';
import { LabOrderDTO } from '../helpers/types';

interface ExternalLabsTableProps {
  labOrders: LabOrderDTO[];
}

export default function ExternalLabsTable({ labOrders }: ExternalLabsTableProps): ReactElement {
  const statusOrder = { pending: 1, received: 2, sent: 3, reviewed: 4 };

  if (!Array.isArray(labOrders) || labOrders.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">No lab orders to display</Typography>
      </Box>
    );
  }

  const sortedLabOrders = [...labOrders].sort((a, b) => {
    const statusComparison = statusOrder[a.status] - statusOrder[b.status];
    if (statusComparison !== 0) return statusComparison;
    return a.orderAdded.toMillis() - b.orderAdded.toMillis();
  });

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="left" sx={{ fontWeight: 'bold', width: '28%', padding: '16px 16px' }}>
              Test type
            </TableCell>
            <TableCell align="left" sx={{ fontWeight: 'bold', width: '10%', padding: '8px 16px' }}>
              Order added
            </TableCell>
            <TableCell align="left" sx={{ fontWeight: 'bold', width: '28%', padding: '8px 16px' }}>
              Provider
            </TableCell>
            <TableCell align="left" sx={{ fontWeight: 'bold', width: '28%', padding: '8px 16px' }}>
              Dx
            </TableCell>
            <TableCell align="left" sx={{ fontWeight: 'bold', width: '5%', padding: '8px 16px' }}>
              Status
            </TableCell>
            <TableCell align="left" sx={{ fontWeight: 'bold', width: '1%', padding: '8px 16px' }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedLabOrders.map((order) => (
            <ExternalLabsTableRow key={order.id} externalLabsData={order} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
