<template>
  <div class="multicorder">
    <video
      ref="video"
      :width="width"
      :height="height"
      :src="source"
      :autoplay="autoplay"
      :playsinline="playsinline"
    />
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: "Multicorder",
  data() {
    return {
      source: null,
      canvas: null,
      cameras: [],
      camerasEmitted: null,
      browserScreenshareSupported: null,
    };
  },
  props: {
    videoSource: {
      type: String,
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
            divider: true,
            header: "Screen Sharing",
          },
          {
            text: "Screen share",
            value: "screenshare",
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
    videoSource: function(sourceId) {
      this.changeVideoSource(sourceId);
    }
  },
  methods: {
    changeVideoSource(sourceId) {
      this.stopVideo();
      this.$emit("video-change", sourceId);
      if (sourceId) {
        if (sourceId == "screenshare") {
          this.startScreenshare();
        } else {
          this.loadCamera(sourceId);
        }
      }
    },
    loadCamera(device) {
      let constraints = { video: { deviceId: { exact: device } } };

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
      console.log("Starting Screenshare");

      try {
        navigator.mediaDevices.getDisplayMedia().then((stream) => this.loadSrcStream(stream));
  
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
      if (this.videoTypes.includes("camera")) {
        this.initCameras();
      }
      if (this.videoTypes.includes("screen")) {
        this.initScreen();
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
      let constraints = { video: true };

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
      console.log(cameras);
      if (this.browserScreenshareSupported) {
        return [...this.camerasHeader, ...cameras, ...this.staticVideoOptions];
      }

      return cameras;
    },
  },
};
</script>
