const pad = (value: number): string => String(value).padStart(2, "0");

// The date `days` days from today in the user's local time, as YYYY-MM-DD
export const getDaysFromTodayISO = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// Today's date in the user's local time, as YYYY-MM-DD (the format of <input type="date">)
export const getTodayISO = (): string => getDaysFromTodayISO(0);

// A saved ISO timestamp shown in the user's local date and time format
export const formatDateTime = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
};
