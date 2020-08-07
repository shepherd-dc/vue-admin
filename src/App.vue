<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'App',
  computed: {
    ...mapGetters([
      'key'
    ])
  },
  mounted() {
    if (!this.key) this.saveCodeKey()
  },
  methods: {
    ...mapActions('user', [
      'saveCodeKey'
    ])
  }
}
</script>
