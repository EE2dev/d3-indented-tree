export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        // CommonJS globals (for compatibility)
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    rules: {
      "indent": ["warn", 2],
      "linebreak-style": ["warn", "unix"],
      "quotes": ["warn", "double"],
      "no-console": "off",
      "semi": ["error", "always"],
    },
  },
];

