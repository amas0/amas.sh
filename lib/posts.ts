import { post as vegaPost } from "@/app/vega-example/page";
import rehypeToc from "@jsdevtools/rehype-toc";
import fs from "fs";
import { glob } from "glob";
import fm from "gray-matter";
import path from "path";
import rehypeDocument from "rehype-document";
import rehypeKatex from "rehype-katex";
import rehypeParse from "rehype-parse";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import remarkGFM from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import { unified } from "unified";
import { z } from "zod";

type PostListing = {
  slug: string;
  title: string;
  date: Date;
  description: string;
};

const OTHER_POSTS: PostListing[] = [vegaPost];

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
      .use(remarkParse)
      .use(remarkGFM)
      .use(remarkMath)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeSlug)
      .use(rehypeKatex)
      .use(rehypeDocument, {
        // Get the latest one from: <https://katex.org/docs/browser>.
        css: "https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css",
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

export const getAllPosts = ({
  limit,
}: { limit?: number } = {}): PostListing[] => {
  const files = glob.sync(path.join("posts/*.md"));
  let posts = files
    .map((filename: string) => {
      const file = fs.readFileSync(path.join(process.cwd(), filename));
      const { data } = fm(file.toString());

      const { title, date, description } = PostFrontMatterSchema.parse(data);

      const slug = filename.split("/")[1]?.slice(0, -3);

      return {
        slug,
        title,
        date,
        description,
      };
    })
    .concat(OTHER_POSTS)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (limit) {
    return posts.slice(0, limit);
  }

  return posts;
};
