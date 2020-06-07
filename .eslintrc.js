module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
  ],
  plugins: ["@typescript-eslint"],
  rules: {
    "prettier/prettier": 1,
    eqeqeq: ["warn", "always"],
    "@typescript-eslint/no-var-requires": 0,
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  parser: "@typescript-eslint/parser",
};
