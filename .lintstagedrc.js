module.exports = {
  '*.ts': 'eslint --cache --fix --no-warn-ignored',
  '{eslint.config.mjs,eslint/**/*.mjs,tsconfig.json,package.json}': () => 'yarn lint',
};
