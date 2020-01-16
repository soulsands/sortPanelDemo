const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  entry: {
    app: "./src/index.ts"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      /* {
        enforce: "pre",
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        options: {
          cache: true,
          fix: true,
          emitError: false,
          failOnError: true
        }
      }, */
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },

      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              limit: 10000,
              name: "./img/[name].[hash:7].[ext]"
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              limit: 10000,
              name: "./fonts/[name].[hash:7].[ext]"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    // new CleanWebpackPlugin(['dist/*']) for < v2 versions of CleanWebpackPlugin
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin()
  ],
  output: {
    chunkFilename: "./js/[name].js",
    filename: "./js/IconSort.js",
    /*  filename: "[name].js" */
    path: path.resolve(__dirname, "dist"),
    library: "IconSort",
    libraryTarget: "umd",
    globalObject: "this"
  }
};
