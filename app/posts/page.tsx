import { config } from "@/config";
import { getAllPosts } from "@/lib/posts";
import { type Metadata } from "next";
import Link from "next/link";

export default function PostPage() {
  const posts = getAllPosts();
  return (
    <div className="mx-auto max-w-xl">
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => {
          if (post.slug) {
            return (
              <li key={post.slug}>
                <Link href={post.slug}>{post.title}</Link>
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
}

export function generateMetadata(): Metadata {
  const title = "Posts";
  const description = "Posts";

  return {
    title,
    description,
    openGraph: {
      ...config.metadata.openGraph,
      url: `/posts`,
      title,
      description,
    },
  };
}
