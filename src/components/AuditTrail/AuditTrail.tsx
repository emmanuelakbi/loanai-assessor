import React from 'react';
import type { AuditEntry } from '../../types';

export interface AuditTrailProps {
  entries: AuditEntry[];
}

/**
 * Format a timestamp for display
 * e.g., Date -> "1/15/2024, 10:30:45 AM"
 */
function formatTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Sort entries in chronological order (oldest first)
 */
function sortEntriesChronologically(entries: AuditEntry[]): AuditEntry[] {
  return [...entries].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * AuditTrail Component
 * Displays a complete audit trail for compliance with timestamped entries
 * Requirements: 4.1-4.4
 */
export const AuditTrail: React.FC<AuditTrailProps> = ({ entries }) => {
  // Sort entries in chronological order (oldest first)
  const sortedEntries = sortEntriesChronologically(entries);

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #E5E7EB',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #E5E7EB',
  };

  const entryListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const entryStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '6px',
    border: '1px solid #E5E7EB',
  };

  const timelineMarkerStyle: React.CSSProperties = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    flexShrink: 0,
    marginTop: '4px',
  };

  const entryContentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const timestampStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6B7280',
    fontFamily: 'monospace',
  };

  const actionStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#111827',
  };

  const dataSourceStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#4B5563',
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '32px',
    color: '#6B7280',
    fontSize: '14px',
  };

  return (
    <div style={containerStyle} data-testid="audit-trail">
      <div style={headerStyle}>Audit Trail</div>
      {sortedEntries.length === 0 ? (
        <div style={emptyStateStyle} data-testid="audit-trail-empty">
          No audit entries available
        </div>
      ) : (
        <div style={entryListStyle} data-testid="audit-trail-entries">
          {sortedEntries.map((entry, index) => (
            <div
              key={`${entry.timestamp.getTime()}-${index}`}
              style={entryStyle}
              data-testid={`audit-entry-${index}`}
            >
              <div style={timelineMarkerStyle} />
              <div style={entryContentStyle}>
                <span style={timestampStyle} data-testid={`audit-entry-timestamp-${index}`}>
                  {formatTimestamp(entry.timestamp)}
                </span>
                <span style={actionStyle} data-testid={`audit-entry-action-${index}`}>
                  {entry.action}
                </span>
                <span style={dataSourceStyle} data-testid={`audit-entry-datasource-${index}`}>
                  Source: {entry.dataSource}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditTrail;
