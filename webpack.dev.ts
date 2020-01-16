import webpack from "webpack";
const merge = require("webpack-merge");
const common = require("./webpack.common.ts");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const config: webpack.Configuration = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  devServer: {
    contentBase: "./dist",
    hot: true,
    clientLogLevel: "none",
    open: true,
    useLocalIp: true,
    host: "0.0.0.0",
    after: function(app: unknown, server: unknown, compiler: unknown): void {
      // do fancy stuff
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "1212",
      filename: "index.html",
      template: "public/index.html",
      inject: "head"
    })
  ]
});
export default config;
