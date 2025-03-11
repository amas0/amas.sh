import { config } from "@/config";
import { getAllPosts } from "@/lib/posts";
import RSS from "rss";

export async function GET() {
  const blogPosts = await getAllPosts(); // Fetch your blog posts or any other data you want to feed

  const siteUrl = config.url;

  const feedOptions = {
    title: "Your RSS Feed Title",
    description: "Your RSS Feed Description",
    site_url: siteUrl,
    feed_url: `${siteUrl}/feed.xml`,
    image_url: config.image,
    pubDate: new Date().toUTCString(),
    copyright: `All rights reserved - 2025`,
  };

  const feed = new RSS(feedOptions);

  blogPosts.map((post) => {
    feed.item({
      title: post.title,
      description: post.description,
      url: `${siteUrl}/blog/${post.slug}`,
      guid: post.slug,
      date: post.date,
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
}
