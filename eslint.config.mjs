import next from "eslint-config-next";

export default [
  ...next(),
  {
    ignores: ["node_modules", ".next", ".vercel", "dist", "out", "coverage"],
    rules: {
      "@typescript-eslint/no-empty-object-type": ["warn", { allowObjectTypes: true }],
    },
  },
  {
    files: ["app/api/**/route.ts"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];
