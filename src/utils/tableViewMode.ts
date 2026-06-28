export type TableViewMode = 'comfortable' | 'standard' | 'compact';

export type TableViewModeConfig = {
  label: string;
  tableSize: 'small' | 'medium';
  headPy: number;
  bodyPy: number;
  px: number;
  fontSize: string;
  toolbarPy: number;
  serialWidth: number;
};

export const TABLE_VIEW_MODES: TableViewMode[] = ['comfortable', 'standard', 'compact'];

export const TABLE_VIEW_MODE_CONFIG: Record<TableViewMode, TableViewModeConfig> = {
  comfortable: {
    label: 'Comfortable',
    tableSize: 'medium',
    headPy: 2.25,
    bodyPy: 2,
    px: 2.5,
    fontSize: '0.9375rem',
    toolbarPy: 2.25,
    serialWidth: 80,
  },
  standard: {
    label: 'Standard',
    tableSize: 'medium',
    headPy: 1.5,
    bodyPy: 1.5,
    px: 2,
    fontSize: '0.875rem',
    toolbarPy: 2,
    serialWidth: 72,
  },
  compact: {
    label: 'Compact',
    tableSize: 'small',
    headPy: 1,
    bodyPy: 0.75,
    px: 1.5,
    fontSize: '0.8125rem',
    toolbarPy: 1.5,
    serialWidth: 64,
  },
};

export function isTableViewMode(value: string | null): value is TableViewMode {
  return value === 'comfortable' || value === 'standard' || value === 'compact';
}

export function readTableViewMode(storageKey: string): TableViewMode {
  const stored = localStorage.getItem(storageKey);
  return isTableViewMode(stored) ? stored : 'standard';
}

export function saveTableViewMode(storageKey: string, mode: TableViewMode): void {
  localStorage.setItem(storageKey, mode);
}
