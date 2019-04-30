<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'photo-wall',
    mounted(){
      this.disableDragEvent()
    },
    methods: {
      disableDragEvent () {
        window.addEventListener('dragenter', this.disableDrag, false)
        window.addEventListener('dragover', this.disableDrag)
        window.addEventListener('drop', this.disableDrag)
      },
      disableDrag (e) {
        const dropzone = document.getElementById('upload-area')
        if (dropzone === null || !dropzone.contains(e.target)) {
          e.preventDefault()
          e.dataTransfer.effectAllowed = 'none'
          e.dataTransfer.dropEffect = 'none'
        }
      }
    },
  beforeDestroy () {
    window.removeEventListener('dragenter', this.disableDrag, false)
    window.removeEventListener('dragover', this.disableDrag)
    window.removeEventListener('drop', this.disableDrag)
  }      
    }
</script>

<style>
  /* CSS */
</style>
