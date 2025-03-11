import { Post } from "@/components/post";
import { config } from "@/config";
import { getAllPosts, getPost } from "@/lib/posts";
import { notFound } from "next/navigation";

interface PageOpts {
  params: Promise<{
    post: string;
  }>;
}

export default async function Page({ params }: PageOpts) {
  const paramsVal = await params;
  const post = await getPost(paramsVal.post);

  if (!post) {
    return notFound();
  }

  return (
    <main className="space-y-4">
      <Post title={post.data.title} date={post.data.date}>
        <div
          className="post mx-auto space-y-4"
          dangerouslySetInnerHTML={{ __html: post.remark }}
        ></div>
      </Post>
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
