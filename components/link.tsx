import { cn } from "@/lib/utils";
import { LinkProps } from "next/link";
import NextLink from "next/link";
import { PropsWithChildren } from "react";

interface CustomLinkProps extends LinkProps {
  active?: boolean;
  className?: string;
}

function Link({
  children,
  className,
  href,
  ...props
}: PropsWithChildren<CustomLinkProps>) {
  return (
    <NextLink
      {...props}
      href={href}
      className={cn(
        "text-foreground decoration-muted-foreground hover:text-foreground hover:decoration-foreground",
        className
      )}
    >
      {children}
    </NextLink>
  );
}

export default Link;
