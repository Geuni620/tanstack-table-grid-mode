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

import {
  getSelectedRange,
  type SelectionPoint,
} from '@/components/table/getSelectedRange';
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

type Status = {
  id: number;
  name: string;
};

type ColumnDataProps = {
  task: string;
  status: Status;
  due?: Date | null;
  notes: string;
};

type ColumnKeys = keyof ColumnDataProps;
type ColumnValue = ColumnDataProps[ColumnKeys];

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

type SelectionRange = Record<ColumnKeys, ColumnValue>;

export const TableComponents: React.FC = () => {
  const [data] = useState<ColumnDataProps[]>(DATA);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    start: SelectionPoint;
    end: SelectionPoint;
  } | null>(null);
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

  const handleCellMouseUp = () => {
    setIsDragging(false);
  };

  const handleCellMouseDown = ({ rowIdx, colIdx }: SelectionPoint) => {
    setIsDragging(true);
    setSelectedRange({ start: { rowIdx, colIdx }, end: { rowIdx, colIdx } });
  };

  const handleCellMouseEnter = ({ rowIdx, colIdx }: SelectionPoint) => {
    if (isDragging && selectedRange) {
      captureSelectedData({
        start: selectedRange?.start,
        end: { rowIdx, colIdx },
      });
      setSelectedRange({ start: selectedRange.start, end: { rowIdx, colIdx } });
    }
  };

  const captureSelectedData = ({
    start,
    end,
  }: {
    start: SelectionPoint;
    end: SelectionPoint;
  }) => {
    if (!start || !end) return;

    const { rowStart, rowEnd, colStart, colEnd } = getSelectedRange({
      start,
      end,
    });

    const selectedData = data.slice(rowStart, rowEnd + 1).map((row) => {
      return (Object.keys(row) as ColumnKeys[])
        .slice(colStart, colEnd + 1)
        .reduce(
          (
            acc: Record<ColumnKeys, ColumnDataProps[ColumnKeys]>,
            key: ColumnKeys,
          ) => {
            acc[key] = row[key] as ColumnDataProps[typeof key];
            return acc;
          },
          {} as Record<ColumnKeys, ColumnValue>,
        );
    });

    setSelectedCellData(selectedData);
  };

  const isCellSelected = ({ rowIdx, colIdx }: SelectionPoint): boolean => {
    if (!selectedRange) return false;

    const { rowStart, rowEnd, colStart, colEnd } =
      getSelectedRange(selectedRange);

    return (
      rowIdx >= rowStart &&
      rowIdx <= rowEnd &&
      colIdx >= colStart &&
      colIdx <= colEnd
    );
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
                  style={{
                    width: `${cell.column.getSize()}px`,
                    border: '1px solid gray',
                    textAlign: 'center',
                    padding: '0.5rem',
                    height: '40px',
                    userSelect: 'none',
                    backgroundColor: isCellSelected({ rowIdx, colIdx })
                      ? 'lightblue'
                      : 'white',
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
