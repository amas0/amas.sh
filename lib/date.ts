export function formatDate(datestr: string) {
  // Keep the calendar date authored in the ISO timestamp, not the build's timezone.
  return datestr.split("T")[0].replaceAll("-", "/");
}
