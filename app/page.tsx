import { config } from "@/config";
import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

export default function Page() {
  const posts = getAllPosts({ limit: 5 });

  return (
    <main className="space-y-4">
      <p>
        Test
      </p>
      <h2>Writing</h2>

      <ul>
        {posts.map(({ slug, title }) => (
          <li key={slug}>
            <Link className="" href={slug!}>
              {title}
            </Link>
          </li>
        ))}
      </ul>

    </main>
  );
}
