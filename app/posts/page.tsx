import Date from "@/components/date";
import { config } from "@/config";
import { getAllPosts } from "@/lib/posts";
import { type Metadata } from "next";
import Link from "next/link";

export default async function PostPage() {
  const posts = await getAllPosts();
  return (
    <main className="space-y-4">
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => {
          if (post.slug) {
            return (
              <li key={post.slug}>
                <div className="flex gap-2">
                  <Date value={post.date} />
                  <Link href={post.slug}>{post.title}</Link>
                </div>
              </li>
            );
          }
        })}
      </ul>
    </main>
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
