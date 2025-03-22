const description = "amas.sh is a personal site and blog covering interests in statistics, data science, math, Linux, etc.";

export const config = {
  name: "amas\.sh",
  author: "amas",
  url: "https://amas.sh",
  image: "/amas.svg",
  socials: {
    bsky: "https://bsky.app/profile/amas0.bsky.social",
    github: "https://github.com/amas0",
  },
  projects: [
  ],
  metadata: {
    description,
    title: "SITE",
    metadataBase: new URL("https://SITE.sh"),
    openGraph: {
      description,
      title: "SITE",
      url: "/",
      images: [
        {
          url: "https://SITE.sh/SITE.jpg",
          width: 1500,
          height: 500,
        },
      ],
      type: "website",
    },
  },
};
