module.exports = {
    pluginOptions: {
        quasar: {
            importStrategy: 'kebab',
            rtlSupport: true,
        },
        electronBuilder: {
            nodeIntegration: false,
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
