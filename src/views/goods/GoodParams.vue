<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 警示语 -->
      <el-alert title="注意！只允许为第三级分类设置相关参数" type="warning" :closable="false" show-icon></el-alert>

      <!-- 选择区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品的级联选择框 -->
          <el-cascader
            style="width:300px"
            :options="cateList"
            :props="cateProps"
            v-model="selectedCateKeys"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- 选项卡区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="selectedCateKeys.length!==3"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="item"
                  @close="tagClose(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 自定义便签添加 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作" width="300px">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="warning"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            :disabled="selectedCateKeys.length!==3"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="item"
                  @close="tagClose(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 自定义便签添加 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作" width="300px">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="warning"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="checkAddDialog">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑的对话 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="checkEditDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { request } from '@/network/request'
export default {
  name: 'goodparams',
  data() {
    return {
      //全部分类
      cateList: [],
      //级联选择器的配置项
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //选择分类绑定的对象
      selectedCateKeys: [],
      //tbs选项卡选中项
      activeName: 'many',
      // many属性的数据
      manyTableData: [],
      // only属性的数据
      onlyTableData: [],
      // 添加参数对话框的显示
      addDialogVisible: false,
      // 添加对话框的v-mode
      addForm: {
        attr_name: ''
      },
      // 添加对话框的验证规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }]
      },
      // 编辑对话框的显示
      editDialogVisible: false,
      // 编辑对话框的v-model
      editForm: {},
      // 编辑对话框的验证
      editFormRules: {
        attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }]
      }
    }
  },
  computed: {
    //商品的三级id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 添加参数对话框的标题
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态参数'
    }
  },
  created() {
    this.getParams()
  },
  methods: {
    //获取页面参数
    async getParams() {
      const { data: res } = await request({
        url: 'categories'
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取分类列表失败')
      }
      this.cateList = res.data
    },
    // 级联选择器选择后的事件
    handleChange() {
      this.getParamsData()
    },
    //点击tab选项卡
    handleTabClick() {
      this.getParamsData()
    },
    // 封装的点击添加参数的方法
    async getParamsData() {
      // 强制只能选择第三级权限的原理是，只要是存放选择id的数组长度不是3，就立马清空选择器绑定的对象
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      const { data: res } = await request({
        url: `categories/${this.cateId}/attributes`,
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        this.$message.error('请求参数失败')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 由于每一个的显示和v-model的绑定不应该公用，所以应该给每一个item项都添加上
        item.inputVisible = false
        item.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 添加参数对话光关闭重置
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    //点击添加参数对话框确定按钮
    checkAddDialog() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await request({
          url: `categories/${this.cateId}/attributes`,
          method: 'post',
          params: {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.getParamsData()
        this.addDialogVisible = false
      })
    },
    // 点击编辑按钮
    async showEditDialog(id) {
      const { data: res } = await request({
        url: `categories/${this.cateId}/attributes/${id}`,
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取参数失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 重置编辑表单
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击编辑对话框确定按钮
    checkEditDialog() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await request({
          url: `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          method: 'put',
          params: {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        })
        if (res.meta.status !== 200) {
          this.$message.error('提交修改失败')
        }
        this.$message.success('提交修改成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 点击删除按钮
    async deleteParams(id) {
      const resConfim = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (resConfim !== 'confirm') {
        return this.$message.info('取消删除成功')
      }
      const { data: res } = await request({
        url: ` categories/${this.cateId}/attributes/${id}`,
        method: 'delete'
      })
      console.log(res)

      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }

      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    // 自定义便签输入完成后
    handleInputConfirm(row) {
      // 如果输入内容不合法
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 提交数据
      this.saveAttrData(row)
    },
    // 封装的关于tag的数据修改提交的函数
    async saveAttrData(row) {
      const { data: res } = await request({
        url: `categories/${this.cateId}/attributes/${row.attr_id}`,
        method: 'put',
        params: {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('添加参数项失败')
      }
      this.$message.success('添加参数项成功')
    },
    // 便签添加完成后
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除自定义便签
    tagClose(i, row) {
      row.attr_vals.split(i, 1)
      this.saveAttrData(row)
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>