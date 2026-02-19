export function formatDate(
  isoDate: string | Date | undefined,
  options?: {
    isStartOfMonth?: boolean;
    isEndOfMonth?: boolean;
  },
) {
  if (!isoDate) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  const date = new Date(isoDate);

  if (options?.isStartOfMonth) {
    date.setDate(1);
  } else if (options?.isEndOfMonth) {
    date.setMonth(date.getMonth() + 1, 0);
  }

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}-${month}-${day}`;
}

export function formatDatetime(isoDate: string | Date | undefined, options?: {
  boundary?: 'start-of-day' | 'end-of-day'
}) {
  if (!isoDate) {
    return '';
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const date = new Date(isoDate);

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  if (options?.boundary === 'start-of-day') {
    return `${year}-${month}-${day} 00:00:00`;
  }

  if (options?.boundary === 'end-of-day') {
    return `${year}-${month}-${day} 23:59:59`;
  }

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const getLocalDate = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
};