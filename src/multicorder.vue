<template>
  <div>
    Recorder goes here <v-btn outlined rounded text> Button </v-btn>
    <v-card class="mx-auto" max-width="344" outlined>
      Hello
      <v-card-actions>
        <v-btn outlined rounded text> Button </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { VBtn } from "vuetify/lib";
import vuetify from "./plugins/vuetify";

export default {
  name: "Multicorder",
  vuetify,
  components: {
    VBtn,
  },
};
</script>
