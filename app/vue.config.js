module.exports = {
    configureWebpack: {
        // Webpack configuration applied to web builds and the electron renderer process
        //target: process.env.WEBPACK_DEV_SERVER_URL ? '' : 'electron-renderer',
    },
    pluginOptions: {
        quasar: {
            importStrategy: 'kebab',
            rtlSupport: true,
        },
        electronBuilder: {
            nodeIntegration: true,
            publish: ['github'],
            builderOptions: {
                appId: 'com.appsepps.nipplio',
                mac: {
                    category: 'public.app-category.entertainment',
                },
            },
        },
    },
    transpileDependencies: ['quasar'],
}
