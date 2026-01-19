import React from 'react';
import { Skeleton } from './Skeleton';

export interface TableRowSkeletonProps {
  /** Number of columns in the table */
  columns?: number;
  /** Number of skeleton rows to render */
  rows?: number;
}

/**
 * TableRowSkeleton - Loading placeholder for table rows
 * 
 * Requirements:
 * - 8.6: Display loading states with skeleton screens for async operations
 * 
 * Used in RecentAssessments and BatchResultsTable during data loading
 */
export const TableRowSkeleton: React.FC<TableRowSkeletonProps> = ({
  columns = 5,
  rows = 3,
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr
          key={rowIndex}
          className="border-b border-gray-200"
          data-testid={`table-row-skeleton-${rowIndex}`}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4">
              <Skeleton
                variant="text"
                width={colIndex === 0 ? 150 : colIndex === columns - 1 ? 80 : 60}
                height={16}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableRowSkeleton;
