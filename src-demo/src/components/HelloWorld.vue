<template>
  <div>
    <multicorder />
  </div>
</template>

<script>

// prettier-ignore
import Multicorder from '../../../src';

export default {
  name: 'MulticorderSourceTest',
  components: {
    "multicorder": Multicorder
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
