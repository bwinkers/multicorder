<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
      <h1>Multicorder Vuetify Demo</h1>
      </div>
      <v-spacer></v-spacer>
      
      <v-btn
        href="https://github.com/bwinkers/multicorder/releases/latest"
        target="_blank"
        text
      >
        <span class="mr-2">Latest Release</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <MulticorderUI 
        :videoTypes="['screen', 'camera']"
      />
    </v-main>
  </v-app>
</template>

<script>
import MulticorderUI from './components/MulticorderUI';

export default {
  name: 'App',

  components: {
    MulticorderUI,
  },

  data: () => ({
    //
  }),
};
</script>
