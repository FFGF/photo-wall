<template lang="pug">
  div#content
    Row()
      Col(span="24")
        grid-layout(
                :layout="layout"
                :col-num="32"
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
                            @dblclick.native="max(item)"
                            )
                            div.videoWrapper(v-if="item.videoFlag")
                              video(controls v-if="item.videoFlag")
                                source(:src="imgsUrl[item.i][0]" type="video/mp4")
                            //- div.left(@click='lastPicture(item.i)' v-if="!item.videoFlag") 
                            div.imgWrapper(v-if="!item.videoFlag")
                                img(:src="imgsUrl[item.i][0]")
                            //- div.right(@click='nextPicture(item.i)' v-if="!item.videoFlag")
    Modal(v-model="modal" fullscreen @click.native="hideModal" footer-hide)
      div.scene(@click.stop="" v-if="modalImageUrl.length != 0")
        div.carousel
          div.carousel__cell(v-for="imgUrl, i in modalImageUrl" :key="i")
            img(:src="imgUrl" style='width:100%; height: 100%')
        
      p(style="text-align: center")
        Button(@click.stop="previous" type='primary') Previous
        Button(@click.stop="next" type='primary' style='margin-left: 30px') Next

        
    //- div.logoWrapper
    //-   img(src="../assets/logo.png")
    div.button-wrapper
      Button(type="primary" shape="circle" icon="md-remove" @click='minimize')
      Button(type="primary" shape="circle" icon="ios-square-outline" @click='setFullScreen')
      Button(type="primary" shape="circle" icon="md-close" @click='close')
      Button(type="primary" shape="circle" icon="md-home" @click='home')
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
  import mixin from '@/utils/mixin'
  import { setInterval } from 'timers';

  export default {
    name: 'landing-page',
    mixins: [mixin],
    data(){
      return {
        layout: [],
        imgs: {},
        imgsUrl: [],
        // staticPath: path.join(path.join(os.homedir(), '/photo-wall')),
        staticPath: __static,
        window: remote.getCurrentWindow(),
        modal: false,
        cellCount: 9,
        selectedIndex: 0,
        modalImageUrl: []
      }
    },
  components: { 
      GridLayout,
      GridItem,
     },
  created(){
      this.readDir()
      this.readImgs()
      this.setMenu()
      this.setLayoutLeft()
  },
  methods: {
      previous(){
        console.log('previous')
        this.selectedIndex--;
        this.rotateCarousel();
      },
      next(){
        console.log('next');
        this.selectedIndex++;
        this.rotateCarousel();
      },
      rotateCarousel() {
        let carousel = document.querySelector('.carousel')
        let angle = this.selectedIndex / this.cellCount * -360;
        carousel.style.transform = 'translateZ(-288px) rotateY(' + angle + 'deg)';
      },
      home(){
        this.setLayoutLeft()
      },
      setLayoutLeft(){
        this.layout = []
        // let imgsUrlLeft = parseInt(this.imgsUrl.length/3)
        let imgsUrlLeft = 0
        let videoExt = ['.mp4', '.mov', '.ogg', '.webm']
        let hight = Array.apply(null, Array(32)).map((item, i) => { return 0})

        let L = 0
        for(let i=imgsUrlLeft; i < this.imgsUrl.length; i++){
          // let random = Math.floor(Math.random()*4+4)
          let random = 4
          let videoFlag = videoExt.includes(path.extname(this.imgsUrl[i][0]))
          let w = random
          let h = w * 3
          // 计算x, y
          let Lend = L + w
          //换行
          if((hight.length - parseInt(Lend)) < 0){
            L = 0
            Lend = L + w
          } 
          let temp = hight.slice(L, Lend+1)
          let max = Math.max(...temp)
          let y = max
          let x = L
          let layoutTemp = {
            "x": x,
            "y": y,
            "w": w,
            "h": h,
            "i": i,
            'videoFlag': videoFlag
          }
          this.layout.push(layoutTemp)
          hight = hight.map((item, i) => {if(i >=L  && i < Lend){return h + item }else{return item}})
          L = Lend
        }
        
        

        // for(let i = imgsUrlLeft; i < this.imgsUrl.length; i++){
        //   let random = Math.floor(Math.random()*10 + 4)
        //   // 判断文件夹是否为视频文件夹，假设同一个文件夹，要么都为视频，要么都为图片
        //   let videoFlag = videoExt.includes(path.extname(this.imgsUrl[i][0]))
        //   let mod = i % 8
        //   let div = parseInt(i / 8)
        //   let temp = {
        //     "x": mod * 4 ,
        //     "y": div * 8 ,
        //     "w":4,
        //     "h": 4,
        //     "i": i,
        //     'videoFlag': videoFlag
        //   }
        //   this.layout.push(temp)
        // }
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
        //有些不要菜单，隐藏
        Menu.setApplicationMenu(null)
        // Menu.setApplicationMenu(menu)
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
              if(path.basename(imgsArray[index]) ===  imageName)
                  imgIndex = index
          }
          if(direction === 'last'){
            imgIndex = imgIndex-1 === -1 ? imgsArray.length-1 : imgIndex -1 
          }else if(direction === 'next'){
            imgIndex = parseInt(imgIndex)+1 === imgsArray.length ? 0 : parseInt(imgIndex) +1
          }
          return imgIndex
      },
      max(item){
        this.modal = true
        console.log('item.i', item.i);
        this.modalImageUrl = this.imgsUrl.slice(item.i, item.i+9)
        console.log('modalImageUrl', this.modalImageUrl);
      },
      hideModal(){
        this.modal = false
      }
    }
  }
</script>

<style>
video::-webkit-media-controls-fullscreen-button {
    display: none;
}
body::-webkit-scrollbar {
    display: none;
}
* { box-sizing: border-box; }
.scene {
  border: 0px solid #CCC;
  margin: 40px 0;
  position: relative;
  width: 13%;
  height: 70%;
  margin: 40px auto;
  perspective: 1000px;
}

.carousel {
  width: 100%;
  height: 100%;
  position: absolute;
  transform: translateZ(-288px);
  transform-style: preserve-3d;
  transition: transform 1s;
}

.carousel__cell {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 10px;
  top: 10px;
  border: 2px solid black;
  line-height: 116px;
  font-size: 80px;
  font-weight: bold;
  color: white;
  text-align: center;
}

.carousel__cell:nth-child(9n+1) { background: hsla(  0, 100%, 50%, 0.8); }
.carousel__cell:nth-child(9n+2) { background: hsla( 40, 100%, 50%, 0.8); }
.carousel__cell:nth-child(9n+3) { background: hsla( 80, 100%, 50%, 0.8); }
.carousel__cell:nth-child(9n+4) { background: hsla(120, 100%, 50%, 0.8); }
.carousel__cell:nth-child(9n+5) { background: hsla(160, 100%, 50%, 0.8); }
.carousel__cell:nth-child(9n+6) { background: hsla(200, 100%, 50%, 0.8); }
.carousel__cell:nth-child(9n+7) { background: hsla(240, 100%, 50%, 0.8); }
.carousel__cell:nth-child(9n+8) { background: hsla(280, 100%, 50%, 0.8); }
.carousel__cell:nth-child(9n+0) { background: hsla(320, 100%, 50%, 0.8); }

.carousel__cell:nth-child(1) { transform: rotateY(  0deg) translateZ(288px); }
.carousel__cell:nth-child(2) { transform: rotateY( 40deg) translateZ(288px); }
.carousel__cell:nth-child(3) { transform: rotateY( 80deg) translateZ(288px); }
.carousel__cell:nth-child(4) { transform: rotateY(120deg) translateZ(288px); }
.carousel__cell:nth-child(5) { transform: rotateY(160deg) translateZ(288px); }
.carousel__cell:nth-child(6) { transform: rotateY(200deg) translateZ(288px); }
.carousel__cell:nth-child(7) { transform: rotateY(240deg) translateZ(288px); }
.carousel__cell:nth-child(8) { transform: rotateY(280deg) translateZ(288px); }
.carousel__cell:nth-child(9) { transform: rotateY(320deg) translateZ(288px); }

</style>

<style lang="stylus">
body
  // background url('../assets/background-img.jpg') no-repeat center center fixed
  // background-size cover
  #content
    background-color black
    .vue-grid-item.vue-grid-placeholder
      opacity 0
    .vue-grid-item>.vue-resizable-handle
      width 50px
      height 50px
    .left, .right
        width 10%
        height 100%
        background-color rgba(212, 188, 188, 0.18)
        float left
        cursor pointer
    .right
        float: right
    .imgWrapper, .videoWrapper
        width 100%
        height 100%
        float left
        text-align center
        display flex
        // align-items center
        justify-content center
        img, video
            width 100% 
            height auto 
            max-width 100%
            max-height 100%
        .vue-resizable-handle
          width 50px
          height 50px
      .logoWrapper
        position fixed
        top 20%
        right 21%
        z-index -999
        width 30%
        img
            width auto 
            height auto 
            max-width 100%
            max-height 100%
      .button-wrapper
        position fixed
        bottom 12px
        right 12px
        button 
          margin-right 10px
  .ivu-modal-content
    background-color rgba(1, 255, 255, 0.1)
    .imageWrapper
      width 50%
      height 50%
      margin-left 25%
      margin-top 10%
      img 
        width 100%
        height 100%
</style>