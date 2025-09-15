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

  a: ({ children, ...props }: any) => {
    if (!props.href) return <>{children}</>;

    return <Link {...props}>{children}</Link>;
  },

  img: (props: any) => {
    return (
      <div className="flex justify-center">
        <img {...props} />
      </div>
    );
  },
};
