import { config } from "@/config";
import { formatDate } from "@/lib/date";
import Link from "next/link";
import ActiveLinks from "./active-links";

export function Post({
  title,
  date,
  slug,
  children,
}: {
  title: string;
  date: Date;
  slug: string;
  children: React.ReactElement;
}) {
  return (
    <>
      <div className="flex flex-col space-y-2">
        <Link href={slug} className="no-underline">
          <h1 className="tracking-tight mb-0 scroll-m-20 text-3xl">{title}</h1>
        </Link>
        <div className="flex gap-2">
          <time className="text-foreground">{formatDate(date)}</time>
        </div>
      </div >
      {children}
      < div className="mt-4 flex justify-center md:mt-16" >
        <Link href="/posts">More Posts</Link>
      </div >
      <ActiveLinks />
    </>
  );
}
