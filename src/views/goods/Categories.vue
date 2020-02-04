<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col :span="7">
          <el-button type="primary" @click="addCate">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        show-index
        :expand-type="false"
        index-text="#"
        stripe
        border
        class="tree-table"
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            style="color:lightgreen"
            v-if="scope.row.cat_deleted!=='false'"
          ></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag type="danger" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="info" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level===2">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="medium"
            @click="editCate(scope.row)"
          >编辑</el-button>
          <el-button
            type="warning"
            icon="el-icon-delete"
            size="medium"
            @click="deleteCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editForm" ref="editFormRef" label-width="100px" :rules="editFormRules">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="checkEditDialog">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addCateDialogClose"
    >
      <!-- 添加分类的表单 -->
      <el-form :model="addForm" ref="addFormRef" label-width="100px" :rules="addFormRules">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <!-- 父级分类 -->
        <el-form-item label="父级分类">
          <el-cascader
            expand-trigger="hover"
            :options="parentCateList"
            v-model="selectedKeys"
            @change="parentCateChanged"
            :props="cascaderProps"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addChildrenCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 点击删除 -->
  </div>
</template>
<script>
import { request } from '@/network/request'
export default {
  name: 'categories',
  data() {
    return {
      //请求页面数据的参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //商品种类列表
      cateList: [],
      //总页数
      total: 0,
      //columns定义项
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      //编辑分类对话框显示
      editDialogVisible: false,
      //添加分类对话框显示
      addDialogVisible: false,
      // 添加分类的数据
      addForm: {
        cat_name: '',
        //父类等级id
        cat_pid: 0,
        //  默认添加等级为一级分类
        cat_level: 0
      },
      //添加的验证
      addFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      //父级分类列表
      parentCateList: [],
      //父级分类的属性配置项
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 父级分类选择好后的绑定的数据
      selectedKeys: [],
      //编辑发送请求后的数据
      editForm: {
        cat_name: '',
        cat_id: 0
      },
      //修改前的旧值
      oldVal: '',
      // 编辑对话框规则
      editFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCate()
  },
  methods: {
    //获取数据
    async getCate() {
      const { data: res } = await request({
        url: 'categories',
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类信息失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    //监听pagesize的改变
    handleSizeChange(size) {
      this.queryInfo.pagesize = size
      this.getCate()
    },
    //监听pagenum的改变
    handleCurrentChange(num) {
      this.queryInfo.pagenum = num
      this.getCate()
    },
    //添加分类
    addCate() {
      this.getParentCateList()
      this.addDialogVisible = true
    },
    //获取父级分类列表
    async getParentCateList() {
      const { data: res } = await request({
        url: 'categories',
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类列表失败')
      }
      this.parentCateList = res.data
    },
    // 父级分类选择后发生的事件
    parentCateChanged() {
      // 判断是否选择，然后去更改上面的对象
      // 为什么要判断，因为这里使用的hover就会表示选中，就会更改selectedKeys的值
      if (this.selectedKeys.length > 0) {
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addForm.cat_level = this.selectedKeys.length
      } else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    },
    //添加分类对话框确定按钮
    addChildrenCate() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await request({
          url: 'categories',
          method: 'post',
          params: this.addForm
        })        
        if (res.meta.status !== 201) {
          return this.$message.error('添加新分类失败')
        }
        this.$message.succes('添加分类成功')
        this.getCate()
        this.addDialogVisible = false
      })
    },
    // 添加分类对话框关闭
    addCateDialogClose() {
      this.$refs.addFormRef.resetFields()
      // 重置级联选择
      this.selectedKeys = []
      this.addForm.cat_name = ''
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
    },
    //点击编辑
    async editCate(row) {
      const id = row.cat_id
      this.editForm.cat_id = id
      const { data: res } = await request({
        url: 'categories/' + id
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      this.editForm.cat_name = res.data.cat_name
      this.editForm.cat_id = res.data.cat_id
      this.oldVal = res.data.cat_name
      this.editDialogVisible = true
    },
    //编辑对话框关闭
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击编辑对话框的确定按钮
    checkEditDialog() {
      // if (this.oldVal === this.editForm.cat_name) return
      this.$refs.editFormRef.validate(async valid => {
        const { data: res } = await request({
          url: 'categories/' + this.editForm.cat_id,
          method: 'put',
          params: this.editForm.cat_name
        })
        this.$message.success('修改分类成功')
        this.editDialogVisible = false
        this.getCate()
      })
    },
    //删除该类
    async deleteCate(id) {
      const result = await this.$confirm(
        '此操作将永久删除该类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (result !== 'confirm') {
        this.$message.info('取消删除成功')
      }
      const { data: res } = await request({
        url: 'categories/' + id,
        method: 'delete'
      })
      console.log(res);
      
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getCate()
    }
  }
}
</script>
<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>