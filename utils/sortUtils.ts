// utils/sortUtils.ts
export type SortConfig = { field: string; direction: 'asc' | 'desc' };

export const sortPieces = <T>(
  pieces: T[],
  sortConfig: SortConfig | null,
  levelOrder?: string[]
): T[] => {
  if (!sortConfig) return pieces;
  return [...pieces].sort((a: any, b: any) => {
    switch (sortConfig.field) {
      case 'title':
        return sortConfig.direction === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      case 'composer':
        return sortConfig.direction === 'asc'
          ? a.composer_last_name.localeCompare(b.composer_last_name)
          : b.composer_last_name.localeCompare(a.composer_last_name);
      case 'level':
        if (levelOrder) {
          return sortConfig.direction === 'asc'
            ? levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
            : levelOrder.indexOf(b.level) - levelOrder.indexOf(a.level);
        }
        return 0;
      default:
        return 0;
    }
  });
};
