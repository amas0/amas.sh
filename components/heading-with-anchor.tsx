"use client";

import { cn } from "@/lib/utils";
import { Link } from "lucide-react";
import { useEffect, useState } from "react";

export type MDXHeadingProps = {
  children?: React.ReactNode;
  id?: string;
  className?: string;
};

type HeadingWithAnchorProps = {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  id: string;
  children: React.ReactNode;
  className?: string;
};

export function HeadingWithAnchor({
  level,
  id,
  children,
  className,
}: HeadingWithAnchorProps) {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    setUrl(url);
  });

  const renderHeading = () => {
    const baseClasses = "scroll-mt-20";

    switch (level) {
      case 1:
        return (
          <h1 id={id} className={cn(baseClasses, className)}>
            {children}
          </h1>
        );
      case 2:
        return (
          <h2 id={id} className={cn(baseClasses, className)}>
            {children}
          </h2>
        );
      case 3:
        return (
          <h3 id={id} className={cn(baseClasses, className)}>
            {children}
          </h3>
        );
      case 4:
        return (
          <h4 id={id} className={cn(baseClasses, className)}>
            {children}
          </h4>
        );
      case 5:
        return (
          <h5 id={id} className={cn(baseClasses, className)}>
            {children}
          </h5>
        );
      case 6:
        return (
          <h6 id={id} className={cn(baseClasses, className)}>
            {children}
          </h6>
        );
      default:
        return (
          <h2 id={id} className={cn(baseClasses, className)}>
            {children}
          </h2>
        );
    }
  };

  return (
    <div className={cn("group relative", className)}>
      {renderHeading()}
      <a
        href={url}
        className={cn(
          "absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          "rounded p-1 hover:text-foreground"
        )}
        aria-label={`Copy link to ${children}`}
        title={`Copy link to ${children}`}
      >
        <Link className="h-4 w-4" />
      </a>
    </div>
  );
}
