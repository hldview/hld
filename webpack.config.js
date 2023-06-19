// 引入node的path模块;
const path = require('path');
// 引入VueLoaderPlugin插件，vue-loader的使用需要该插件的支持;
const { VueLoaderPlugin } = require('vue-loader');
// 引入HTMLPlugin，为webpack对html提供支持,帮助生成 HTML 文件;
const HTMLPlugin = require('html-webpack-plugin');
// 引入webpack;
const webpack = require('webpack');
// 抽离css文件插件,避免样式通过js写入;
const ExtractPlugin = require('extract-text-webpack-plugin');



// 通过cross-env在package.json中设置的变量判断是不是开发环境打包;
const isDev = process.env.NODE_ENV === 'development';

const config = {
    // 设置项目运行的环境web、node;
    target: 'web',
    // 配置webpack的入口js文件;
    entry: path.join(__dirname, 'src/index.js'),
    // 配置打包以后输出的js出口文件;
    output: {
        // 打包后的js输出文件名称;
        filename: 'bundle.js',
        // 打包后的输出文件夹名称及路径;
        path: path.join(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                // 正则表达式匹配以.vue结尾的文件;
                test: /\.vue$/,
                // 使用vue-loader 处理vue文件;
                loader: 'vue-loader'
            },
            {
                test: /\.css$/,
                // 使用css-loader只能处理CSS文件，
                // loader: 'css=loader'
                // 通过use 使用两个loader可以处理HTML中的style和外部css文件;
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(gif|jpg|jpeg|png|svg)/,
                use: [
                    {
                        // 将突破转为转base64格式,减少请求;
                        loader: 'url-loader',
                        // loader配置
                        options: {
                            // 小于限制大小的图标转化为base64;
                            limit: 1024,
                            // 打包后的图片名称,[name]是原输入的名称;
                            name: '[name]'
                        }
                    }
                ]
            }
        ]
    },
    // 插件，一个数组，支持很多插件;
    plugins: [
        // Vue-loader在15.*之后的版本都是 vue-loader的使用都是需要伴生 VueLoaderPlugin的,;
        new VueLoaderPlugin(),
        new HTMLPlugin(),
        // 将环境变量设置为全局变量，这样在所有文件都能访问定义的变量;
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: isDev ? '"development"' : '"production"'
            }
        })
    ],
};

// 如果是开发环境打包;
if (isDev){
    // 网页代码调试配置;
    config.devtool = '#cheap-module-eval-source-map';
    // 修改模块配置;
    config.module.rules.push({

    });
    // 配置一下 devServer，在开发模式下，DevServer 提供虚拟服务器，让我们进行开发和调试;
    config.devServer = {
        // 监听端口;
        port: 8000,
        // 设置为0.0.0.0 相比设置为localhost 可以让ip也能访问;
        host: '0.0.0.0',
        // 在网页上显示错误;
        overlay: {
            errors: true,
        },
        // 启动devServer的时候自动打开浏览器;
        open: true,
        //  webpack不认识的地址映射;
        // historyApiFallback: {}
        // 组件热更新，不去重载刷新整个页面;
        hot: true
    };
    config.plugins.push(
        // 热加载插件;
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NodeEnvironmentPlugin()
    )
} else {
    // 修改输入;
    config.entry = {
        app: path.join(__dirname, 'src/index.js'),
        // 类库文件单独打包在一个JS，这些不是经常改动的js可以在浏览器缓存，从而优化加载;
        vendor: ['vue']
    };
    // 修改输出;chunkhash不同于hash，chunkhash每次创建时不一样；
    config.output.filename = '[name].[chunkhash:8].js';
    // 修改模块配置;
    config.module.rules.push(
        {
            test: /\.styl/,
            use: ExtractPlugin.extract({
                fallback: 'style-loader',
                use: [
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                        }
                    },
                    'stylus-loader'
                ]
            })
        }
    );
    // 添加插件;
    config.plugins.push(
        new ExtractPlugin('styles.[contentHash:8].css'),
        // 类库文件单独打包插件;
        new webpack.optimize.SplitChunksPlugin({
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all"
                }
            }
        }),
        // 把webpack相关的js单独打包到一个文件;
        new webpack.optimize.RuntimeChunkPlugin({
            name: "manifest"
        }),
    )
}

module.exports = config;