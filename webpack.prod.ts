const merge = require("webpack-merge");
const common = require("./webpack.common.ts");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const HtmlWebpackPlugin = require("html-webpack-plugin");
import webpack from "webpack";

const config: webpack.Configuration = merge(common, {
  mode: "production",
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      chunks: "all"
    },
    //runtimeChunk: "single", //入口多的时候可以用
    minimizer: [
      new TerserJSPlugin({ cache: true, parallel: true, sourceMap: true }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it uses publicPath in webpackOptions.output
              publicPath: "../"
              /*   hmr: process.env.NODE_ENV === "development" */
            }
          },
          "css-loader"
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "prod",
      filename: "index.html",
      template: "public/index.html"
      /*  inject: true */
    }),
    new MiniCssExtractPlugin({
      filename: "./css/[name].[contenthash].css",
      chunkFilename: "./css/[id].[contenthash].css"
    })
  ],
  devtool: "source-map"
});
export default config;
