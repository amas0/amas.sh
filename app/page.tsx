import { Post } from "@/components/post";
import { getAllPosts, getPost } from "@/lib/posts";

export default async function Page() {
  const posts = await getAllPosts();
  const latestPost = posts[0];

  const post = await getPost(latestPost.slug);

  if (!post) {
    return <main className="space-y-4">No posts found</main>;
  }

  return (
    <main className="space-y-4">
      <Post title={post.frontmatter.title} date={post.frontmatter.date}>
        {post.content}
      </Post>
    </main>
  );
}
