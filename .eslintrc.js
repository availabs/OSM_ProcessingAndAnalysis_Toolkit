// https://github.com/typescript-eslint/typescript-eslint/blob/5e2a9931ded2c7b563598a4170cd7ee9390afd14/docs/getting-started/linting/README.md#usage-with-prettier
// https://github.com/typescript-eslint/typescript-eslint/blob/5e2a9931ded2c7b563598a4170cd7ee9390afd14/docs/getting-started/linting/TYPED_LINTING.md

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  env: {
    browser: false,
    node: true,
  },
  extends: ["prettier"],
  rules: {
    semi: "off",
    "@typescript-eslint/semi": "error",
  },
  settings: {
    // https://github.com/benmosher/eslint-plugin-import/issues/1285#issuecomment-463683667
    "import/parsers": {
      "@typescript-eslint/parser": ["js", "ts"],
    },
  },
};
