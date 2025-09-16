import Link from "next/link";
import ActiveLinks from "./active-links";
import Date from "./date";

export function Post({
  title,
  date,
  children,
}: {
  title: string;
  date: string;
  children: React.ReactElement;
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="tracking-tight xl:max-w-lg mb-0 scroll-m-20 text-3xl">
          {title}
        </h1>
        <div className="flex gap-2">
          <Date value={date} />
        </div>
      </div>
      <div className="post mx-auto space-y-4">{children}</div>
      <div className="mt-4 flex justify-center md:mt-16">
        <Link href="/posts">More Posts</Link>
      </div>
      <ActiveLinks />
    </>
  );
}
