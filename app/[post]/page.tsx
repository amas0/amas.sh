import ActiveLinks from "@/components/active-links";
import { config } from "@/config";
import { formatDate } from "@/lib/date";
import { getAllPosts, getPost } from "@/lib/posts";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageOpts {
  params: Promise<{
    post: string;
  }>;
}

export default async function Post({ params }: PageOpts) {
  const paramsVal = await params;
  const post = await getPost(paramsVal.post);

  if (!post) {
    return notFound();
  }

  return (
    <main className="space-y-4">
      <div className="mx-auto flex max-w-xl flex-col space-y-4">
        <h1 className="tracking-tight mb-0 scroll-m-20 text-4xl">
          {post.data.title}
        </h1>
        <div className="flex gap-2">
          <time className="text-foreground">
            {formatDate(new Date(post.data.date))}
          </time>
          <span className="text-foreground">{config.author}</span>
        </div>
      </div>

      <div
        className="post mx-auto space-y-4 max-w-xl"
        dangerouslySetInnerHTML={{ __html: post.remark }}
      ></div>

      <div className="mt-4 flex justify-center md:mt-16">
        <Link href="/posts">Read More</Link>
      </div>
      <ActiveLinks />
    </main>
  );
}

export async function generateMetadata({ params }: PageOpts) {
  const paramsVal = await params;
  const post = await getPost(paramsVal.post);

  if (!post) {
    return notFound();
  }

  const title = `${post.data.title} | ${config.name}`;
  const description = post.data.description;

  let images = config.metadata.openGraph?.images;

  return {
    title: post ? `${post.data.title} | ${config.name}` : "Not Found",
    description,
    openGraph: {
      ...config.metadata.openGraph,
      images,
      title,
      url: paramsVal.post,
      type: "website",
      description,
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
