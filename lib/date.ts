export function formatDate(datestr: string) {
  const date = new Date(datestr);

  const month = `${date.getMonth() + 1}`.padStart(2, "0");

  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}/${month}/${day}`;
}
