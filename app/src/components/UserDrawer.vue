<template>
    <q-drawer
        side="right"
        show-if-above
        :width="350"
        :breakpoint="600"
        class="bg-grey-10"
    >
        <q-scroll-area class="fit">
            <div class="q-pa-sm">
                <div v-if="boardUsers && boardUsers.length > 0">
                    <q-list dark>
                        <q-item-label header class="text-uppercase"
                            >Online – {{ connectedUsers.length }}</q-item-label
                        >
                        <user
                            v-for="boardUser in connectedUsers"
                            :key="boardUser.id"
                            :user="boardUser"
                            :isCurrentUser="user.uid === boardUser.id"
                            :muted="mutedUsers.includes(boardUser.id)"
                            :speaker="boardUser.id === speaker"
                        />
                    </q-list>
                    <q-list dark>
                        <q-item-label header class="text-uppercase"
                            >Offline –
                            {{ disconnectedUsers.length }}</q-item-label
                        >
                        <user
                            v-for="boardUser in disconnectedUsers"
                            :key="boardUser.id"
                            :user="boardUser"
                            :isCurrentUser="user.uid === boardUser.id"
                            :muted="mutedUsers.includes(boardUser.id)"
                            :speaker="boardUser.id === speaker"
                        />
                    </q-list>
                </div>
            </div>
        </q-scroll-area>
    </q-drawer>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import User from '../components/User'

export default {
    name: 'UserDrawer',
    components: {
        User,
    },
    computed: {
        ...mapGetters('user', ['connectedUsers', 'disconnectedUsers']),
        ...mapState({
            boardUsers: (state) => state.user.boardUsers,
            mutedUsers: (state) => state.user.mutedUsers,
            speaker: (state) => state.user.speaker,
            user: (state) => state.user.user,
        }),
    },
}
</script>

<style></style>
