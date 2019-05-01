<!--  -->
<template lang='pug'>
div.main(@contextmenu="newFolderContextMenu")
    Row
        Col(span="4" style='text-align: center' @click.native="addFolder")
            Icon(
                type="ios-add-circle-outline" 
                size="150"                
                )
    Row
        Col(span="4" v-for="folderName in folders" :key='folderName' )
            div.folder(@dblclick="goFolder(folderName)", class='deleteFolder' )
                Icon(
                    type="ios-folder" 
                    size="150" 
                    @contextmenu.native.stop="deleteFolder(folderName)" 
                    class='icon upload-area',
                    @drop.native.prevent="onDrop(folderName, $event)" 
                    @dragover.native.prevent="dragoverM"
                    @dragleave.native.prevent="dragleaveM",
                )
                span(style="display: block") {{folderName}}
    
    Modal(
        v-model="newFolderModal",
        title="请输入新建文件夹名称",
        @on-ok="ok",
        @on-cancel="cancel"
        )
        Input(v-model="newFolder")       
    Modal(
        v-model="deleteFolderModal",
        title="提示",
        @on-ok="deleteOk",
        @on-cancel="deleteCancel"
        )
        p 是否删除文件夹{{ this.deleteFolderName}}    

</template>

<script type='text/ecmascript-6'>
import { log } from 'util';
import path from 'path'
import fs from 'fs'
const { ipcRenderer, remote } = require('electron')
const { Menu, MenuItem } = remote
const os = require('os')

export default {
  data () {
    return {
        folders: [],
        newFolder: '',
        newFolderModal: false,
        deleteFolderModal: false,
        deleteFolderName: '',
        staticPath: path.join(path.join(os.homedir(), '/photo-wall')),
        saveImagePath: []
    };
  },
  created(){
    this.readDir()
    this.setMenu()
  },
  mounted(){
      this.disableDragEvent()
  },
  methods: {
    dragoverM(e){
        //图片拖拽上去图标变色
        e.target.classList.add('is-dragover')
    },
    dragleaveM(e){
        //图片离开图标恢复颜色
        e.target.classList.remove('is-dragover')
    },
    disableDragEvent () {
      window.addEventListener('dragenter', this.disableDrag, false)
      window.addEventListener('dragover', this.disableDrag)
      window.addEventListener('drop', this.disableDrag)
    },
    disableDrag (e) {
      const dropzone = document.getElementsByClassName('upload-area')
      if (dropzone.length === 0 || !Array.from(dropzone).includes(e.target)) {
        e.preventDefault()
        e.dataTransfer.effectAllowed = 'none'
        e.dataTransfer.dropEffect = 'none'
      }
    },      
    onDrop(folderName, e){
        Array.from(e.dataTransfer.files).forEach((value, index) => {
            this.saveImagePath.push(value.path)
        })
        this.saveImage(folderName)
    },
    saveImage(folderName){
        this.saveImagePath.forEach((value, index) => {
          let temp = value.split('\\')
          let imageName = temp[temp.length - 1]
          fs.copyFile(value, `${this.staticPath}/${folderName}/${imageName}`, (err) => {
            if(err){
              this.$Message.info("上传失败")
            }else{
              this.$Message.info("上传成功")
              this.saveImagePath = []
              this.readDir()
            }
          })
        })
      },    
    deleteFolder(folderName){
        this.deleteFolderName = folderName
        const menu = new Menu()
        const menuItem = new MenuItem({
            label: '删除文件夹',
            click: () => {
                this.deleteFolderModal = true
            }
        })
        menu.append(menuItem)
        menu.popup(remote.getCurrentWindow())
    },
    deleteOk(){
        //删除文件夹
        this.deleteDir(`${this.staticPath}/${this.deleteFolderName}`)
        this.$Message.info(`${this.deleteFolderName}删除成功`)
        this.deleteFolderName = ''
        this.readDir()
    },
    deleteDir(path){
        let files = []
        if(fs.existsSync(path)){
            files = fs.readdirSync(path)
            files.forEach((file, index) => {
                let curPath = `${path}/${file}`
                if(fs.statSync(curPath).isDirectory()){
                    this.deleteDir(curPath)
                }else{
                    fs.unlinkSync(curPath)
                }
            })
            fs.rmdirSync(path)
        }
    },
    deleteCancel(){
        //取消删除
        this.deleteFolderName = ''
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
    //读取图片文件夹
    readDir(){
        this.folders = []
        fs.readdirSync(this.staticPath).forEach((val, index) => {
        // let fPath = `${path}${val}`
        let fPath = path.join(this.staticPath, val)
        let stats = fs.statSync(fPath)
        if(stats.isDirectory())
            this.folders.push(val)
        })
    },    
    goFolder(folderName){
        this.$router.push({
            name: 'show-img',
            params: {
                folder: folderName
            }
        })
    },
    newFolderContextMenu(){
        const menu = new Menu()
        const menuItem = new MenuItem({
            label: '创建文件夹',
            click: () => {
                this.newFolderModal = true
            }
        })
        menu.append(menuItem)
        menu.popup(remote.getCurrentWindow())        
    },
    addFolder(){
        this.newFolderModal = true  
    },
    ok(){     
        // 检查新建文件夹名称是否已经存在
        if(this.folders.includes(this.newFolder)){
            this.$Message.warning( "文件夹名称不能重复")
        }else{
            fs.mkdir(`${this.staticPath}\\${this.newFolder}`, (err) => {
                if(err){
                    this.$Message.info(`${this.newFolder}创建失败`)
                }else{
                    this.$Message.info(`${this.newFolder}创建成功`)
                    this.readDir()
                }
            })
        }
        this.newFolder = ''
    },
    cancel(){
        this.newFolder = ''
    }  
  },
  beforeDestroy () {
    window.removeEventListener('dragenter', this.disableDrag, false)
    window.removeEventListener('dragover', this.disableDrag)
    window.removeEventListener('drop', this.disableDrag)
  }  
}

</script>
<style lang='stylus' rel='stylesheet/stylus'>
.main
    .folder
        text-align center
        .is-dragover
            color rgba(76, 162, 127, 0.68)
        .icon
            &:hover
                color rgba(76, 162, 127, 0.68)
</style>