import crypto from 'crypto';

// Unique ID creation requires a high quality random # generator.  In node.js
// this is pretty straight-forward - we use the crypto API.



var rng = function nodeRNG() {
  return crypto.randomBytes(16);
};

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]]
  ]).join('');
}

var bytesToUuid_1 = bytesToUuid;

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;
var _clockseq;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/uuidjs/uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    var seedBytes = rng();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid_1(b);
}

var v1_1 = v1;

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid_1(rnds);
}

var v4_1 = v4;

var uuid = v4_1;
uuid.v1 = v1_1;
uuid.v4 = v4_1;

var uuid_1 = uuid;

//
var script = /*#__PURE__*/{
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
      view: 'video',
      nowPlaying: null
    };
  },

  props: {
    videoSource: {
      type: String,
      default: null
    },
    width: {
      type: [Number, String],
      default: "100%"
    },
    height: {
      type: [Number, String],
      default: "100%"
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    playsinline: {
      type: Boolean,
      default: true
    },
    screenshotFormat: {
      type: String,
      default: "image/jpeg"
    },
    videoTypes: {
      type: Array,
      default: () => {
        return ["camera", "screen"];
      }
    },
    camerasHeader: {
      type: Array,
      default: () => {
        return [{
          divider: true,
          header: "Cameras"
        }];
      }
    },
    staticVideoOptions: {
      type: Array,
      default: () => {
        return [{
          text: "Screen share",
          value: "screenshare"
        }];
      }
    },
    staticVideoOptionsHeader: {
      type: Array,
      default: () => {
        return [{
          divider: true,
          header: "Screen Sharing"
        }];
      }
    }
  },

  mounted() {
    this.initVideoOptions();
  },

  beforeDestroy() {// this.stopVideo();
  },

  watch: {
    videoSource: function (sourceId) {
      this.changeVideoSource(sourceId);
    }
  },
  methods: {
    setView(view) {
      this.view = view;
      this.$emit('view-change', view);
    },

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
      let constraints = {
        video: {
          deviceId: {
            exact: device
          }
        }
      };

      if (this.resolution) {
        constraints.video.height = this.resolution.height;
        constraints.video.width = this.resolution.width;
      }

      navigator.mediaDevices.getUserMedia(constraints).then(stream => this.loadSrcStream(stream)).catch(error => this.$emit("error", error));
    },

    startScreenshare() {
      console.log("Starting Screenshare");

      try {
        navigator.mediaDevices.getDisplayMedia().then(stream => this.loadSrcStream(stream));
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
      } // Emit video start/live event


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
      let constraints = {
        video: true
      };

      if (this.resolution) {
        constraints.video = {};
        constraints.video.height = this.resolution.height;
        constraints.video.width = this.resolution.width;
      }

      navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        let tracks = stream.getTracks();
        tracks.forEach(track => {
          track.stop();
        });
        this.loadCameras();
      }).catch(error => this.$emit("error", error));
    },

    legacyGetUserMediaSupport() {
      return constraints => {
        let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia; // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface

        if (!getUserMedia) {
          return Promise.reject(new Error("getUserMedia is not implemented in this browser"));
        } // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise


        return new Promise(function (resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    },

    loadCameras() {
      navigator.mediaDevices.enumerateDevices().then(deviceInfos => {
        for (let i = 0; i !== deviceInfos.length; ++i) {
          let deviceInfo = deviceInfos[i];

          if (deviceInfo.kind === "videoinput") {
            // store only the data we need
            this.cameras.push({
              text: deviceInfo.label,
              value: deviceInfo.deviceId
            });
          }
        }
      }).then(() => {
        if (!this.camerasEmitted) {
          this.$emit("cameras", this.cameras);
          this.camerasEmitted = true;
        }
      }).catch(error => this.$emit("notsupported", error));
    },

    stopVideo() {
      if (this.$refs.video !== null && this.$refs.video.srcObject) {
        this.stopStreamedVideo(this.$refs.video);
      }
    },

    stopStreamedVideo(videoElem) {
      let stream = videoElem.srcObject;
      let tracks = stream.getTracks();
      tracks.forEach(track => {
        track.stop();
        this.$emit("stoppedVideo", stream);
        this.$refs.video.srcObject = null;
        this.source = null;
      });
    },

    listFromCameras(cameras) {
      console.log(cameras);
      console.log(this.browserScreenshareSupported);

      if (this.browserScreenshareSupported && cameras.length > 0) {
        return [...this.camerasHeader, ...cameras, ...this.staticVideoOptionsHeader, ...this.staticVideoOptions];
      } else if (this.browserScreenshareSupported && cameras.length === 0) {
        return this.staticVideoOptions;
      }

      return cameras;
    },

    startVideoRecording() {
      const stream = this.$refs.video.srcObject;
      const recorder = new MediaRecorder(stream);
      this.recorder = recorder;

      this.recorder.ondataavailable = event => this.pushVideoData(event.data);

      this.recorder.start();
      console.log(this.recorder.state);
    },

    async pushVideoData(data) {
      if (data.size > 0) {
        const uid = await uuid_1.v4();
        data.name = "clip-" + uid + ".webm";
        console.log(data);
        this.recordings.push(data);
        this.$emit('new-recording', {
          name: data.name,
          size: data.size
        });
      }
    },

    async stopRecording() {
      if (this.$refs.video !== null && this.$refs.video.srcObject) {
        this.recorder.stop();
        console.log("recording stopped");
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
      this.setView('snapshot');
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

      const {
        ctx,
        canvas
      } = this;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas;
    },

    async dataURItoBlob(dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString;
      if (dataURI.split(",")[0].indexOf("base64") >= 0) byteString = atob(dataURI.split(",")[1]);else byteString = unescape(dataURI.split(",")[1]); // separate out the mime component

      var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]; // write the bytes of the string to a typed array

      var ia = new Uint8Array(byteString.length);

      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ia], {
        type: mimeString
      });
    },

    async closeSnapshot() {
      this.setView('video');
      this.snapshot = null;
    },

    async downloadSnapshot() {
      const imgInfo = await this.dataURItoBlob(this.snapshot);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = this.snapshot;
      const uid = await uuid_1.v4();
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
      a.download = "test.webm";
      a.click();
      window.URL.revokeObjectURL(url);
    },

    deleteRecording(index) {
      console.log('deleting' + index);
      this.recordings.splice(index, 1);
      this.$emit('delete-recording', index);
    },

    async loadRecording(index) {
      const recording = this.recordings[index];
      const clip = window.URL.createObjectURL(recording);
      this.playerSource = clip;
      this.nowPlaying = index;
      this.setView('videoPlayer');
      this.$emit('player-loaded', true);
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
      this.setView('video');
      this.deleteRecording(this.nowPlaying);
    },

    closePlayer() {
      this.setView('video');
    }

  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

/* script */
const __vue_script__ = script;
/* template */

var __vue_render__ = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "multicorder"
  }, [_c('video', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: _vm.view == 'video',
      expression: "view == 'video'"
    }],
    ref: "video",
    attrs: {
      "width": _vm.width,
      "height": _vm.height,
      "src": _vm.source,
      "autoplay": _vm.autoplay,
      "playsinline": _vm.playsinline
    }
  }), _vm._v(" "), _c('img', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: _vm.view == 'snapshot',
      expression: "view == 'snapshot'"
    }],
    attrs: {
      "src": _vm.snapshot,
      "width": "100%",
      "height": "100%"
    }
  }), _vm._v(" "), _c('video', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: _vm.view == 'videoPlayer',
      expression: "view == 'videoPlayer'"
    }],
    ref: "videoPlayer",
    attrs: {
      "width": _vm.width,
      "height": _vm.height,
      "src": _vm.playerSource,
      "playsinline": _vm.playsinline
    }
  })]);
};

var __vue_staticRenderFns__ = [];
/* style */

const __vue_inject_styles__ = undefined;
/* scoped */

const __vue_scope_id__ = undefined;
/* module identifier */

const __vue_module_identifier__ = undefined;
/* functional template */

const __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

/* eslint-disable import/prefer-default-export */

var components = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Multicorder: __vue_component__
});

// Import vue components

const install = function installMulticorder(Vue) {
  Object.entries(components).forEach(([componentName, component]) => {
    Vue.component(componentName, component);
  });
}; // Create module definition for Vue.use()

export default install;
export { __vue_component__ as Multicorder };
