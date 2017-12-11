const webpack = require("webpack");
const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: {
		app: "./demo/index.ts",
		vendors: [
			"angular", "angular-ui-router"
		]
	},
	output: {
		filename: "[name].js",
		path: path.resolve("dist/demo")
	},
	resolve: {
		extensions: [".ts", ".js"],
		modules: [
			path.resolve(),
			path.resolve("demo"),
			path.resolve("node_modules")
		]
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: "ts-loader",
				options: {
					configFile: path.resolve("tsconfig.json")
				},
				exclude: /node_modules/
			},
			{
				test: /\.html$/,
				loader: "html-loader",
				exclude: [/node_modules/, /demo\/index\.html$/]
			},
			{
				test: /\.json$/,
				loader: "file-loader",
				options: {
					name: "[path][name].[ext]"
				}
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin("./dist"),
		new CopyWebpackPlugin([
			{ context: "demo", from: "**/*.json" }
		]),
		new webpack.optimize.CommonsChunkPlugin({
			names: ["vendors"]
		}),
		new HtmlWebpackPlugin({
			template: path.resolve("demo/index.html")
		})
	],
	devtool: "inline-source-map",
	devServer: {
		contentBase: path.resolve("dist"),
		compress: true,
		port: 8000
	}
};