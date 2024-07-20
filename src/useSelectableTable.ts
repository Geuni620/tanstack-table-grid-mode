import { useState } from 'react';
import {
  getSelectedRange,
  type SelectionPoint,
} from '@/components/table/getSelectedRange';
import type { ColumnDataProps } from '@/components/table';

type ColumnKeys = keyof ColumnDataProps;
type ColumnValue = ColumnDataProps[ColumnKeys];

type SelectionRange = Record<ColumnKeys, ColumnValue>;

export const useSelectableTable = (data) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    start: SelectionPoint;
    end: SelectionPoint;
  } | null>(null);
  const [selectedCellData, setSelectedCellData] = useState<SelectionRange[]>(
    [],
  );

  const handleCellMouseUp = () => {
    setIsDragging(false);
  };

  const handleCellMouseDown = ({ rowIdx, colIdx }: SelectionPoint) => {
    setIsDragging(true);
    setSelectedRange({ start: { rowIdx, colIdx }, end: { rowIdx, colIdx } });

    /**
     * @description
     * mouseEnter가 mouseDown 보다 먼저 발생하기 때문에, 첫 셀을 클릭하면 capureSelectedData에 반영되지 않음
     * 즉, mouseDown 이벤트에서도 captureSelectedData를 호출해야 함
     */
    captureSelectedData({ start: { rowIdx, colIdx }, end: { rowIdx, colIdx } });
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

  const handleCellReset = () => {
    setSelectedRange(null);
    setSelectedCellData([]);
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

  const copySelectedCells = () => {
    if (selectedCellData.length === 0) {
      return;
    }

    const headers = Object.keys(selectedCellData[0]);
    const rows = selectedCellData.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof typeof row];
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
          }
          return String(value ?? '');
        })
        .join('\t'),
    );

    const copyText = [headers.join('\t'), ...rows].join('\n');

    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        console.log('Copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  return {
    selectedCellData,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleCellMouseUp,
    handleCellReset,
    isCellSelected,
    copySelectedCells,
  };
};
