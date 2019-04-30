<!-- 展示文件下所有图片 -->
<template lang='pug'>
div.main
    Row(:gutter="16" type='flex'  align='bottom')
        Col(span= 4 v-for="img in imgs" :key="img")
            div.imgWrapper
                img(:src="img")
</template>

<script type='text/ecmascript-6'>
import { log } from 'util';
import fs from 'fs'
import path from 'path'
const { ipcRenderer, remote } = require('electron')
const { Menu, MenuItem } = remote

export default {
  data () {
    return {
        folder: '',
        imgs: []
    };
  },
  created(){
    this.setMenu()
    this.folder = this.$route.params.folder
    this.readImgs(path.join(__static, this.folder))
  },
  methods: {
      // 读取图片文件夹下面的图片
      readImgs(folder){
        fs.readdirSync(folder).forEach((val, index) => {
            this.imgs.push(path.join(folder, val))
        })          
      },     
      setMenu(){
          const that = this
          const template = [
              {
              label: 'Menu',
              submenu: [
                  {
                  label: '上传图片',
                  click() {
                      that.$router.push('/upload-img')
                  }
                  },{
                  label: '图片展示',
                  click() {
                      that.$router.push('/photo-wall') 
                  }
                  }
              ]
              }
          ]
          const menu = Menu.buildFromTemplate(template)
          Menu.setApplicationMenu(menu)
      },       
  }
}

</script>
<style lang='stylus' rel='stylesheet/stylus'>
.main
    .imgWrapper
        img 
            width auto 
            height auto 
            max-width 100%
            max-height 100%
</style>