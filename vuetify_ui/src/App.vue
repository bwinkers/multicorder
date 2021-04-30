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
      <v-row justify="center" align="center">
        <v-col cols="12" sm="4" border="1">
      <MulticorderUI 
        :videoTypes="['screen', 'camera']"
      />
      </v-col>
      </v-row>
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

<style scoped>
.main {
  max-width: 800px;

  align-items: center;
  justify-content: center;
}
</style>
