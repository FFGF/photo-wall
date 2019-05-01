<!-- 展示文件下所有图片 -->
<template lang='pug'>
div.main
  Row
    Col(span="8" offset="8")
      div.uploadWrapper(id="upload-area" 
        class='upload-area'
        @drop.prevent="onDrop" 
        @dragover.prevent="dragover = true"
        @dragleave.prevent="dragover = false"
        :class="{'is-dragover': dragover}"
        )
        Icon(type="ios-cloud-upload-outline" size="300"  @click.native="addImage")
        span(style='display: block; font-size: 15px') 将照片拖拽到此处或者点击上传图标进行上传

  Row(:gutter="16" type='flex' align='bottom' style='margin-top: 10px')
    Col(span= 4 v-for="img in imgs" :key="img")
      div.imgWrapper
        img(:src="img" @contextmenu="deleteImg(img)")
  Modal(
      v-model="deleteImgModal",
      title="提示",
      @on-ok="deleteOk",
      @on-cancel="deleteCancel"
      )
      p 是否删除图片{{ this.deleteImgName }}   
</template>

<script type='text/ecmascript-6'>
import { log } from 'util';
import fs from 'fs'
import path from 'path'
const { ipcRenderer, remote } = require('electron')
const { Menu, MenuItem, dialog } = remote
const os = require('os')
import mixin from '@/utils/mixin'
export default {
  mixins: [mixin],
  data () {
    return {
        folder: '',
        imgs: [],
        saveImagePath: [],
        deleteImgName: '',
        deleteImgModal: false,
        staticPath: path.join(path.join(os.homedir(), '/photo-wall')),
        dragover: false
    };
  },
  created(){
    this.setMenu()
    this.folder = this.$route.params.folder
    // this.folder = `img`
    this.readImgs(path.join(this.staticPath, this.folder))
  },
  methods: {
      onDrop(e){
        this.dragover = true
        Array.from(e.dataTransfer.files).forEach((value, index) => {
          this.saveImagePath.push(value.path)
        })
        this.saveImage()
        this.dragover = false
      },    
      deleteImg(img){
        this.deleteImgName = img
        const menu = new Menu()
        const menuItem = new MenuItem({
            label: '删除图片',
            click: () => {
              this.deleteImgModal = true
            }
        })
        menu.append(menuItem)
        menu.popup(remote.getCurrentWindow())        
      },
      deleteOk(){
        fs.unlink(this.deleteImgName, (err) => {
          if(err){
            this.$Message.info("图片删除失败")
          }else{
            this.$Message.info("图片删除成功")
            this.readImgs(path.join(this.staticPath, this.folder))
          }
        })
      },
      deleteCancel(){
        log("取消图片删除")
      },
      addImage(){
        dialog.showOpenDialog({
          properties: ['openFile', "multiSelections"],
          title: "打开图片",
          filters: [
            {
              name: "Images Files",
              extensions: ["jpg", "png", "svg", "jpeg", "gif", "bmp"]
            }
          ], 
        }, filePaths => {
          if (filePaths){
            this.saveImagePath = filePaths
            this.saveImage()
          }else{
            log("没有选择")
          }
        })
      },
      saveImage(){
        this.saveImagePath.forEach((value, index) => {
          let temp = value.split('\\')
          let imageName = temp[temp.length - 1]
          fs.copyFile(value, `${this.staticPath}/${this.folder}/${imageName}`, (err) => {
            if(err){
              this.$Message.info("上传失败")
            }else{
              this.$Message.info("上传成功")
              this.saveImagePath = []
              this.readImgs(path.join(this.staticPath, this.folder))

            }
          })
        })
      },
      // 读取图片文件夹下面的图片
      readImgs(folder){
        this.imgs = []
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
  },
}

</script>
<style lang='stylus' rel='stylesheet/stylus'>
.main
  padding 16px
  .uploadWrapper
    text-align center
    border 2px dashed rgba(185, 64, 64, 0.21)
    &.is-dragover
    &:hover
      border 2px dashed #A4D8FA
      background-color rgba(164, 216, 250, 0.3)
  .imgWrapper
      img 
        width auto 
        height auto 
        max-width 100%
        max-height 100%
</style>