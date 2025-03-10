"use client";

import { config } from "@/config";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MainNav() {
  const pathname = usePathname();
  return (
    <div className="flex gap-6 md:gap-10">
      <Link
        href="/"
        className="flex items-center space-x-2 no-underline hover:text-foreground"
      >
        {pathname === "/" ? (
          <h1 className="text-foreground">{config.name}</h1>
        ) : (
          <span className="text-muted-foreground hover:text-foreground">
            {config.name}
          </span>
        )}
      </Link>
    </div>
  );
}
