import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    files: ["src/**/*.js"],
    ignores: ["node_modules/**", "dist/**", "src/utils/**"],
    rules: {
      "no-console": "warn",
    },
  },

  // Check formatting
  prettier,
]);
