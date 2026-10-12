import type { Options } from "rehype-pretty-code";
import { createHighlighter } from "shiki";
import stanGrammar from "./grammars/stan.json";

export const codeHighlightOptions: Options = {
  theme: {
    light: "github-light",
    dark: "github-dark-dimmed",
  },
  getHighlighter: (options) =>
    createHighlighter({
      ...options,
      langs: [...(options.langs ?? []), { ...stanGrammar, name: "stan" }],
    }),
};
