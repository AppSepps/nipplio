<template>
    <q-dialog>
        <q-card style="width: 500px; max-width: 80vw">
            <q-form @submit="onSubmit">
                <q-card-section class="row items-center">
                    <div class="text-h6">Edit Playlist</div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup />
                </q-card-section>
                <q-card-section v-if="playlist">
                    <q-input
                        filled
                        v-model="name"
                        label="Name"
                        placeholder="Awesome playlist name"
                    />
                </q-card-section>
              <q-card-section v-if="playlist">
                <q-input
                    filled
                    v-model="description"
                    label="Description"
                    placeholder="Awesome description"
                />
              </q-card-section>
              <q-card-section>
                <library-image-upload-component
                    label="Upload photos"
                    auto-upload
                    @upload="addImage"
                    :fileName="id" />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                    no-caps
                    label="Save"
                    color="primary"
                    v-close-popup
                    type="submit"
                />
              </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script>


import LibraryImageUploadComponent from "@/components/LibraryImageUploadComponent";

export default {
    name: 'EditPlaylistDialog',
    components: {
      LibraryImageUploadComponent
    },
    data() {
        return {
            id: undefined,
            playlist: undefined,
            name: '',
            description: ''
        }
    },
    computed: {
    },
    mounted() {
        this.bus.on('openEditPlaylistDialog', ({playlist, id}) => {
          this.id = id
          this.playlist = playlist
          this.name = playlist.name ?? ''
          this.description = playlist.description ?? ''
        })
    },
    methods: {
      addImage (item) {
        console.log(item)
      },
        onSubmit() {
            this.$store.dispatch('library/updatePlaylistDetails', {
                ...this.playlist,
                id: this.id,
                name: this.name,
                description: this.description,
            })
        },
    },
}
</script>

<style></style>
