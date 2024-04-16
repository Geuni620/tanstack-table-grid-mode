import type { Row as TRow, Table as TTable } from '@tanstack/react-table';
import {
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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

interface TableProps {
  table: TTable<ColumnDataProps>;
}

interface RowProps {
  row: TRow<ColumnDataProps>;
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

export const TableComponents: React.FC = () => {
  const [data] = useState(DATA);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const handleCellClick = (cellId: string) => {
    setSelectedCell(cellId);
  };

  const isCellSelected = (cellId: string) => {
    console.log('cellId', cellId);
    return selectedCell === cellId;
  };

  const columnHelper = createColumnHelper<ColumnDataProps>();
  const columns = [
    {
      id: 'select',
      header: ({ table }: TableProps) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: RowProps) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      size: 50,
    },
    columnHelper.accessor('task', {
      header: ({ column }) => {
        return (
          <div
            className="flex cursor-pointer items-center justify-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Task
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
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
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,

    state: {
      rowSelection,
      columnFilters,
      sorting,
    },

    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <>
      {/* TableControls */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <Input
          className="w-[20%]"
          type="text"
          placeholder="Task name"
          value={(table.getColumn('task')?.getFilterValue() as string) ?? ''}
          onChange={(e) =>
            table.getColumn('task')?.setFilterValue(e.target.value)
          }
        />
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  onClick={() => handleCellClick(cell.id)}
                  style={{
                    width: `${cell.column.getSize()}px`,
                    border: '1px solid gray',
                    textAlign: 'center',
                    padding: '0.5rem',
                    height: '40px',
                    userSelect: 'none',
                    backgroundColor: isCellSelected(cell.id)
                      ? '#D3D3D3'
                      : 'transparent',
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
