<!--  -->
<template lang='pug'>
div.main(@contextmenu="newFolderContextMenu")
    Row
        Col(span="4" style='text-align: center' @click.native="addFolder")
            Icon(type="ios-add-circle-outline" size="150" )
    Row
        Col(span="4" v-for="folderName in folders" :key='folderName')
            div.folder(@dblclick="goFolder(folderName)", class='deleteFolder' )
                Icon(type="ios-folder" size="150" @contextmenu.native.stop="deleteFolder(folderName)")
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
export default {
  data () {
    return {
        folders: [],
        newFolder: '',
        newFolderModal: false,
        deleteFolderModal: false,
        deleteFolderName: ''
    };
  },
  created(){
    this.readDir()
    this.setMenu()
  },
  methods: {
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
        this.deleteDir(`${__static}/${this.deleteFolderName}`)
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
        fs.readdirSync(__static).forEach((val, index) => {
        // let fPath = `${path}${val}`
        let fPath = path.join(__static, val)
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
            fs.mkdir(`${__static}\\${this.newFolder}`, (err) => {
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
  }
}

</script>
<style lang='stylus' rel='stylesheet/stylus'>
.main
    .folder
        text-align center
</style>