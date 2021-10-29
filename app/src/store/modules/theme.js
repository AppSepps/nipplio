import {setCssVar} from 'quasar'
import firebase from "firebase";

function initialState() {
    return {
        themes: [
            {
                id: -1,
                primary: '#6ab547',
                secondary: '#d81e5b',
                name: 'Tulip (default)',
            },
            {
                id: 0,
                primary: '#2d93ad',
                secondary: '#313d5a',
                name: 'Submarine',
            },
            {
                id: 1,
                primary: '#e6af2e',
                secondary: '#dd403a',
                name: 'Vulcano',
            },
            {
                id: 2,
                primary: '#b8b42d',
                secondary: '#697a21',
                name: 'Camouflage',
            },
            {
                id: 3,
                primary: '#f43b86',
                secondary: '#7952b3',
                name: 'Retro',
            },
            {
                id: 4,
                primary: '#9e0059',
                secondary: '#ee5622',
                name: 'Halloween',
            },
            {
                id: 5,
                primary: '#c52233',
                secondary: '#23856d',
                name: 'Christmas',
            },
        ],
        currentThemeId: -1,
    }
}

const getters = {}

const actions = {
    setTheme({ commit, state, dispatch }, { id = null, manuallyClicked = false }) {
        const themeId = id !== null ? id : state.currentThemeId
        const theme = state.themes.filter((t) => t.id === themeId)[0]

        if (theme) {
            setCssVar('primary', theme.primary)
            setCssVar('secondary', theme.secondary)

            commit('setThemeId', themeId)
            if (manuallyClicked) {
                firebase.analytics().logEvent('select_theme', {
                    themeId
                })
                dispatch('user/logAnalytics', {}, {root: true})
            }
        }
    },
}

const mutations = {
    setThemeId(state, id) {
        state.currentThemeId = id
    },
}

export default {
    namespaced: true,
    state: initialState,
    getters,
    actions,
    mutations,
}
