import { config } from "@/config";
import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

export default function Page() {
  const posts = getAllPosts({ limit: 5 });

  return (
    <main className="space-y-4">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum
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

      <h2>Projects</h2>
      <ul>
        {config.projects.map((project) => (
          <li key={`${project.url}${project.name}`}>
            <a href={project.url}>{project.name}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
