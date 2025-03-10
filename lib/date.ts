export function formatDate(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");

  const day = `${date.getDate() + 1}`.padStart(2, "0");

  return `${date.getFullYear()}/${month}/${day}`;
}
