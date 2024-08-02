import './styles/main.scss'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

import { Notify } from 'quasar'

export default {
    plugins: [Notify],
    config: {
        notify: {},
    },
}
