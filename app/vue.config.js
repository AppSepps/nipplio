const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
    configureWebpack: config => {
        const isElectron = process.env.VUE_APP_TARGET === 'electron';

        if (isElectron) {
            config.target = 'electron-renderer'
        } else {
            config.target = 'web'
        }
        config.plugins = [
            new NodePolyfillPlugin(),
        ].concat(config.plugins || [])
    },
    pluginOptions: {
        quasar: {
            importStrategy: 'kebab',
            rtlSupport: true,
        },
        electronBuilder: {
            nodeIntegration: false,
            publish: ['github'],
            preload: 'src/preload.js',
            builderOptions: {
                appId: 'com.appsepps.nipplio',
                mac: {
                    target: {
                        target: 'default',
                        arch: 'universal',
                    },
                    icon: 'src/assets/icon.icns',
                    category: 'public.app-category.entertainment',
                },
                win: {
                    verifyUpdateCodeSignature: false,
                    icon: 'src/assets/icon.ico',
                },
            },
        },
    },
    transpileDependencies: ['quasar'],
}
