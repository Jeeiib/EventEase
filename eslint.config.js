// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const i18next = require('eslint-plugin-i18next');

// Attributs qui portent du texte visible ou lu par VoiceOver.
const TEXT_ATTRIBUTES = '/^(accessibilityLabel|accessibilityHint|placeholder|title|label)$/';
const UI_FOLDERS = ['src/screens/**', 'src/components/**', 'src/navigation/**'];

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Aucun texte visible en dur dans l'interface : tout passe par t().
    files: UI_FOLDERS,
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
      // i18next/no-literal-string ne contrôle pas les attributs : on les interdit ici.
      'no-restricted-syntax': [
        'error',
        ...[
          `JSXAttribute[name.name=${TEXT_ATTRIBUTES}] > Literal`,
          `JSXAttribute[name.name=${TEXT_ATTRIBUTES}] > JSXExpressionContainer > Literal`,
          `JSXAttribute[name.name=${TEXT_ATTRIBUTES}] > JSXExpressionContainer > TemplateLiteral[expressions.length=0]`,
        ].map((selector) => ({
          selector,
          message: 'Texte visible en dur interdit : passe par t() (src/i18n/fr.ts).',
        })),
      ],
    },
  },
]);
