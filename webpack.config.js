const path = require("path");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const BG_IMAGES_DIRNAME = "bgimages";

const distPath = path.resolve(__dirname, "dist");
module.exports = (env, argv) => {
  return {
    devServer: {
      contentBase: distPath,
      compress: argv.mode === "production",
      historyApiFallback: {
        rewrites: [
          // translate everything that is in a sub-directory (e.g. components/form) and contains a dot
          // (e.g. components/form/main.js) to the root (e.g. main.js).
          {
            from: /\/.*?\/(.*\..*)$/,
            to: function (context) {
              return "/" + context.match[1];
            },
          },
        ],
        verbose: true,
      },
      port: 8000,
    },
    entry: "./main.js",
    output: {
      path: distPath,
      filename: "main.js",
      webassemblyModuleFilename: "main.wasm",
    },
    plugins: [
      new CopyWebpackPlugin([{ from: "./static", to: distPath }]),
      new WasmPackPlugin({
        crateDirectory: ".",
        extraArgs: "--no-typescript",
      }),
    ],
    watch: argv.mode !== "production",
  };
};
