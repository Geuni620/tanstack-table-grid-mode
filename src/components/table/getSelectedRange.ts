export type SelectionPoint = { rowIdx: number; colIdx: number };

export const getSelectedRange = (selectedRange: {
  start: SelectionPoint;
  end: SelectionPoint;
}) => {
  const { start, end } = selectedRange;

  const rowStart = Math.min(start.rowIdx, end.rowIdx);
  const rowEnd = Math.max(start.rowIdx, end.rowIdx);
  const colStart = Math.min(start.colIdx, end.colIdx);
  const colEnd = Math.max(start.colIdx, end.colIdx);

  return { rowStart, rowEnd, colStart, colEnd };
};
