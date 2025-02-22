import { DurationUnit } from 'src/database/enum';

export const capitalizeFirst = (str?: string): string => {
  if (!str) return '';

  return str.replace(/^./, (char) => char.toUpperCase());
};

export function getNumberOfDays(startDate: string, endDate: string): number {
  return getDuration(startDate, endDate);
}

export function getDuration(
  startDate: string | Date,
  endDate: string | Date,
  durationUnit = DurationUnit.DAY,
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const divisionFactor = getDurationDivisionFactor(durationUnit);

  const diffInTime = end.getTime() - start.getTime();
  const diffInDays = diffInTime / divisionFactor;

  return Math.ceil(diffInDays);
}

export function getDurationDivisionFactor(
  durationUnit = DurationUnit.DAY,
): number {
  const day = 1000 * 60 * 60 * 24;

  switch (durationUnit) {
    case DurationUnit.DAY:
      return day;
    case DurationUnit.WEEK:
      return day * 7;
    case DurationUnit.MONTH:
      return day * 30;
    case DurationUnit.YEAR:
      return day * 366;

    default:
      return day;
  }
}
