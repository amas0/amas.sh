import { config } from "@/config";
import { getPost, getAllPosts } from "@/lib/posts";
import { Post } from "@/components/post";
import { notFound } from "next/navigation";

export default async function Page() {
  const latestPostListing = getAllPosts({ limit: 1 });
  const latestPost = await getPost(latestPostListing[0].slug)

  if (!latestPost) {
    return notFound();
  }

  return (
    <main className="space-y-4">
      <Post title={latestPost.data.title} date={latestPost.data.date} slug={latestPost.slug}>
        <div
          className="post mx-auto space-y-4"
          dangerouslySetInnerHTML={{ __html: latestPost.remark }}
        ></div>
      </Post>
    </main>
  );
}
