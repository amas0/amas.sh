import { config } from "@/config";
import { formatDate } from "@/lib/date";
import Link from "next/link";
import ActiveLinks from "./active-links";

export function Post({
  title,
  date,
  children,
}: {
  title: string;
  date: Date;
  children: React.ReactElement;
}) {
  return (
    <>
      <div className="flex flex-col space-y-4">
        <h1 className="tracking-tight mb-0 scroll-m-20 text-4xl">{title}</h1>
        <div className="flex gap-2">
          <time className="text-foreground">{formatDate(new Date(date))}</time>
          <span className="text-foreground">{config.author}</span>
        </div>
      </div>
      {children}
      <div className="mt-4 flex justify-center md:mt-16">
        <Link href="/posts">Read More</Link>
      </div>
      <ActiveLinks />
    </>
  );
}
