import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Cosmetic-only: flags valid natural-language apostrophes (don't, you're,
      // it's) in marketing copy. The rule is widely considered noisy in React
      // codebases that render long-form English. Escaping every apostrophe
      // adds no safety and harms diff readability. We keep every other a11y
      // and React rule on.
      "react/no-unescaped-entities": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
