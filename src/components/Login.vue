<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avater_box">
        <img src="@/assets/logo.png" alt />
      </div>
      <!-- 登录框 -->
      <el-form
        ref="loginFormRef"
        label-width="0px"
        class="login_form"
        :rules="loginFormRules"
        :model="loginForm"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            prefix-icon="iconfont icon-3702mima"
          ></el-input>
        </el-form-item>
        <!-- 提交按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="signCheck">登录</el-button>
          <el-button type="info" @click="formReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { httpPost,request} from '@/network/request'
import axios from 'axios'
export default {
  name: 'Login',
  data() {
    return {
      //登录表单的数据对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      //登录对象规则
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    formReset() {
      this.$refs.loginFormRef.resetFields()
    },
    signCheck() {
      const obj = this.loginForm
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        // const { data: res } = await httpPost('login', this.loginForm)
        const {data:res} =await request({url:'login',method:'post',params:obj}) 
        if (res.status !== 200) {
          this.$message({
            message: res.meta.msg,
            type: 'warning'
          })
        }
        this.$message({
          message: res.meta.msg,
          type: 'success'
        })
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>
<style lang="less" scoped>
.login_container {
  background-color: #1e62a7;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .avater_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 2px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.login_form {
  position: absolute;
  width: 100%;
  bottom: 0;
  padding: 0 20px;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>