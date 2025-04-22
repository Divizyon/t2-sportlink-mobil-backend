module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // Kullanılmayan değişkenlere izin ver (alt çizgi ile başlıyorsa)
    '@typescript-eslint/no-unused-vars': ['error', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'caughtErrorsIgnorePattern': '^_'
    }],
    // Boş fonksiyonlara izin ver
    '@typescript-eslint/no-empty-function': 'off',
    // any tipine izin ver (gerektiğinde)
    '@typescript-eslint/no-explicit-any': 'off',
    // Explicit return tipini opsiyonel yap
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
}; 