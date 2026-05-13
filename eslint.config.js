import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import {defineConfig} from "eslint/config";

export default defineConfig([
  {
    ignores: ["dist/**", "build/**", "node_modules/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: {js},
    extends: ["js/recommended"],
    languageOptions: {globals: globals.browser}
  },
  {files: ["**/*.js"], languageOptions: {sourceType: "script"}},
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: { react: { version: "detect" } },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
    },
  },
]);
