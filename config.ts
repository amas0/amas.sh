const description = "SITE. SITE and other SITE.";

export const config = {
  name: "SITE",
  author: "AUTHOR",
  socials: {
    bsky: "AUTHORASDFG1234",
    github: "AUTHORASDFG1234",
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
