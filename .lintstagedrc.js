module.exports = {
  '*.ts': 'eslint --cache --fix --no-warn-ignored',
  '{eslint.config.mjs,lint/**/*.mjs,tsconfig.json,package.json}': () => 'yarn lint:all',
};
