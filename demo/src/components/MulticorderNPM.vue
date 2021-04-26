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
          @new-recording="onNewRecording"
          @delete-recording="onDeleteRecording"
          @player-loaded="onPlayerLoaded"
          ref="multicorder"
        />
        <v-select
          v-show="view == 'video'"
          :items="videoSourceList"
          v-model="videoSource"
          label="Select video input"
        />
        <div v-show="view == 'video'" v-if="controls == 'liveVideo'">
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
        <div v-show="view == 'video'" v-if="controls == 'recordingVideo'">
          <v-btn class="mx-2" @click="videoStopRecording" fab mdi-icon x-small light
            ><v-icon x-large>mdi-stop-circle</v-icon></v-btn
          >
          <v-btn class="mx-2" @click="pause" fab mdi-icon x-small light v-if="!isPaused"
            ><v-icon x-large>mdi-pause-circle</v-icon></v-btn
          >
          <v-btn class="mx-2" @click="resume" fab mdi-icon x-small dark v-if="isPaused"
            ><v-icon x-large>mdi-pause-circle</v-icon></v-btn
          >
          <v-btn class="mx-2" @click="videoSnapshot" fab mdi-icon x-small light
            ><v-icon x-large>mdi-camera-iris</v-icon></v-btn
          >
        </div>
        <div v-show="view == 'videoPlayer'">
           <v-btn class="mr-4" @click="playRecording"  fab mdi-icon x-small light
            ><v-icon x-large>mdi-play-circle</v-icon></v-btn
          >
          <v-btn class="mx-2" @click="pausePlayer" fab mdi-icon x-small light v-if="!isPlayerPaused"
            ><v-icon x-large>mdi-pause-circle</v-icon></v-btn
          >
          <v-btn class="mx-2" @click="resumePlayer" fab mdi-icon x-small dark v-if="isPlayerPaused"
            ><v-icon x-large>mdi-pause-circle</v-icon></v-btn
          >
          <v-btn class="mr-4" @click="deletePlayerRecording"  fab mdi-icon x-small light
            ><v-icon x-large color="red">mdi-delete-circle</v-icon></v-btn
          >
          <v-btn class="mr-4" @click="closePlayer" fab mdi-icon x-small light
            ><v-icon x-large>mdi-close-circle</v-icon></v-btn
          >
        </div>
        <div v-show="view == 'snapshot'">
          <v-btn class="mx-2" @click="closeSnapshot" fab mdi-icon x-small light
            ><v-icon x-large color="red">mdi-close-circle</v-icon></v-btn
          >
          <v-btn class="mx-2" @click="snapshotDownload" fab mdi-icon x-small light
            ><v-icon x-large>mdi-download-circle</v-icon></v-btn
          >
        </div>
        <div v-if="recordings.length > 0">
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left"></th>
                  <th class="text-left">Name</th>
                  <th class="text-left">Size</th>
                  <th class="text-left">Download</th>
                  <th class="text-left">Play</th>
                  <th class="text-left">Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in recordings" :key="item.name">
                  <td class="text-left">{{ index + 1 }}</td>
                  <td class="text-left">{{ item.name }}</td>
                  <td class="text-left">{{ item.size }}</td>
                  <td class="text-left">
                    <v-btn icon medium @click="downloadRecording(index)"
                      ><v-icon medium color="green darken-2">mdi-download</v-icon></v-btn
                    >
                  </td>
                  <td class="text-left">
                    <v-icon medium color="green darken-2" @click="loadRecording(index)"
                      >mdi-play</v-icon
                    >
                  </td>
                  <td class="text-left">
                    <v-icon medium color="red lighten-1" @click="deleteRecording(index)"
                      >mdi-delete</v-icon
                    >
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
/**
 * The NPM can be either:
 * 1. A packed local version (npm pack)
 * 2. Installed througha normal NPM service.
 * 
 * DO NOT try and develop using the Vuetify code and `npm link`.
 */
import Multicorder from "multicorder";

export default {
  name: "MulticorderNPM",
  components: {
    Multicorder,
  },
  data() {
    return {
      controls: null,
      videoSource: null,
      videoSourceList: [],
      isPaused: false,
      isPlayerPaused: false,
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
      this.controls = null;
      this.videoSource = null;
    },
    videoStopRecording() {
      this.controls = "liveVideo";
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
  },
};
</script>
