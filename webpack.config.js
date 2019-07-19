const path = require('path');

module.exports = {
    entry: './src/api-js-sdk.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'api-js-sdk.js',
        library: "api-js-sdk",
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "eslint-loader",
                options: {
                    emitWarning: true,
                    configFile: "./.eslintrc"
                }
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-proposal-object-rest-spread']
                    }
                }
            }
        ]       
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
}