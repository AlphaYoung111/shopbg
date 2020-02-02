<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="@/assets/logo.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="quitLogin">退出</el-button>
    </el-header>
    <!-- 主体 --> 
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="menuToggle?'64px':'300px'">
        <div class="toggle-button" @click="toggleFloder">|||</div>
        <el-menu
          class="el-menu-vertical-demo"
          background-color="#454c69"
          text-color="#fff"
          active-text-color="#409fff"
          unique-opened
          :collapse="menuToggle"
          :collapse-transition="false"
          router
          :default-active="highLight"
        >
        <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+childItem.path" v-for="childItem in item.children" :key="childItem.id" @click="savePath('/'+childItem.path)">
              <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{childItem.authName}}</span>
            </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主要内容 -->
      <el-main>
        <!-- 子路由区域 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import {request} from '@/network/request'
export default {
  name: 'Home',
  data() {
    return {
      menuList:[],
      iconsObj:{
        '125':'iconfont icon-user',
        '103':'iconfont icon-tijikongjian',
        '101':'iconfont icon-shangpin',
        '102':'iconfont icon-danju',
        '145':'iconfont icon-baobiao',
      },
      menuToggle:false,
      //激活的子菜单
      highLight:''
    }
  },
  created(){
    this.getAllMenu()
    // this.highLight= window.sessionStorage.getItem('highLightPath')
    
  },
  methods: {
    quitLogin() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    //调取所有的菜单
    async getAllMenu(){
      const {data:res} = await request('menus')
      // console.log(res);
      if(res.meta.status!==200){
        this.$message({
          type:'error',
          message:res.meta.msg
        })
      }
      this.menuList =res.data
      
    },
    //折叠侧边栏
    toggleFloder(){
      this.menuToggle=!this.menuToggle  
    },
    //保存菜单被点击高亮
    savePath(path){
      // window.sessionStorage.setItem('highLightPath',path)
      this.highLight=path
    }
  }
}
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: rgb(100, 79, 46);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 2px;
  color: aliceblue;
  font-size: 20px;
  div {
    display: flex;
    align-items: center;
    span {
      margin-left: 10px;
    }
  }
  img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }
}
.el-aside {
  background-color: #454c69;
  .el-menu{
    border-right: 0px;
  }
}
.el-main {
  background-color: rgb(224, 244, 255);
}
.iconfont{
  margin-right: 10px;
}
.toggle-button{
  background-color: rgb(149, 93, 201);
  height: 40px;
  line-height: 40px;
  text-align: center;
  font-size: 20px;
  color: #fff;
  letter-spacing: 10px;
  cursor: pointer;
  
}
</style>