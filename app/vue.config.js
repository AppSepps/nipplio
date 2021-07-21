module.exports = {
    configureWebpack: {
        // Webpack configuration applied to web builds and the electron renderer process
        target: process.env.NODE_ENV !== 'production' ? 'web' : 'electron-renderer',
        //target: 'electron-renderer'
        //target: 'web'
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
                    category: 'public.app-category.entertainment',
                },
            },
        },
    },
    transpileDependencies: ['quasar'],
}
