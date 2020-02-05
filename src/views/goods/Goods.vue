<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoods"
            class="input-with-select"
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoods"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" min-width="500px"></el-table-column>
        <el-table-column prop="goods_price" width="80px" label="商品价格（元）"></el-table-column>
        <el-table-column prop="goods_weight" width="60px" label="商品重量"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="160px">
          <template slot-scope="scope">{{scope.row.add_time |dateFormat }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit"></el-button>
            <el-button type="danger" icon="el-icon-delete" @click="deleteGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域  -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>
<script>
import { request } from '@/network/request'
export default {
  name: 'goods',
  data() {
    return {
      // 获取商品数据
      goodsList: [],
      // 获取数据的请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 总条数
      total: 0
    }
  },
  filters: {
    dateFormat(val) {
      const date = new Date(val)
      const y = date.getFullYear()
      const m = (date.getMonth() + 1 + '').padStart(2, '0')
      const d = (date.getDay() + '').padStart(2, '0')
      const h = (date.getHours() + '').padStart(2, '0')
      const min = (date.getMinutes() + '').padStart(2, '0')
      const s = (date.getSeconds() + '').padStart(2, '0')
      return `${y}-${m}-${d} ${h}:${min}:${s}`
    }
  },
  created() {
    this.getGoods()
  },
  methods: {
    // 获取数据
    async getGoods() {
      const { data: res } = await request({
        url: 'goods',
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品数据失败')
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    //点击分页选择第几页
    handleSizeChange(size) {
      this.queryInfo.pagesize = size
      this.getGoods()
    },
    // 点击分页选择一页显示几条
    handleCurrentChange(num) {
      this.queryInfo.pagenum = num
      this.getGoods()
    },
    // 点击删除按钮
    async deleteGoods(id) {
      const resConfirm = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (resConfirm !== 'confirm') {
        return this.$message.info('取消删除成功')
      }
      const { data: res } = await request({
        url: 'goods/' + id,
        method: 'delete'
      })
     if(res.meta.status!==200){
       return this.$message.error('删除失败')
     }
     this.$message.success('删除成功')
     this.getGoods()
    },
    // 跳转添加商品页面
    goAddPage(){
      
      this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang="less" scoped>
</style>