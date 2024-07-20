import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { PAGE_SIZE_OPTIONS } from '@/components/table/constants';

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
import { useSelectableTable } from '@/useSelectableTable';

type Status = {
  id: number;
  name: string;
};

export type ColumnDataProps = {
  task: string;
  status: Status;
  due?: Date | null;
  notes: string;
};

export const TableComponents: React.FC = () => {
  const [data] = useState<ColumnDataProps[]>(DATA);
  const {
    selectedCellData,
    isCellSelected,
    copySelectedCells,
    handleCellMouseUp,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleCellReset,
  } = useSelectableTable(DATA);

  const columnHelper = createColumnHelper<ColumnDataProps>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('task', {
        header: 'Task',
        cell: (info) => <p>{info.getValue()}</p>,
        size: 250,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <p>{info.getValue().name}</p>,
        size: 100,
        enableSorting: false,
      }),
      columnHelper.accessor('due', {
        header: 'Due',
        cell: (info) => <p>{info.getValue()?.toLocaleTimeString()}</p>,
        size: 100,
        enableSorting: false,
      }),
      columnHelper.accessor('notes', {
        header: 'Notes',
        cell: (info) => <p>{info.getValue()}</p>,
        size: 300,
        enableSorting: false,
      }),
    ],
    [],
  );

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

  useHotkeys(
    'ctrl+c',
    (event) => {
      event.preventDefault();
      copySelectedCells();
    },
    {},
    [selectedCellData],
  );

  return (
    <>
      {/* TableControls */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <select
          className="my-2 rounded-[4px] border-[1px] py-1 pl-2 pr-9 text-sm"
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            handleCellReset();
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
          onClick={() => {
            handleCellReset();
            table.previousPage();
          }}
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
          onClick={() => {
            handleCellReset();
            table.nextPage();
          }}
        >
          {'›'}
        </Button>
      </div>

      <div
        style={{
          fontFamily: 'monospace',
        }}
        className="mt-2 whitespace-pre rounded-[4px] border border-gray-300 bg-gray-100 p-2"
      >
        {JSON.stringify(
          selectedCellData.map((data) => {
            return Object.entries(data).reduce(
              (acc, [key, value]) => ({
                ...acc,
                [key]: value,
              }),
              {},
            );
          }),
          null,
          2,
        )}
      </div>
    </>
  );
};
