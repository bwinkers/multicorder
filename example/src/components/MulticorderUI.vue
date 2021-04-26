<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <Multicorder
          :video-source="videoSource"
          @error="onError"
          @cameras="onCameras"
          @video-live="onVideoLive"
          @view-change="onViewChange"
          ref="multicorder"
        />
        <v-select
          :items="videoSourceList"
          v-model="videoSource"
          label="Select video input"
        />
        <div v-show="view=='video'" v-if="controls=='liveVideo'">
          <v-btn class="mx-2" @click="videoRecord" fab mdi-icon x-small light
              ><v-icon x-large color="red">mdi-record-circle</v-icon></v-btn
            >
            <v-btn class="mx-2" @click="videoSnapshot" fab mdi-icon x-small light
              ><v-icon x-large>mdi-camera-iris</v-icon></v-btn
            >
            <v-btn class="mx-2" @click="videoClose" fab mdi-icon x-small light
              ><v-icon x-large>mdi-close-circle</v-icon></v-btn
            >
        </div>
        <div v-show="view=='video'" v-if="controls=='recordingVideo'">
          <v-btn class="mx-2" @click="videoStopRecording" fab mdi-icon x-small light
              ><v-icon x-large>mdi-stop-circle</v-icon></v-btn
            >
            <v-btn
              class="mx-2"
              @click="pause"
              fab
              mdi-icon
              x-small
              light
              v-if="!isPaused"
              ><v-icon x-large>mdi-pause-circle</v-icon></v-btn
            >
            <v-btn
              class="mx-2"
              @click="resume"
              fab
              mdi-icon
              x-small
              dark
              v-if="isPaused"
              ><v-icon x-large>mdi-pause-circle</v-icon></v-btn
            >
            <v-btn class="mx-2" @click="videoSnapshot" fab mdi-icon x-small light
              ><v-icon x-large>mdi-camera-iris</v-icon></v-btn
            >
        </div>
        <div v-show="view=='snapshot'">
          <v-btn class="mx-2" @click="closeSnapshot" fab mdi-icon x-small light
              ><v-icon x-large color="red">mdi-close-circle</v-icon></v-btn
            >
            <v-btn class="mx-2" @click="snapshotDownload" fab mdi-icon x-small light
              ><v-icon x-large>mdi-download-circle</v-icon></v-btn
            >
        </div>  
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Multicorder from "../../../src/lib-components/multicorder.vue";

export default {
  name: "MulticorderDemo",
  components: {
    Multicorder,
  },
  data() {
    return {
      controls: null,
      videoSource: null,
      videoSourceList: [],
      isPaused: false,
      view: 'video'
    };
  },
  methods: {
    onError(error) {
      console.log("Error emitted", error);
    },
    onCameras(cameras) {
      console.log("Available cameras", cameras);
      /**
       * We are implementing a `multicorder` with camera and screen support.
       * We need to create a list that groups the items for a `v-select` component.
       * We use the `listFromCameras` helper function provided by the component.
       * The Multicorder component maintains a list of `cameras` if we need them independently.
       */
      this.videoSourceList = this.$refs.multicorder.listFromCameras(cameras);
    },
    onVideoLive() {
      this.controls = 'liveVideo';
    },
    onViewChange(view) {
      console.log(view);
      this.view = view;
    },
    videoRecord() {
      this.controls = 'recordingVideo';
      this.$refs.multicorder.startVideoRecording();
    },
    videoSnapshot() {
      this.view = 'snapshot';
      this.$refs.multicorder.videoSnapshot();
    },
    videoClose() {
      this.$refs.multicorder.stopVideo();
      this.controls = null;
      this.videoSource = null;
    },
    videoStopRecording() {
      this.controls = 'liveVideo';
      this.$refs.multicorder.stopRecording();
      // resume the video, minus recording
      this.resume();
    },
    resume() {
      this.isPaused = false;
      this.$refs.multicorder.resume();
    },
    pause() {
      this.isPaused = true;
      this.$refs.multicorder.pause();
    },
    closeSnapshot() {
      this.$refs.multicorder.closeSnapshot();
    },
    snapshotDownload() {
      this.$refs.multicorder.downloadSnapshot();
    },

  },
};
</script>
