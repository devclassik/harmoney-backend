export const capitalizeFirst = (str?: string): string => {
  if (!str) return '';

  return str.replace(/^./, (char) => char.toUpperCase());
};
