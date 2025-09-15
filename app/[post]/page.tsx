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

  const { content, frontmatter } = post;

  return (
    <main className="space-y-4">
      <Post
        title={frontmatter.title}
        date={frontmatter.date}
        slug={paramsVal.post}
      >
        <div className="post mx-auto space-y-4">{content}</div>
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

  const { frontmatter } = post;

  const title = `${frontmatter.title} | ${config.name}`;
  const description = frontmatter.description;

  let images = config.metadata.openGraph?.images;

  return {
    title: `${frontmatter.title} | ${config.name}`,
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
  const posts = await getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
