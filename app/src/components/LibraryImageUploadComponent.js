import { createUploaderComponent } from "quasar";
import { computed, ref, watch } from "vue";

// Firebase stuff
import {
  getDownloadURL,
  ref as firebaseRef,
  uploadBytesResumable,
} from "@firebase/storage";

import {getStorage} from '@firebase/storage'
//? importing 👆 from local firebase file because it is attached to our app ~ `storage` here is the value returned by getStorage(firebaseApp)

// Export a Vue component
export default createUploaderComponent({
  // defining the QUploader plugin here
  name: "FirebaseUploader", // your component's name
  props: {
    fileName: {
      type: String
    },
    /** Whether all inputs should be blocked when upload is in progress or not */
    blocking: {
      type: Boolean,
      default: true,
    },
    /** The firebase storage directory your files will be uploaded to */
    //! This assumes that each instance of FirebaseUploader will only upload to a specific directory - customization implementation would be worth considering
    directory: {
      type: String,
      default: "/libraryThumbnails",
    },
  },

  emits: [
    // ...your custom events name list
  ],

  injectPlugin({ props, emit, helpers }) {
    let uploadTaskList = ref([]);
    let uploadProgressList = ref([]);
    let uploadInProgress = ref(false);

    let uploadedFiles = ref([]);

    // Using watcher because computed isn't triggered when the progress list array is updated
    watch(
        () => uploadProgressList,
        () => {
          uploadInProgress.value = false;
          if (uploadProgressList.value.length) {
            uploadInProgress.value = uploadProgressList.value.reduce(
                (prev, curr) => prev || curr,
                false
            );

            // Uploads complete - emit uploaded event with file details
            emit("uploaded", uploadedFiles);
          }
        },
        { deep: true }
    );

    // [ REQUIRED! ]
    // We're working on uploading files
    const isUploading = computed(() => uploadInProgress.value);

    /** Shows overlay on top of the
     uploader signaling it's waiting
     on something (blocks all controls) */
    const isBusy = computed(() => {
      return props.blocking ? uploadInProgress.value : false;
    });

    // [ REQUIRED! ]
    // Cancel all uploads
    function abort() {
      uploadTaskList.value.forEach((uploadTask) => {
        uploadTask.cancel();
      });
    }

    // [ REQUIRED! ]
    // Start the uploading process
    function upload() {
      // Reset uploads
      uploadTaskList.value = [];
      uploadProgressList.value = [];

      helpers.queuedFiles.value.forEach((fileToUpload, i) => {
        // No point uploading the file if it has already been uploaded before
        if (helpers.uploadedFiles.value.includes(fileToUpload)) return;

        //? 👇 This can be whatever you want ~ can use UUID to generate unique file names
        const fileName = props.fileName
        const storageRef = firebaseRef(
            getStorage(),
            `${props.directory}/${fileName}`
        );

        const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

        uploadTaskList.value = [...uploadTaskList.value, uploadTask];

        uploadTask.on(
            "state_changed",
            (snapshot) => {
              helpers.updateFileStatus(
                  fileToUpload,
                  "uploading",
                  snapshot.bytesTransferred
              );

              uploadProgressList.value[i] = snapshot.state === "running";
            },
            (err) => {
              console.error(
                  "Something went wrong while trying to upload the file.",
                  err
              );
              helpers.updateFileStatus(
                  fileToUpload,
                  "failed",
                  uploadTask.snapshot.bytesTransferred
              );

              uploadProgressList.value[i] = false;
            },
            async () => {
              const uploadUrl = await getDownloadURL(uploadTask.snapshot.ref);

              // The upload for all files will be accessible when all files are done uploading
              uploadedFiles.value.push({
                originalFile: fileToUpload,
                uploadUrl,
              });

              const { bytesTransferred } = uploadTask.snapshot;

              helpers.updateFileStatus(
                  fileToUpload,
                  "uploaded",
                  bytesTransferred
              );

              helpers.uploadedFiles.value = [
                ...helpers.uploadedFiles.value,
                fileToUpload,
              ];

              helpers.uploadedSize.value += bytesTransferred;

              uploadProgressList.value[i] = false;
            }
        );
      });
    }

    return {
      isUploading,
      isBusy,

      abort,
      upload,
    };
  },
});