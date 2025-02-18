export const capitalizeFirst = (str?: string): string => {
  if (!str) return '';

  return str.replace(/^./, (char) => char.toUpperCase());
};

export function getNumberOfDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffInTime = end.getTime() - start.getTime();
  const diffInDays = diffInTime / (1000 * 60 * 60 * 24);

  return Math.ceil(diffInDays);
}
