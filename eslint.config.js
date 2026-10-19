// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const i18next = require('eslint-plugin-i18next');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // Aucun texte visible en dur dans l'interface : tout passe par t().
    files: ['src/screens/**', 'src/components/**', 'src/navigation/**'],
    plugins: { i18next },
    rules: {
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          'jsx-attributes': {
            include: ['^(accessibilityLabel|accessibilityHint|placeholder|title|label)$'],
          },
        },
      ],
    },
  },
]);
