const description = "amas.sh is a personal site and blog covering interests in statistics, data science, math, Linux, etc.";
const siteName = "amas\.sh"

export const config = {
  name: siteName,
  author: "amas",
  url: "https://amas.sh",
  image: "https://amas.sh/amas.png",
  socials: {
    bsky: "https://bsky.app/profile/amas0.bsky.social",
    github: "https://github.com/amas0",
  },
  projects: [
  ],
  metadata: {
    description,
    title: siteName,
    metadataBase: new URL("https://amas.sh"),
    openGraph: {
      description,
      title: siteName,
      url: "/",
      images: [
        {
          url: "https://amas.sh/amas.png",
          width: 256,
          height: 256,
        },
      ],
      type: "website",
    },
  },
};
