import { formatDate } from "@/lib/date";

export default function Date({ value }: { value: string }) {
  return <time className="font-mono opacity-60">{formatDate(value)}</time>;
}
