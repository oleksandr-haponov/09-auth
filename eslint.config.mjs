// eslint.config.mjs
import next from "eslint-config-next";

export default [
  // Игноры — отдельным объектом
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.vercel/**",
      "**/dist/**",
      "**/out/**",
      "**/coverage/**"
    ]
  },

  // Базовый конфиг Next
  ...next(),

  // Глобальные правила проекта
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": ["warn", { allowObjectTypes: true }]
    }
  },

  // Отключение правила для route handlers
  {
    files: ["app/api/**/route.ts"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "off"
    }
  }
];