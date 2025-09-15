import { mdxComponents } from "@/components/mdx-components";
import fs from "fs";
import { glob } from "glob";
import { compileMDX, MDXRemoteProps } from "next-mdx-remote/rsc";
import path from "path";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkGFM from "remark-gfm";
import remarkMath from "remark-math";

type Frontmatter = {
  title: string;
  date: string;
  description: string;
};

export interface Post {
  data: {
    date: Date;
    title: string;
    description?: string;
  };
  content: string;
  slug: string;
}

async function compilePost(source: MDXRemoteProps["source"]) {
  return await compileMDX<Frontmatter>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [
          rehypePrettyCode,
          rehypeSlug,
          rehypeKatex,
          rehypeUnwrapImages,
        ],
        remarkPlugins: [remarkGFM, remarkMath],
      },
    },
    components: mdxComponents,
  });
}

function readFile(path: string) {
  if (fs.existsSync(path)) {
    return fs.readFileSync(path, "utf-8");
  }

  return null;
}

export async function getPost(slug: string) {
  const source = readFile(path.join(process.cwd(), "posts", `${slug}.md`));

  if (!source) {
    return null;
  }

  const { content, frontmatter } = await compilePost(source);

  return { content, frontmatter };
}

export async function getAllPosts() {
  const files = glob.sync(path.join("posts/*.md*"));

  const posts = await Promise.all(
    files.map(async (filename: string) => {
      const source = readFile(path.join(process.cwd(), filename));

      if (!source) {
        return null;
      }

      const { frontmatter } = await compilePost(source);

      const slug = filename.split("/")[1]?.slice(0, -3);

      return {
        ...frontmatter,
        slug,
      };
    })
  );

  const sortedPosts = posts
    .filter((post) => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return sortedPosts;
}
