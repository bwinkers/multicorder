<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
      <h1>Multicorder Demo</h1>
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
      <MulticorderHotReload />
    </v-main>
  </v-app>
</template>

<script>
import MulticorderHotReload from './components/MulticorderHotReload';

export default {
  name: 'App',

  components: {
    MulticorderHotReload,
  },

  data: () => ({
    //
  }),
};
</script>
