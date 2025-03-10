import rehypeToc from "@jsdevtools/rehype-toc";
import fs from "fs";
import { glob } from "glob";
import fm from "gray-matter";
import path from "path";
import rehypeParse from "rehype-parse";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGFM from "remark-gfm";
import { unified } from "unified";
import { z } from "zod";

const PostFrontMatterSchema = z.object({
  title: z.string(),
  date: z.date(),
  description: z.string(),
});

export interface Post {
  data: {
    date: number;
    title: string;
    description?: string;
    path: string;
  };
  content: string;
}

export async function getPost(slug: string) {
  try {
    const file = fs.readFileSync(
      path.join(process.cwd(), "posts", `${slug}.md`)
    );
    const { data, content } = fm(file.toString());

    const post = PostFrontMatterSchema.parse(data);

    const u = unified()
      .use(remarkRehype)
      .use(rehypeParse)
      .use(remarkParse)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .use(rehypeSlug)
      .use(rehypeToc, {
        nav: true,
        customizeTOC: (args) => {
          if (!args.children) {
            return true;
          }

          return {
            type: "element",
            tagName: "nav",
            properties: { className: "toc" },
            children: [...args.children],
          };
        },
      });

    const f = await u
      .use(rehypePrettyCode, {
        theme: "github-dark",
      })
      .use(rehypeStringify)
      .process(content);

    return {
      data: post,
      content,
      remark: String(f),
    };
  } catch (e) {
    return null;
  }
}

export const getAllPosts = ({ limit }: { limit?: number } = {}) => {
  const files = glob.sync(path.join("posts/*.md"));
  const posts = files
    .map((filename: string) => {
      const file = fs.readFileSync(path.join(process.cwd(), filename));
      const { data } = fm(file.toString());

      const frontmatter = PostFrontMatterSchema.parse(data);

      const slug = filename.split("/")[1]?.slice(0, -3);

      return {
        ...frontmatter,
        slug,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (limit) {
    return posts.slice(0, limit);
  }

  return posts;
};
