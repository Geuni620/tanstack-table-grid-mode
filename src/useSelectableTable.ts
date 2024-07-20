import { useReducer, useCallback } from 'react';
import {
  getSelectedRange,
  type SelectionPoint,
} from '@/components/table/getSelectedRange';
import type { ColumnDataProps } from '@/components/table';

type ColumnKeys = keyof ColumnDataProps;
type ColumnValue = ColumnDataProps[ColumnKeys];
type SelectionRange = Record<ColumnKeys, ColumnValue>;

type State = {
  isDragging: boolean;
  selectedRange: { start: SelectionPoint; end: SelectionPoint } | null;
  selectedCellData: SelectionRange[];
};

type Action =
  | { type: 'START_DRAGGING'; payload: SelectionPoint }
  | { type: 'STOP_DRAGGING' }
  | { type: 'UPDATE_SELECTION'; payload: SelectionPoint }
  | { type: 'RESET_SELECTION' }
  | { type: 'SET_SELECTED_DATA'; payload: SelectionRange[] };

const initialState: State = {
  isDragging: false,
  selectedRange: null,
  selectedCellData: [],
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'START_DRAGGING':
      return {
        ...state,
        isDragging: true,
        selectedRange: { start: action.payload, end: action.payload },
      };
    case 'STOP_DRAGGING':
      return { ...state, isDragging: false };
    case 'UPDATE_SELECTION':
      return state.selectedRange
        ? {
            ...state,
            selectedRange: { ...state.selectedRange, end: action.payload },
          }
        : state;
    case 'RESET_SELECTION':
      return { ...state, selectedRange: null, selectedCellData: [] };
    case 'SET_SELECTED_DATA':
      return { ...state, selectedCellData: action.payload };
    default:
      return state;
  }
};

/**
 * @fixme
 * type 더 범용적으로
 */

export const useSelectableTable = <T extends Record<string, ColumnValue>>(
  data: T[],
) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleCellMouseUp = useCallback(() => {
    dispatch({ type: 'STOP_DRAGGING' });
  }, []);

  const handleCellMouseDown = useCallback(
    ({ rowIdx, colIdx }: SelectionPoint) => {
      dispatch({ type: 'START_DRAGGING', payload: { rowIdx, colIdx } });
      captureSelectedData({ rowIdx, colIdx }, { rowIdx, colIdx });
    },
    [data],
  );

  const handleCellMouseEnter = useCallback(
    ({ rowIdx, colIdx }: SelectionPoint) => {
      if (state.isDragging && state.selectedRange) {
        dispatch({ type: 'UPDATE_SELECTION', payload: { rowIdx, colIdx } });
        captureSelectedData(state.selectedRange.start, { rowIdx, colIdx });
      }
    },
    [state.isDragging, state.selectedRange, data],
  );

  const handleCellReset = useCallback(() => {
    dispatch({ type: 'RESET_SELECTION' });
  }, []);

  const captureSelectedData = useCallback(
    (start: SelectionPoint, end: SelectionPoint) => {
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

      dispatch({ type: 'SET_SELECTED_DATA', payload: selectedData });
    },
    [data],
  );

  const isCellSelected = useCallback(
    ({ rowIdx, colIdx }: SelectionPoint): boolean => {
      if (!state.selectedRange) return false;

      const { rowStart, rowEnd, colStart, colEnd } = getSelectedRange(
        state.selectedRange,
      );

      return (
        rowIdx >= rowStart &&
        rowIdx <= rowEnd &&
        colIdx >= colStart &&
        colIdx <= colEnd
      );
    },
    [state.selectedRange],
  );

  const copySelectedCells = useCallback(() => {
    if (state.selectedCellData.length === 0) {
      return;
    }

    const headers = Object.keys(state.selectedCellData[0]);
    const rows = state.selectedCellData.map((row) =>
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
  }, [state.selectedCellData]);

  return {
    selectedCellData: state.selectedCellData,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleCellMouseUp,
    handleCellReset,
    isCellSelected,
    copySelectedCells,
  };
};
