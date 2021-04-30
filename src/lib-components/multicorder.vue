<template>
  <div class="multicorder">
    <video
      v-show="view == 'video'"
      ref="video"
      :width="width"
      :height="height"
      :src="source"
      :autoplay="autoplay"
      :playsinline="playsinline"
      muted="muted"
    />
    <img v-show="view == 'snapshot'" :src="snapshot" width="100%" height="100%" />
    <video
      v-show="view == 'videoPlayer'"
      ref="videoPlayer"
      :width="width"
      :height="height"
      :src="playerSource"
      :playsinline="playsinline"
    />
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";

export default /*#__PURE__*/ {
  name: "Multicorder",
  data() {
    return {
      source: null,
      playerSource: null,
      canvas: null,
      snapshot: null,
      cameras: [],
      camerasEmitted: null,
      browserScreenshareSupported: null,
      recorder: null,
      recordings: [],
      view: "video",
      nowPlaying: null,
    };
  },
  props: {
    videoSource: {
      type: Object,
      default: null,
    },
    width: {
      type: [Number, String],
      default: "100%",
    },
    height: {
      type: [Number, String],
      default: "100%",
    },
    autoplay: {
      type: Boolean,
      default: true,
    },
    playsinline: {
      type: Boolean,
      default: true,
    },
    recorderMuted: {
      type: Boolean,
      default: true,
    },
    playerMuted: {
      type: Boolean,
      default: true,
    },
    screenshotFormat: {
      type: String,
      default: "image/jpeg",
    },
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
    camerasHeader: {
      type: Array,
      default: () => {
        return [
          {
            divider: true,
            header: "Cameras",
          },
        ];
      },
    },
    staticVideoOptions: {
      type: Array,
      default: () => {
        return [
          {
            text: "Screen share",
            value: "screenshare",
          },
        ];
      },
    },
    staticVideoOptionsHeader: {
      type: Array,
      default: () => {
        return [
          {
            divider: true,
            header: "Screen Sharing",
          },
        ];
      },
    },
  },
  mounted() {
    this.initVideoOptions();
  },
  beforeDestroy() {
    this.stopVideo();
  },
  watch: {
    videoSource: function (videoSource) {
      this.changeVideoSource(videoSource);
    },
  },
  methods: {
    setView(view) {
      this.view = view;
      this.$emit("view-change", view);
    },
    changeVideoSource(videoSource) {
      this.stopVideo();
      this.$emit("video-change", videoSource);
      if (videoSource) {
        if (videoSource.value == "screenshare") {
          this.startScreenshare();
        } else {
          this.loadCamera(videoSource.value);
        }
      }
    },
    loadCamera(device) {
      let constraints = {
                          video: {
                              deviceId: { exact: device }
                              },
                          audio: { echoCancellation: true }
                          };

      if (this.resolution) {
        constraints.video.height = this.resolution.height;
        constraints.video.width = this.resolution.width;
      }

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => this.loadSrcStream(stream))
        .catch((error) => this.$emit("error", error));
    },
    startScreenshare() {
      try {
        navigator.mediaDevices
          .getDisplayMedia()
          .then((stream) => this.loadSrcStream(stream));
      } catch (err) {
        console.error("Error: " + err);
      }
    },
    loadSrcStream(stream) {
      if ("srcObject" in this.$refs.video) {
        // new browsers api
        this.$refs.video.srcObject = stream;
      } else {
        // old broswers
        this.source = window.HTMLMediaElement.srcObject(stream);
      }
      // Emit video start/live event
      this.$refs.video.onloadedmetadata = () => {
        this.$emit("video-live", stream);
      };

      this.$emit("started", stream);
    },
    initVideoOptions() {
      if (this.videoTypes.includes("screen")) {
        this.initScreen();
      }
      if (this.videoTypes.includes("camera")) {
        this.initCameras();
      } else {
        this.$emit("cameras", []);
        this.camerasEmitted = true;
      }
    },
    initScreen() {
      // @todo Add check for browsers that don't support screenshare.
      this.browserScreenshareSupported = true;
    },
    initCameras() {
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
      }

      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = this.legacyGetUserMediaSupport();
      }

      this.testVideoAccess();
    },
    testVideoAccess() {
      let constraints = { video: true, audio: { echoCancellation: true } };

      if (this.resolution) {
        constraints.video = {};
        constraints.video.height = this.resolution.height;
        constraints.video.width = this.resolution.width;
      }

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          let tracks = stream.getTracks();
          tracks.forEach((track) => {
            track.stop();
          });
          this.loadCameras();
        })
        .catch((error) => this.$emit("error", error));
    },
    legacyGetUserMediaSupport() {
      return (constraints) => {
        let getUserMedia =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia ||
          navigator.oGetUserMedia;

        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
          return Promise.reject(
            new Error("getUserMedia is not implemented in this browser")
          );
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function (resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    },
    loadCameras() {
      navigator.mediaDevices
        .enumerateDevices()
        .then((deviceInfos) => {
          for (let i = 0; i !== deviceInfos.length; ++i) {
            let deviceInfo = deviceInfos[i];
            if (deviceInfo.kind === "videoinput") {
              // store only the data we need
              this.cameras.push({
                text: deviceInfo.label,
                value: deviceInfo.deviceId,
              });
            }
          }
        })
        .then(() => {
          if (!this.camerasEmitted) {
            this.$emit("cameras", this.cameras);
            this.camerasEmitted = true;
          }
        })
        .catch((error) => this.$emit("notsupported", error));
    },
    stopVideo() {
      if (this.$refs.video !== null && this.$refs.video.srcObject) {
        this.stopStreamedVideo(this.$refs.video);
      }
    },
    stopStreamedVideo(videoElem) {
      let stream = videoElem.srcObject;
      let tracks = stream.getTracks();

      tracks.forEach((track) => {
        track.stop();
        this.$emit("stoppedVideo", stream);

        this.$refs.video.srcObject = null;
        this.source = null;
      });
    },
    listFromCameras(cameras) {
      if (this.browserScreenshareSupported && cameras.length > 0) {
        return [
          ...this.camerasHeader,
          ...cameras,
          ...this.staticVideoOptionsHeader,
          ...this.staticVideoOptions,
        ];
      } else if (this.browserScreenshareSupported && cameras.length === 0) {
        return this.staticVideoOptions;
      }

      return cameras;
    },
    startVideoRecording() {
      const stream = this.$refs.video.srcObject;
      const recorder = new MediaRecorder(stream);
      this.recorder = recorder;

      this.recorder.ondataavailable = (event) => this.pushVideoData(event.data);
      this.recorder.start();
    },
    async pushVideoData(data) {
      if (data.size > 0) {
        const uid = await uuidv4();
        data.name = "clip-" + uid + ".webm";
        this.recordings.push(data);
        if(this.recorderMode == "single") {
          this.setView("videoPlayer");
        }
        this.$emit("new-recording", { name: data.name, size: data.size });
      }
    },
    async stopRecording() {
      if (this.$refs.video !== null && this.$refs.video.srcObject) {
        this.recorder.stop();
      }
    },
    pause() {
      if (this.$refs.video !== null && this.$refs.video.srcObject) {
        this.$refs.video.pause();
      }
    },
    resume() {
      if (this.$refs.video !== null && this.$refs.video.srcObject) {
        this.$refs.video.play();
      }
    },
    videoSnapshot() {
      this.snapshot = this.getCanvas().toDataURL(this.screenshotFormat);
      this.setView("snapshot");
    },
    getCanvas() {
      let video = this.$refs.video;

      if (!this.ctx) {
        let canvas = document.createElement("canvas");
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        this.canvas = canvas;

        this.ctx = canvas.getContext("2d");
      }

      const { ctx, canvas } = this;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      return canvas;
    },
    async dataURItoBlob(dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString;
      if (dataURI.split(",")[0].indexOf("base64") >= 0)
        byteString = atob(dataURI.split(",")[1]);
      else byteString = unescape(dataURI.split(",")[1]);

      // separate out the mime component
      var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ia], { type: mimeString });
    },
    async closeSnapshot() {
      this.setView("video");
      this.snapshot = null;
    },
    async downloadSnapshot() {
      const imgInfo = await this.dataURItoBlob(this.snapshot);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = this.snapshot;
      const uid = await uuidv4();
      a.download = uid + imgInfo.type.split("/").pop();
      a.click();
    },
    async downloadRecording(recordingIndex) {
      var blob = this.recordings[recordingIndex];
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "video.webm";
      a.click();
      window.URL.revokeObjectURL(url);
    },
    deleteRecording(index) {
      if (this.recorderMode == "single") {
        this.setView("video");  
      }
      this.recordings.splice(index, 1);
      this.$emit("delete-recording", index);
    },
    async loadRecording(index) {
      const recording = this.recordings[index];
      const clip = window.URL.createObjectURL(recording);
      this.playerSource = clip;
      this.nowPlaying = index;
      this.setView("videoPlayer");
      this.$emit("player-loaded", true);
    },
    playRecording() {
      this.$refs.videoPlayer.play();
    },
    pausePlayer() {
      if (this.$refs.videoPlayer !== null) {
        this.$refs.videoPlayer.pause();
      }
    },
    resumePlayer() {
      if (this.$refs.videoPlayer !== null) {
        this.$refs.videoPlayer.play();
      }
    },
    deletePlayerRecording() {
      this.setView("video");
      this.deleteRecording(this.nowPlaying);
    },
    closePlayer() {
      this.setView("video");
    },
    muteRecorder() {
      this.$refs.video.mute();
    }
  },
};
</script>
