<template>
  <div id="app">
    <Main />
  </div>
</template>

<script>
import Main from "@/view/index.vue";

export default {
  name: "App",
  components: {
    Main
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
