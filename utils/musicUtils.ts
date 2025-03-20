// utils/musicUtils.ts

export const removeDiacritics = (str: string): string =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const normalizeForSearch = (str: string): string =>
  removeDiacritics(str.toLowerCase()).replace(/\./g, '');

  export const convertDurationToSeconds = (duration: string): number | null => {
    const parts = duration.split(':');
    if (parts.length !== 3) return null;
    const [hours, minutes, seconds] = parts.map(Number);
    if (hours === 0 && minutes === 0 && seconds === 0) return null;
    return hours * 3600 + minutes * 60 + seconds;
  };
  
  export const compareDurations = (
    aDuration: string | undefined,
    bDuration: string | undefined,
    direction: 'asc' | 'desc'
  ): number => {
    const isValid = (duration: string | undefined) =>
      duration !== undefined && duration !== '00:00:00';
    const aValid = isValid(aDuration);
    const bValid = isValid(bDuration);
    if (aValid && !bValid) return -1;
    if (!aValid && bValid) return 1;
    if (!aValid && !bValid) return 0;
    const secondsA = convertDurationToSeconds(aDuration!);
    const secondsB = convertDurationToSeconds(bDuration!);
    if (secondsA === null || secondsB === null) return 0;
    return direction === 'asc' ? secondsA - secondsB : secondsB - secondsA;
  };
  