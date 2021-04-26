<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <Multicorder  :video-source="videoSource" @error="onError" @cameras="onCameras" ref="multicorder" />
        <v-select :items="videoSourceList" v-model="videoSource" label="Select video input" />

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
  },
};
</script>
