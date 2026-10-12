import { HeadingWithAnchor, MDXHeadingProps } from "./heading-with-anchor";
import Link from "./link";

export function generateId(children: React.ReactNode): string {
  if (typeof children === "string") {
    return children
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  if (Array.isArray(children)) {
    return children.map((child) => generateId(child)).join("-");
  }
  return "";
}

export const mdxComponents = {
  h1: ({ children, id, className }: MDXHeadingProps) => (
    <HeadingWithAnchor
      level={1}
      id={id || generateId(children)}
      className={className}
    >
      {children}
    </HeadingWithAnchor>
  ),
  h2: ({ children, id, className }: MDXHeadingProps) => (
    <HeadingWithAnchor
      level={2}
      id={id || generateId(children)}
      className={className}
    >
      {children}
    </HeadingWithAnchor>
  ),
  h3: ({ children, id, className }: MDXHeadingProps) => (
    <HeadingWithAnchor
      level={3}
      id={id || generateId(children)}
      className={className}
    >
      {children}
    </HeadingWithAnchor>
  ),
  h4: ({ children, id, className }: MDXHeadingProps) => (
    <HeadingWithAnchor
      level={4}
      id={id || generateId(children)}
      className={className}
    >
      {children}
    </HeadingWithAnchor>
  ),
  h5: ({ children, id, className }: MDXHeadingProps) => (
    <HeadingWithAnchor
      level={5}
      id={id || generateId(children)}
      className={className}
    >
      {children}
    </HeadingWithAnchor>
  ),
  h6: ({ children, id, className }: MDXHeadingProps) => (
    <HeadingWithAnchor
      level={6}
      id={id || generateId(children)}
      className={className}
    >
      {children}
    </HeadingWithAnchor>
  ),

  a: ({ children, ...props }: React.ComponentProps<"a">) => {
    if (!props.href) return <>{children}</>;

    return <Link {...props} href={props.href}>{children}</Link>;
  },

  img: ({ alt = "", ...props }: React.ComponentProps<"img">) => {
    return (
      <div className="flex justify-center">
        {/* Markdown images may be external and do not supply dimensions. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...props} alt={alt} />
      </div>
    );
  },
};
