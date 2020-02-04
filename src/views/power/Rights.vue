<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.level==='0'">一级</el-tag>
            <el-tag type="info" v-else-if="scope.row.level==='1'">二级</el-tag>
            <el-tag type="danger" v-else-if="scope.row.level==='2'">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
import { request } from '@/network/request'
export default {
  name: 'rights',
  data() {
    return {
      //权限列表
      rightsList: []
    }
  },
  created() {
    this.getRights()
  },
  methods: {
    //获取权限列表的数据
    async getRights() {
      const { data: res } = await request({ url: 'rights/list' })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户权限列表失败')
      }
      this.rightsList = res.data
    }
  }
}
</script>
<style lang="less" scoped>
</style>