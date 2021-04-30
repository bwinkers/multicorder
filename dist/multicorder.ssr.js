'use strict';var crypto=require('crypto');function _interopDefaultLegacy(e){return e&&typeof e==='object'&&'default'in e?e:{'default':e}}var crypto__default=/*#__PURE__*/_interopDefaultLegacy(crypto);function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}// Unique ID creation requires a high quality random # generator.  In node.js
// this is pretty straight-forward - we use the crypto API.



var rng = function nodeRNG() {
  return crypto__default['default'].randomBytes(16);
};/**
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

var bytesToUuid_1 = bytesToUuid;// **`v1()` - Generate time-based UUID**
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

var v1_1 = v1;function v4(options, buf, offset) {
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

var v4_1 = v4;var uuid = v4_1;
uuid.v1 = v1_1;
uuid.v4 = v4_1;

var uuid_1 = uuid;var script = /*#__PURE__*/{
  name: "Multicorder",
  data: function data() {
    return {
      source: null,
      playerSource: null,
      canvas: null,
      snapshot: null,
      snapshotSource: null,
      cameras: [],
      camerasEmitted: null,
      browserScreenshareSupported: null,
      recorder: null,
      recordings: [],
      view: "video",
      nowPlaying: null
    };
  },
  props: {
    videoSource: {
      type: Object,
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
    recorderMuted: {
      type: Boolean,
      default: true
    },
    playerMuted: {
      type: Boolean,
      default: true
    },
    screenshotFormat: {
      type: String,
      default: "image/jpeg"
    },
    videoTypes: {
      type: Array,
      default: function _default() {
        return ["camera", "screen"];
      }
    },
    recorderMode: {
      type: String,
      default: "single"
    },
    camerasHeader: {
      type: Array,
      default: function _default() {
        return [{
          divider: true,
          header: "Cameras"
        }];
      }
    },
    staticVideoOptions: {
      type: Array,
      default: function _default() {
        return [{
          text: "Screen share",
          value: "screenshare"
        }];
      }
    },
    staticVideoOptionsHeader: {
      type: Array,
      default: function _default() {
        return [{
          divider: true,
          header: "Screen Sharing"
        }];
      }
    }
  },
  mounted: function mounted() {
    this.initVideoOptions();
  },
  beforeDestroy: function beforeDestroy() {
    this.stopVideo();
  },
  watch: {
    videoSource: function videoSource(_videoSource) {
      this.changeVideoSource(_videoSource);
    }
  },
  methods: {
    setView: function setView(view) {
      this.view = view;
      this.$emit("view-change", view);
    },
    changeVideoSource: function changeVideoSource(videoSource) {
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
    loadCamera: function loadCamera(device) {
      var _this = this;

      var constraints = {
        video: {
          deviceId: {
            exact: device
          }
        },
        audio: {
          echoCancellation: true
        }
      };

      if (this.resolution) {
        constraints.video.height = this.resolution.height;
        constraints.video.width = this.resolution.width;
      }

      navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        return _this.loadSrcStream(stream);
      }).catch(function (error) {
        return _this.$emit("error", error);
      });
    },
    startScreenshare: function startScreenshare() {
      var _this2 = this;

      try {
        navigator.mediaDevices.getDisplayMedia().then(function (stream) {
          return _this2.loadSrcStream(stream);
        });
      } catch (err) {
        console.error("Error: " + err);
      }
    },
    loadSrcStream: function loadSrcStream(stream) {
      var _this3 = this;

      if ("srcObject" in this.$refs.video) {
        // new browsers api
        this.$refs.video.srcObject = stream;
      } else {
        // old broswers
        this.source = window.HTMLMediaElement.srcObject(stream);
      } // Emit video start/live event


      this.$refs.video.onloadedmetadata = function () {
        _this3.$emit("video-live", stream);
      };

      this.$emit("started", stream);
    },
    initVideoOptions: function initVideoOptions() {
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
    initScreen: function initScreen() {
      // @todo Add check for browsers that don't support screenshare.
      this.browserScreenshareSupported = true;
    },
    initCameras: function initCameras() {
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
      }

      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = this.legacyGetUserMediaSupport();
      }

      this.testVideoAccess();
    },
    testVideoAccess: function testVideoAccess() {
      var _this4 = this;

      var constraints = {
        video: true,
        audio: {
          echoCancellation: true
        }
      };

      if (this.resolution) {
        constraints.video = {};
        constraints.video.height = this.resolution.height;
        constraints.video.width = this.resolution.width;
      }

      navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        var tracks = stream.getTracks();
        tracks.forEach(function (track) {
          track.stop();
        });

        _this4.loadCameras();
      }).catch(function (error) {
        return _this4.$emit("error", error);
      });
    },
    legacyGetUserMediaSupport: function legacyGetUserMediaSupport() {
      return function (constraints) {
        var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia; // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface

        if (!getUserMedia) {
          return Promise.reject(new Error("getUserMedia is not implemented in this browser"));
        } // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise


        return new Promise(function (resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    },
    loadCameras: function loadCameras() {
      var _this5 = this;

      navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
        for (var i = 0; i !== deviceInfos.length; ++i) {
          var deviceInfo = deviceInfos[i];

          if (deviceInfo.kind === "videoinput") {
            // store only the data we need
            _this5.cameras.push({
              text: deviceInfo.label,
              value: deviceInfo.deviceId
            });
          }
        }
      }).then(function () {
        if (!_this5.camerasEmitted) {
          _this5.$emit("cameras", _this5.cameras);

          _this5.camerasEmitted = true;
        }
      }).catch(function (error) {
        return _this5.$emit("notsupported", error);
      });
    },
    stopVideo: function stopVideo() {
      if (this.$refs.video !== null && this.$refs.video.srcObject) {
        this.stopStreamedVideo(this.$refs.video);
      }
    },
    stopStreamedVideo: function stopStreamedVideo(videoElem) {
      var _this6 = this;

      var stream = videoElem.srcObject;
      var tracks = stream.getTracks();
      tracks.forEach(function (track) {
        track.stop();

        _this6.$emit("stoppedVideo", stream);

        _this6.$refs.video.srcObject = null;
        _this6.source = null;
      });
    },
    listFromCameras: function listFromCameras(cameras) {
      if (this.browserScreenshareSupported && cameras.length > 0) {
        return [].concat(_toConsumableArray(this.camerasHeader), _toConsumableArray(cameras), _toConsumableArray(this.staticVideoOptionsHeader), _toConsumableArray(this.staticVideoOptions));
      } else if (this.browserScreenshareSupported && cameras.length === 0) {
        return this.staticVideoOptions;
      }

      return cameras;
    },
    startVideoRecording: function startVideoRecording() {
      var _this7 = this;

      var stream = this.$refs.video.srcObject;
      var recorder = new MediaRecorder(stream);
      this.recorder = recorder;

      this.recorder.ondataavailable = function (event) {
        return _this7.pushVideoData(event.data);
      };

      this.recorder.start();
    },
    pushVideoData: function pushVideoData(data) {
      var _this8 = this;

      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var uid;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(data.size > 0)) {
                  _context.next = 8;
                  break;
                }

                _context.next = 3;
                return uuid_1.v4();

              case 3:
                uid = _context.sent;
                data.name = "clip-" + uid + ".webm";

                _this8.recordings.push(data);

                if (_this8.recorderMode == "single") {
                  _this8.setView("videoPlayer");
                }

                _this8.$emit("new-recording", {
                  name: data.name,
                  size: data.size
                });

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    },
    stopRecording: function stopRecording() {
      var _this9 = this;

      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (_this9.$refs.video !== null && _this9.$refs.video.srcObject) {
                  _this9.recorder.stop();
                }

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    },
    pause: function pause() {
      if (this.$refs.video !== null && this.$refs.video.srcObject) {
        this.$refs.video.pause();
      }
    },
    resume: function resume() {
      if (this.$refs.video !== null && this.$refs.video.srcObject) {
        this.$refs.video.play();
      }
    },
    videoSnapshot: function videoSnapshot(fromView) {
      this.snapshot = this.getCanvas().toDataURL(this.screenshotFormat);
      this.snapshotSource = fromView;
      this.setView("snapshot");
    },
    getCanvas: function getCanvas() {
      var video = this.$refs.video;

      if (!this.ctx) {
        var _canvas = document.createElement("canvas");

        _canvas.height = video.videoHeight;
        _canvas.width = video.videoWidth;
        this.canvas = _canvas;
        this.ctx = _canvas.getContext("2d");
      }

      var ctx = this.ctx,
          canvas = this.canvas;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas;
    },
    dataURItoBlob: function dataURItoBlob(dataURI) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var byteString, mimeString, ia, i;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                // convert base64/URLEncoded data component to raw binary data held in a string
                if (dataURI.split(",")[0].indexOf("base64") >= 0) byteString = atob(dataURI.split(",")[1]);else byteString = unescape(dataURI.split(",")[1]); // separate out the mime component

                mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]; // write the bytes of the string to a typed array

                ia = new Uint8Array(byteString.length);

                for (i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
                }

                return _context3.abrupt("return", new Blob([ia], {
                  type: mimeString
                }));

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }))();
    },
    closeSnapshot: function closeSnapshot() {
      var _this10 = this;

      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _this10.setView(_this10.snapshotSource);

                _this10.snapshot = null;

              case 2:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }))();
    },
    downloadSnapshot: function downloadSnapshot() {
      var _this11 = this;

      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var imgInfo, a, uid;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return _this11.dataURItoBlob(_this11.snapshot);

              case 2:
                imgInfo = _context5.sent;
                a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = _this11.snapshot;
                _context5.next = 9;
                return uuid_1.v4();

              case 9:
                uid = _context5.sent;
                a.download = uid + imgInfo.type.split("/").pop();
                a.click();

              case 12:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }))();
    },
    downloadRecording: function downloadRecording(recordingIndex) {
      var _this12 = this;

      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var blob, url, a;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                blob = _this12.recordings[recordingIndex];
                url = URL.createObjectURL(blob);
                a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = url;
                a.download = "video.webm";
                a.click();
                window.URL.revokeObjectURL(url);

              case 9:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }))();
    },
    deleteRecording: function deleteRecording(index) {
      if (this.recorderMode == "single") {
        this.setView("video");
      }

      this.recordings.splice(index, 1);
      this.$emit("delete-recording", index);
    },
    loadRecording: function loadRecording(index) {
      var _this13 = this;

      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var recording, clip;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                recording = _this13.recordings[index];
                clip = window.URL.createObjectURL(recording);
                _this13.playerSource = clip;
                _this13.nowPlaying = index;

                _this13.setView("videoPlayer");

                _this13.$emit("player-loaded", true);

              case 6:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }))();
    },
    playRecording: function playRecording() {
      this.$refs.videoPlayer.play();
    },
    pausePlayer: function pausePlayer() {
      if (this.$refs.videoPlayer !== null) {
        this.$refs.videoPlayer.pause();
      }
    },
    resumePlayer: function resumePlayer() {
      if (this.$refs.videoPlayer !== null) {
        this.$refs.videoPlayer.play();
      }
    },
    deletePlayerRecording: function deletePlayerRecording() {
      this.setView("video");
      this.deleteRecording(this.nowPlaying);
    },
    closePlayer: function closePlayer() {
      this.setView("video");
    },
    muteRecorder: function muteRecorder() {
      this.$refs.video.mute();
    }
  }
};function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
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
}/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "multicorder"
  }, [_vm._ssrNode("<video" + _vm._ssrAttr("width", _vm.width) + _vm._ssrAttr("height", _vm.height) + _vm._ssrAttr("src", _vm.source) + _vm._ssrAttr("autoplay", _vm.autoplay) + _vm._ssrAttr("playsinline", _vm.playsinline) + " muted=\"muted\"" + _vm._ssrStyle(null, null, {
    display: _vm.view == 'video' ? '' : 'none'
  }) + "></video> <img" + _vm._ssrAttr("src", _vm.snapshot) + " width=\"100%\" height=\"100%\"" + _vm._ssrStyle(null, null, {
    display: _vm.view == 'snapshot' ? '' : 'none'
  }) + "> <video" + _vm._ssrAttr("width", _vm.width) + _vm._ssrAttr("height", _vm.height) + _vm._ssrAttr("src", _vm.playerSource) + _vm._ssrAttr("playsinline", _vm.playsinline) + _vm._ssrStyle(null, null, {
    display: _vm.view == 'videoPlayer' ? '' : 'none'
  }) + "></video>")]);
};

var __vue_staticRenderFns__ = [];
/* style */

var __vue_inject_styles__ = undefined;
/* scoped */

var __vue_scope_id__ = undefined;
/* module identifier */

var __vue_module_identifier__ = "data-v-5fe75946";
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);/* eslint-disable import/prefer-default-export */var components$1=/*#__PURE__*/Object.freeze({__proto__:null,Multicorder: __vue_component__});var install = function installMulticorder(Vue) {
  Object.entries(components$1).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        componentName = _ref2[0],
        component = _ref2[1];

    Vue.component(componentName, component);
  });
}; // Create module definition for Vue.use()
var components=/*#__PURE__*/Object.freeze({__proto__:null,'default': install,Multicorder: __vue_component__});// only expose one global var, with component exports exposed as properties of
// that global var (eg. plugin.component)

Object.entries(components).forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      componentName = _ref2[0],
      component = _ref2[1];

  if (componentName !== 'default') {
    install[componentName] = component;
  }
});module.exports=install;