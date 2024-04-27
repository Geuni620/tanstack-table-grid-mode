import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DATA from '@/data';

interface Status {
  id: number;
  name: string;
}

interface ColumnDataProps {
  task: string;
  status: Status;
  due?: Date | null;
  notes: string;
}

const PAGE_SIZE_OPTIONS = [
  {
    value: 20,
    label: '20개씩 보기',
  },
  {
    value: 50,
    label: '50개씩 보기',
  },
  {
    value: 100,
    label: '100개씩 보기',
  },
];

type SelectionPoint = { rowIdx: number; colIdx: number };
type SelectionRange = {
  start: SelectionPoint | null;
  end: SelectionPoint | null;
};

export const TableComponents: React.FC = () => {
  const [data] = useState(DATA);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>({
    start: null,
    end: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCellData, setSelectedCellData] = useState<SelectionRange[]>(
    [],
  );

  console.log('selectedCellData', selectedCellData);

  const columnHelper = createColumnHelper<ColumnDataProps>();
  const columns = [
    columnHelper.accessor('task', {
      header: 'Task',
      cell: (props) => <p>{props.getValue()}</p>,
      size: 250,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (props) => <p>{props.getValue().name}</p>,
      size: 100,
      enableSorting: false,
    }),
    columnHelper.accessor('due', {
      header: 'Due',
      cell: (props) => <p>{props.getValue()?.toLocaleTimeString()}</p>,
      size: 100,
      enableSorting: false,
    }),
    columnHelper.accessor('notes', {
      header: 'Notes',
      size: 300,
      cell: (props) => <p>{props.getValue()}</p>,
      enableSorting: false,
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),

    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const handleCellClick = ({ rowIdx, colIdx }: SelectionPoint) => {
    if (!isDragging) {
      setSelectionRange({ start: { rowIdx, colIdx }, end: { rowIdx, colIdx } });
      captureSelectedData({
        start: { rowIdx, colIdx },
        end: { rowIdx, colIdx },
      });
    }
  };

  const handleCellMouseDown = ({ rowIdx, colIdx }: SelectionPoint) => {
    setSelectionRange({ start: { rowIdx, colIdx }, end: { rowIdx, colIdx } });
    setIsDragging(true);
    captureSelectedData({ start: { rowIdx, colIdx }, end: { rowIdx, colIdx } });
  };

  const handleCellMouseEnter = ({ rowIdx, colIdx }: SelectionPoint) => {
    if (isDragging) {
      setSelectionRange((prev) => {
        const newRange = { ...prev, end: { rowIdx, colIdx } };
        captureSelectedData(newRange);
        return newRange;
      });
    }
  };

  const handleCellMouseUp = () => {
    setIsDragging(false);
  };

  const captureSelectedData = ({
    start,
    end,
  }: {
    start: SelectionPoint;
    end: SelectionPoint;
  }) => {
    if (!start || !end) return;

    const rowStart = Math.min(start.rowIdx, end.rowIdx);
    const rowEnd = Math.max(start.rowIdx, end.rowIdx);
    const colStart = Math.min(start.colIdx, end.colIdx);
    const colEnd = Math.max(start.colIdx, end.colIdx);

    const selectedData = data.slice(rowStart, rowEnd + 1).map((row) =>
      Object.keys(row)
        .filter((_, index) => index >= colStart && index <= colEnd)
        .reduce((acc, key) => ({ ...acc, [key]: row[key] }), {}),
    );

    setSelectedCellData(selectedData);
  };

  return (
    <>
      {/* TableControls */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <select
          className="my-2 rounded-[4px] border-[1px] py-1 pl-2 pr-9 text-sm"
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {PAGE_SIZE_OPTIONS.map(({ value, label }) => (
            <option key={label} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{
                    width: `${header.getSize()}px`,
                    border: '1px solid gray',
                    textAlign: 'center',
                    padding: 0,
                  }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row, rowIdx) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell, colIdx) => (
                <TableCell
                  key={cell.id}
                  onMouseDown={() => handleCellMouseDown({ rowIdx, colIdx })}
                  onMouseEnter={() => handleCellMouseEnter({ rowIdx, colIdx })}
                  onMouseUp={handleCellMouseUp}
                  onClick={() => handleCellClick({ rowIdx, colIdx })}
                  style={{
                    width: `${cell.column.getSize()}px`,
                    border: '1px solid gray',
                    textAlign: 'center',
                    padding: '0.5rem',
                    height: '40px',
                    userSelect: 'none',
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-[10px] flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'‹'}
        </Button>

        <div className="text-sm font-bold text-slate-500">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          {'›'}
        </Button>
      </div>
    </>
  );
};
