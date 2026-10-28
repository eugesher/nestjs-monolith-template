const path = require('path');
const { TsCheckerRspackPlugin } = require('ts-checker-rspack-plugin');

module.exports = (options, rspack) => {
  const { entry, plugins, resolve } = options;
  const match = typeof entry === 'string' ? entry.match(/apps\/([^/]+)\/src\/main\.ts$/) : null;

  if (!match) {
    console.error('App build failed: could not derive the app name from the rspack entry.');

    process.exit(1);
  }

  const appName = match[1];

  return {
    ...options,
    devtool: false,
    output: {
      path: path.resolve(__dirname, 'dist/apps', appName),
      filename: 'main.js',
      library: { type: 'commonjs2' },
      clean: true,
    },
    resolve: {
      ...resolve,
      tsConfig: path.resolve(__dirname, 'tsconfig.json'),
      plugins: [],
    },
    plugins: [
      ...(plugins || []),
      new TsCheckerRspackPlugin({
        typescript: { configFile: path.resolve(__dirname, 'apps', appName, 'tsconfig.app.json') },
      }),
    ],
    optimization: {
      ...options.optimization,
      minimize: true,
      minimizer: [
        new rspack.SwcJsMinimizerRspackPlugin({
          extractComments: false,
          minimizerOptions: {
            minify: false,
            compress: false,
            mangle: false,
            format: { comments: false },
          },
        }),
      ],
    },
  };
};
