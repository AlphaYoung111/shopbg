<template>
  <div>
    <!-- 导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 搜索区域 -->
      <el-row :gutter="30">
        <el-col :span="10">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="usersParams.query"
            clearable
            @clear="getUsers"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUsers"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 表单区域 -->
      <el-table :data="usersList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态" width="100px">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              content="修改"
              placement="bottom"
              :enterable="false"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="medium"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="bottom"
              :enterable="false"
            >
              <el-button type="info" icon="el-icon-setting" size="medium"></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="删除用户"
              placement="bottom"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-delete"
                size="medium"
                @click="removeUser(scope.row.id)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="usersParams.pagenum"
        :page-sizes="[1, 2, 3, 10]"
        :page-size="usersParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="dilogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUsers">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 用户修改的对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="dialogEdit" width="50%" @close="editClose">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogEdit = false">取 消</el-button>
        <el-button type="primary" @click="editUsers">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { request } from '@/network/request'
import axios from 'axios'
export default {
  name: 'users',
  data() {
    //验证邮箱的规则
    var checkEmail = (rule, val, cb) => {
      const emialReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (emialReg.test(val)) return cb()
      cb(new Error('请输入正确的邮箱'))
    }
    // 验证手机号码的规则
    var checkMobile = (rule, val, cb) => {
      const mobileReg = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
      if (mobileReg.test(val)) return cb()
      cb(new Error('请输入正确的手机号码'))
    }
    return {
      //users的数据
      usersList: [],
      //发送请求携带的参数
      usersParams: {
        query: '',
        //第几页
        pagenum: 1,
        //每页显示几条
        pagesize: 2
      },
      total: 0,
      //添加对话的显示与隐藏
      dialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //添加表单的验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, max: 12, message: '长度在 5 到 12 个字符', trigger: 'blur' }
        ],
        email: [
          {
            required: true,
            validator: checkEmail,
            message: '请输入正确的邮箱',
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            validator: checkMobile,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      },
      //修改对话框显示
      dialogEdit: false,
      //修改用户的数据
      editForm: {},
      //修改表单的验证规则
      editFormRules: {
        email: [
          {
            required: true,
            validator: checkEmail,
            message: '请输入正确的邮箱',
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            validator: checkMobile,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getUsers()
  },
  methods: {
    async getUsers() {
      const { data: res } = await request({
        url: 'users',
        params: this.usersParams
      })
      // console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('获取用户数据失败')
      this.usersList = res.data.users
      this.total = res.data.total
    },
    //选中框内的页码发生改变
    handleSizeChange(page) {
      this.usersParams.pagesize = page
      this.getUsers()
    },
    //下标页码发生改变
    handleCurrentChange(num) {
      this.usersParams.pagenum = num
      this.getUsers()
    },
    //状态改变
    async userStateChange(user) {
      const { data: res } = await request({
        url: `users/${user.id}/state/${user.mg_state}`,
        method: 'put'
      })
      // console.log(res);
      if (res.meta.status !== 200) {
        user.mg_state = !user.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    //添加用户对话框关闭
    dilogClose() {
      this.$refs.addFormRef.resetFields()
    },
    //验证表单并且提交
    addUsers() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await request({
          url: 'users',
          params: this.addForm,
          method: 'post'
        })
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        //关闭对话框，并且重新刷下用户列表的数据
        this.dialogVisible = false
        this.getUsers()
      })
    },
    //修改对话框关闭
    editClose() {
      this.$refs.editFormRef.resetFields()
    },
    //修改对话框
    async showEditDialog(id) {
      const { data: res } = await request('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      this.dialogEdit = true
    },
    //提交修改后的用户信息
    editUsers() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const query = {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        }
        const { data: res } = await request({
          url: 'users/' + this.editForm.id,
          params: query
        })
        // console.log(res)
        if (res.meta.status !== 200) {
          this.$message.error('更新用户信息失败')
        }
        this.dialogEdit = false
        this.getUsers()
        this.$message.success('更新用户信息成功')
      })
    },
    //删除用户
    async removeUser(id) {
      const confirmRes = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      //点击取消必须用过catch返回出来，点击确定返回confirm，取消返回cancel
      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除用户')
      }
      const { data: res } = await request({
        url: 'users/' + id,
        method: 'delete'
      })
      if (res.meta.status !== 200) {
        return this.$message.error('删除信息失败')
      }
      this.$message.success('删除用户成功')
      this.getUsers()
    }
  }
}
</script>
<style lang="less" scoped>
</style>