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
  date: string;
  slug: string;
  children: React.ReactElement;
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="tracking-tight xl:max-w-lg mb-0 scroll-m-20 text-3xl">
          {title}
        </h1>
        <div className="flex gap-2">
          <time className="text-muted-foreground opacity-60">
            {formatDate(date)}
          </time>
        </div>
      </div>
      {children}
      <div className="mt-4 flex justify-center md:mt-16">
        <Link href="/posts">More Posts</Link>
      </div>
      <ActiveLinks />
    </>
  );
}
