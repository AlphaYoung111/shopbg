<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 输入框 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" min-width="150px" align="center"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" min-width="50px" align="center"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" min-width="50px" align="center">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status==='0'">未付款</el-tag>
            <el-tag type="success" v-else>付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" min-width="60px" align="center"></el-table-column>
        <el-table-column prop="create_time" label="下单时间" align="center">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="60px" align="center">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="small" @click="showEditDialog"></el-button>
            <el-button type="info" icon="el-icon-location" size="small" @click="showProgressDialog"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="sizeChange"
        @current-change="currentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 4, 6, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>

    <!-- 修改对话框 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <!-- 验证表单 -->
      <el-form :model="editForm" ref="editFormRef" :rules="editFormRule" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData" v-model="editForm.address1" style="width:200px"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editForm.address2"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流信息对话框 -->
    <el-dialog title="物流信息" :visible.sync="progressDialogVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import { request } from '@/network/request'
import cityData from './citydata'
export default {
  name: 'orders',
  data() {
    return {
      // 请求参数的数据
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 获取的数据
      orderList: [],
      // 订单总条数
      total: 0,
      // 修改对话框的显示
      editDialogVisible: false,
      // 修改对话框的数据
      editForm: {
        address1: [],
        address2: ''
      },
      // 修改对话框的验证规则
      editFormRule: {
        address1: [
          { required: true, message: '请输入省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 城市数据
      cityData: cityData,
      // 物流对话框的显示
      progressDialogVisible: false,
      // 物流信息的数据
      progressInfo: []
    }
  },
  created() {
    this.getOrder()
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
  methods: {
    // 请求数据
    async getOrder() {
      const { data: res } = await request({
        url: 'orders',
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据列表失败')
      }
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 分页每页条数事件
    sizeChange(size) {
      this.queryInfo.pagesize = size
      this.getOrder()
    },
    // 第几页事件
    currentChange(num) {
      this.queryInfo.pagenum = num
      this.getOrder()
    },
    // 点击修改按钮显示修改对话框
    showEditDialog() {
      this.editDialogVisible = true
    },
    // 编辑对话框关闭
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击物流地址  显示物流对话框
    async showProgressDialog() {
      const { data: res } = await request({
        url: `/kuaidi/${1106975712662}`
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      this.progressInfo = res.data
      this.progressDialogVisible = true
    }
  }
}
</script>
<style lang="less" scoped>
</style>