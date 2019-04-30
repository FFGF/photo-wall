<template lang="pug">
  div#content()
    Row()
      Col(span="18")
        grid-layout(
                :layout="layout"
                :col-num="24"
                :row-height="30"
                :is-draggable="true"
                :is-resizable="true"
                :is-mirrored="false"
                :vertical-compact="true"
                :margin="[10, 10]"
                :use-css-transforms="true"
                )
                grid-item(v-for="item in layout"
                            :x="item.x"
                            :y="item.y"
                            :w="item.w"
                            :h="item.h"
                            :i="item.i"
                            :key="item.i"
                            @resize="resizeEvent"
                            )
                            div.left(@click='lastPicture(item.i)') {{item.i}}
                            div.imgWrapper
                                img(:src="imgsUrl[item.i][0]" :ref='item.i')
                            div.right(@click='nextPicture(item.i)')
      Col(span="6")
        div.logoWrapper
          img(:src="logoPath")
          div.button-wrapper
            Button(type="primary" shape="circle" icon="md-remove" @click='minimize')
            Button(type="primary" shape="circle" icon="ios-square-outline" @click='setFullScreen')
            Button(type="primary" shape="circle" icon="md-close" @click='close')
</template>

<script>
  import fs from 'fs'
  import {GridLayout, GridItem} from 'vue-grid-layout'
  import { log } from 'util';
  import path from 'path'
  import { fail } from 'assert';
  const { ipcRenderer, remote } = require('electron')
  const { Menu, MenuItem } = remote
  const os = require('os')

  export default {
    name: 'landing-page',
    data(){
      return {
        layout: [],
        imgs: {},
        imgsUrl: [],
        staticPath: path.join(path.join(os.homedir(), '/photo-wall')),
        window: remote.getCurrentWindow(),
        logoPath: `${__static}/logo.jpg`
      }
    },
  components: { 
      GridLayout,
      GridItem,
     },
  created(){
    log("static", __static)
    // log("家目录",__photoWall)
      this.readDir()
      this.readImgs()
      this.setMenu()
      this.setLayout()
  },
  methods: {
      setLayout(){
        for(let i = 0; i < this.imgsUrl.length; i++){
          let mod = i % 4
          let div = parseInt(i / 4)
          let temp = {
            "x": mod * 4,
            "y": div * 4,
            "w": 4,
            "h": 4,
            "i": i
          }
          this.layout.push(temp)
        }
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
      minimize(){
        // 窗口最小化
        this.window.minimize()
      },
      setFullScreen(){
        // 窗口全屏
        this.window.setFullScreen(!this.window.isFullScreen())
        //全屏隐藏去掉菜单，非全屏显示菜单
        this.window.isFullScreen() ?  Menu.setApplicationMenu(null) :  this.setMenu()
      },
      close(){
        this.window.close()
      },
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      //读取图片文件夹
      readDir(){
          fs.readdirSync(this.staticPath).forEach((val, index) => {
          let fPath = path.join(this.staticPath, val)
          let stats = fs.statSync(fPath)
          if(stats.isDirectory())
              this.imgs[fPath] = []
          })
      },
      // 读取每一个图片文件夹下面的图片
      readImgs(){
          for(let imgdir in this.imgs){
              let tempUrl = []
              fs.readdirSync(imgdir).forEach((val, index) => {
                  // tempUrl.push(`${imgdir}\\${val}`)
                  tempUrl.push(path.join(imgdir, val))
              })
              this.imgsUrl[(this.imgsUrl).length] = tempUrl
          }
      },
      lastPicture(i){
          let imgsArray = this.imgsUrl[i]
          let currentSrc = this.$refs[i][0].src.split('/')
          let imgIndex = this.pictureIndex(imgsArray, currentSrc, 'last')
          this.$refs[i][0].src = imgsArray[imgIndex]
      },
      nextPicture(i){
          let imgsArray = this.imgsUrl[i]
          let currentSrc = this.$refs[i][0].src.split('/')
          let imgIndex = this.pictureIndex(imgsArray, currentSrc, 'next')
          this.$refs[i][0].src = imgsArray[imgIndex]
      },
      pictureIndex(imgsArray, currentSrc, direction){
          let imageName = decodeURI(currentSrc[currentSrc.length -1 ])
          let imgIndex = 0
          for(let index in imgsArray){
              if(imgsArray[index].includes(imageName))
                  imgIndex = index
          }
          if(direction === 'last'){
            imgIndex = imgIndex-1 === -1 ? imgsArray.length-1 : imgIndex -1 
          }else if(direction === 'next'){
            imgIndex = parseInt(imgIndex)+1 === imgsArray.length ? 0 : parseInt(imgIndex) +1
          }
          return imgIndex
      },
      resizeEvent(i, newH, hewW, newHPx, newWPx){
          console.log(i, newH, hewW, newHPx, newWPx);
      },
    }
  }
</script>
<style lang="stylus">
  #content
    .vue-grid-item.vue-grid-placeholder
      opacity 0
    .left, .right
        width 10%
        height 100%
        background-color rgba(212, 188, 188, 0.18)
        float left
        cursor pointer
    .right
        float: right
    .imgWrapper
        width 80%
        height 100%
        float left
        text-align center
        display flex
        align-items center
        justify-content center
        img 
            width auto 
            height auto 
            max-width 100%
            max-height 100%
            border-radius 50%
      .logoWrapper
        position fixed
        top: 30%
        img
            width auto 
            height auto 
            max-width 90%
            max-height 100%
            border-radius 50%
        .button-wrapper
          position fixed
          bottom 12px
          right 12px
</style>