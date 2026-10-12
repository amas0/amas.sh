This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Use Node.js 22.x (also configured in `package.json` for Vercel).

```sh
npm ci
npm run dev
```

## Validation

```sh
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
```

TypeScript stays on 6.0 and ESLint on 9 until the Next.js lint plugins support
TypeScript 7 and ESLint 10. Node types match the Node 22 runtime.

The KaTeX override updates the transitive math-rendering dependency to a patched
release; remove it when `rehype-katex` and `remark-math` support that release directly.
The full `npm audit` still reports the unpatched `braces` advisory through Next.js's
development-only lint tooling. Do not use `npm audit fix --force`: its proposed
Next.js ESLint configuration downgrade is not a compatible fix.

## Next steps

1. Edit `config.ts` with your socials, URL, site name, and SEO information
2. Edit styling in `app/globals.css` files
3. Add posts by making markdown files in the `posts/` dir
4. Update `app/feed.xml/route.ts` with your RSS information
5. Deploy your website on [Vercel](https://vercel.com/zeevos-projects)
   1. Set the Node.js version to 22.x and use `npm ci` as the Install Command. Remove any previous `npm install --force` override.
