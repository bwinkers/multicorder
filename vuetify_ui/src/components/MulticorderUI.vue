<template>
  <v-container class="text-center  ma-0 pa-0">
    <v-row class="text-center ">
      <v-col cols="12">
        <div class="videobox">
          <Multicorder 
            :video-source="videoSource"
            @error="onError"
            @cameras="onCameras"
            @video-live="onVideoLive"
            @view-change="onViewChange"
            @new-recording="onNewRecording"
            @delete-recording="onDeleteRecording"
            @player-loaded="onPlayerLoaded"
            ref="multicorder"
            :videoTypes="videoTypes"
          />
        </div>
        <v-select
          v-if="videoSource == null"
          v-show="view == 'video'"
          :items="videoSourceList"
          :return-object="true"
          v-model="videoSource"
          label="Select video input"
        />
        <div
          v-if="videoSource"
          align="right"
          background-color="black"
          class="grey--text videobox"
        >
          {{ videoSource.text }}
          <v-icon @click="videoClose" color="grey">mdi-close-circle</v-icon>
        </div>



        <v-row v-show="view == 'videoPlayer'" class="text-center  mt-3 pt-0">
          <v-col cols="auto" align="left">
            <v-icon class="mx-2" large color="red" v-if="!isPlayerMuted" @click="togglePlayerMuted"
              >mdi-speaker</v-icon
            >
            <v-icon class="mx-2" large v-if="isPlayerMuted" @click="togglePlayerMuted"
              >mdi-speaker-off</v-icon
            >
          </v-col>
          <v-col align="center">
            <v-btn class="mx-2" @click="playRecording" fab mdi-icon x-small light
              ><v-icon x-large color="red">mdi-play-circle</v-icon></v-btn
            >
            <v-btn class="mx-2" @click="downloadRecording" fab mdi-icon x-small light
              ><v-icon x-large>mdi-download-circle</v-icon></v-btn
            >
            <v-btn class="mx-2" @click="deleteRecording" fab mdi-icon x-small light
              ><v-icon x-large color="red">mdi-delete-circle</v-icon></v-btn
            >
          </v-col>
          <v-col cols="auto" align="right">
            <v-icon x-large @click="videoSnapshot" color="teal">mdi-camera</v-icon>
          </v-col>
        </v-row>





        <v-row v-show="view == 'video' && videoSource != null">
          <v-col  cols="auto" align="center">
            <v-icon large color="red" v-if="!isMuted" @click="toggleMuted"
              >mdi-microphone</v-icon
            >
            <v-icon large v-if="isMuted" @click="toggleMuted">mdi-microphone-off</v-icon>
          </v-col>
          <v-col align="center">
            <v-btn v-show="controls == 'liveVideo'" class="mx-2" @click="videoRecord" fab mdi-icon x-small light
              ><v-icon x-large color="red">mdi-record-circle</v-icon></v-btn
            >
            <v-btn v-show="controls == 'recordingVideo'" class="mx-2" @click="videoStopRecording" fab mdi-icon x-small light
              ><v-icon x-large color="red">mdi-stop-circle</v-icon></v-btn
            >
            <v-btn v-show="controls == 'recordingVideo'" class="mx-2" @click="pause" fab mdi-icon x-small light v-if="!isPaused"
              ><v-icon x-large>mdi-pause-circle</v-icon></v-btn
            >
            <v-btn v-show="controls == 'recordingVideo'" class="mx-2" @click="resume" fab mdi-icon x-small dark v-if="isPaused"
              ><v-icon x-large>mdi-pause-circle</v-icon></v-btn
            >
          </v-col>
          <v-col  cols="auto" align="center">
            <v-icon x-large @click="videoSnapshot" color="teal">mdi-camera</v-icon>
          </v-col>
        </v-row>

        <v-row v-show="view == 'snapshot'">
          <v-col>
            <v-btn class="mx-2" @click="closeSnapshot" fab mdi-icon x-small light
              ><v-icon x-large color="red">mdi-close-circle</v-icon></v-btn
            >
            <v-btn class="mx-2" @click="snapshotDownload" fab mdi-icon x-small light
              ><v-icon x-large>mdi-download-circle</v-icon></v-btn
            >
          </v-col>
        </v-row>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
/**
 * For Hot reload load the `*.vue` files from the parent `/src/` directly.
 */
// import { Multicorder } from "multicorder";
import { Multicorder } from "../../../src/lib-components/index.js";

export default {
  name: "MulticorderUI",
  components: {
    Multicorder,
  },
  props: {
    videoTypes: {
      type: Array,
      default: () => {
        return ["camera", "screen"];
      },
    },
    recorderMode: {
      type: String,
      default: "single",
    },
  },
  data() {
    return {
      controls: null,
      videoSource: null,
      videoSourceList: [],
      isPaused: false,
      isPlayerPaused: false,
      isMuted: true,
      isPlayerMuted: true,
      view: "video",
      recordings: [], // local sparsed list of recording data
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
      this.controls = "liveVideo";
    },
    onViewChange(view) {
      console.log(view);
      this.view = view;
    },
    onNewRecording(recording) {
      this.recordings.push(recording);
      if (this.recorderMode === "single") {
        // Load the video into the player and force disposition
        this.view = "videoPlayer";
        this.loadRecording[0];
      }
    },
    onDeleteRecording(index) {
      this.recordings.splice(index, 1);
    },
    onPlayerLoaded() {
      //this.playRecording();
    },
    videoRecord() {
      this.controls = "recordingVideo";
      this.$refs.multicorder.startVideoRecording();
    },
    videoSnapshot() {
      this.view = "snapshot";
      this.$refs.multicorder.videoSnapshot();
    },
    videoClose() {
      this.$refs.multicorder.stopVideo();
      this.view = "video";
      this.controls = "liveVideo";
      this.videoSource = null;
    },
    videoStopRecording() {
      this.$refs.multicorder.stopRecording();
      // resume the video, minus recording
      //this.resume();
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
    downloadRecording(index) {
      this.$refs.multicorder.downloadRecording(index);
    },
    deleteRecording(index) {
      this.$refs.multicorder.deleteRecording(index);
    },
    async loadRecording(index) {
      await this.$refs.multicorder.loadRecording(index);
      this.playRecording();
    },
    playRecording() {
      this.isPlayerPaused = false;
      this.$refs.multicorder.playRecording();
    },
    pausePlayer() {
      this.isPlayerPaused = true;
      this.$refs.multicorder.pausePlayer();
    },
    resumePlayer() {
      this.isPlayerPaused = false;
      this.$refs.multicorder.resumePlayer();
    },
    deletePlayerRecording() {
      this.$refs.multicorder.deletePlayerRecording();
    },
    closePlayer() {
      this.$refs.multicorder.closePlayer();
    },
    toggleMuted() {
      this.isMuted = !this.isMuted;
    },
    togglePlayerMuted() {
      this.isPlayerMuted = !this.isPlayerMuted;
    },
  },
};
</script>

<style scoped>
.videobox {
  background-color: black;
}
</style>
