<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="消息提示的文案" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 验证表单 -->
      <el-form :model="addForm" :rules="addFormRule" ref="addFormRef" label-position="top">
        <!-- 选项卡 -->
        <el-tabs
          tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                :options="cateList"
                :props="cateProps"
                v-model="addForm.goods_cat"
                @change="handleChange"
                style="width:200px"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(cb,i) in item.attr_vals" border :key="i" :label="cb"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in  onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片上传 -->
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <!-- 商品内容编辑 -->
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" style="margin-top:30px;" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片的对话框 -->
    <el-dialog title="当前图片" :visible.sync="previewVisible" width="50%">
      <img :src="previewUrl" alt class="pre-img" />
    </el-dialog>
  </div>
</template>
<script>
import { request } from '@/network/request'
import _ from 'lodash'
export default {
  name: 'addgoods',
  data() {
    return {
      // 步骤条的选中索引
      activeIndex: '0',
      // 添加商品的数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 级联选择器选中后的数据
        goods_cat: [],
        // 上传图片的临时路径
        pics: [],
        // 绑定富文本编辑对于商品介绍的数据
        goods_introduce: '',
        attrs: []
      },
      // 添加商品的验证
      addFormRule: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选中商品分类', trigger: 'blur' }
        ]
      },
      // 分类列表
      cateList: [],
      // 级联选择配置项
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数数据列表
      manyTableData: [],
      // 静态参数数据列表
      onlyTableData: [],
      // 上传图片的URL
      uploadURL: 'https://www.liulongbin.top:8888/api/private/v1/upload',
      // 上传图片的请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 触发预览事件的图片地址
      previewUrl: '',
      // 预览对话框的显示
      previewVisible: false
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  created() {
    this.getCate()
  },
  methods: {
    // 获取所有商品分类
    async getCate() {
      const { data: res } = await request({
        url: 'categories'
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      this.cateList = res.data
    },
    // 商品分类选择后
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // tab栏离开前后的事件
    beforeTabLeave(active, old) {
      if (old === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请将表单填写完整')
        return false
      }
    },
    // 点击tab栏发生的事件
    async tabClicked() {
      if (this.activeIndex === '1') {
        const { data: res } = await request({
          url: `categories/${this.cateId}/attributes`,
          params: { sel: 'many' }
        })

        if (res.meta.status !== 200) {
          this.$message.error('获取到动态参数失败')
        }
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await request({
          url: `categories/${this.cateId}/attributes`,
          params: { sel: 'only' }
        })
        console.log(res)
        if (res.meta.status !== 200) {
          this.$message.error('获取静态属性参数失败')
        }
        this.onlyTableData = res.data
      }
    },
    // 上传图片时点击预览
    handlePreview(file) {
      this.previewUrl = file.response.data.url
      this.previewVisible = true
    },
    // 点击图片预览时右边的删除事件
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      this.addForm.pics.splice(i, 1)
    },
    // 图片上传成功的方法
    handleSuccess(response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        const paramsObj = _.cloneDeep(this.addForm)
        // 处理商品分类id的数据
        paramsObj.goods_cat = paramsObj.goods_cat.join(',')
        // 处理动态参数和静态参数的提交
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        paramsObj.attrs =this.addForm.attrs
        const { data: res } = await request({
          url: 'goods',
          method: 'post',
          params: paramsObj
        })
        if(res.meta.status!==201){
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  }
}
</script>
<style lang="less" scoped>
.el-tabs {
  margin-top: 15px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.pre-img {
  width: 100%;
}
</style>