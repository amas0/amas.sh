const description = "SITE. SITE and other SITE.";

export const config = {
  name: "amas\.sh",
  author: "amas",
  url: "https://amas.sh",
  image: "",
  socials: {
    bsky: "@amas0.bsky.social",
    github: "amas0",
  },
  projects: [
    {
      name: "cillum",
      url: "#",
    },
    {
      name: "exercitation",
      url: "#",
    },
    {
      name: "nulla",
      url: "#",
    },
    {
      name: "labore",
      url: "#",
    },
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
