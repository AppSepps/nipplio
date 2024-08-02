import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import electron from 'vite-plugin-electron/simple'


export default defineConfig(({ command }) => {

    const isElectron = process.env.VUE_APP_TARGET === 'electron'
    const isBuild = command.includes('build')

    return {
        plugins: [
            vue({
                template: { transformAssetUrls },
            }),
            quasar({
                sassVariables: './src/styles/quasar-variables.scss',
            }),
            isElectron && electron({
                main: {
                    entry: 'electron/main.js',
                    vite: {
                        build: {
                            minify: isBuild,
                        },
                    },
                },
                preload: {
                    input: 'electron/preload.js',
                    vite: {
                        build: {
                            minify: isBuild,
                        },
                    },
                },
                renderer: {},
            }),
        ],
        resolve: {
            extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue'],
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
    }
})