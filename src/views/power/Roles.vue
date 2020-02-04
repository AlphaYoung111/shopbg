<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col :span="5">
          <el-button type="primary" @click="dialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 列表 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',i1===0?'bdtop':'']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
              class="v-center"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightTag(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级，三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="{bdtop:i2!==0}"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                  class="v-center"
                >
                  <el-col :span="8">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightTag(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="16">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightTag(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              @click="removeUser(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="small"
              @click="setRightDialog(scope.row)"
            >分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="dialogEdit" width="50%" @close="editClose">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogEdit = false">取 消</el-button>
        <el-button type="primary" @click="editUsers">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="dilogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUsers">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRight" width="50%" @close="setRightDialogClose">
      <!-- 树形控件 -->
      <el-tree
        :data="rightList"
        :default-checked-keys="defKeys"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        ref="treeRef"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRight = false">取 消</el-button>
        <el-button type="primary" @click="checkSetRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { request } from '@/network/request'
export default {
  name: 'roles',
  data() {
    return {
      //角色列表
      rolesList: [],
      //修改用户的数据
      editForm: {},
      //编辑的规则
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      dialogEdit: false,
      //添加对话的显示与隐藏
      dialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      //添加的规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      //分配权限
      setRight: false,
      //权限列表
      rightList: [],
      //自定义的属性控件结构
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      //默认勾选上的值
      defKeys: [],
      roleId: null
    }
  },
  created() {
    this.getRoles()
  },
  methods: {
    //获取角色列表
    async getRoles() {
      const { data: res } = await request({ url: 'roles' })
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      // console.log(res)
      this.rolesList = res.data
    },
    //修改对话框关闭
    editClose() {
      this.$refs.editFormRef.resetFields()
    },
    //提交修改后的用户信息
    editUsers() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const query = {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        }
        const { data: res } = await request({
          url: 'roles/' + this.editForm.roleId,
          params: query,
          method: 'put'
        })
        // console.log(res)
        if (res.meta.status !== 200) {
          this.$message.error('更新角色信息失败')
        }
        this.dialogEdit = false
        this.getRoles()
        this.$message.success('更新角色信息成功')
      })
    },
    //修改对话框
    async showEditDialog(id) {
      const { data: res } = await request('roles/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('查询角色信息失败')
      }
      this.editForm = res.data
      this.dialogEdit = true
    },
    //添加用户对话框关闭
    dilogClose() {
      this.$refs.addFormRef.resetFields()
    },
    //验证表单并且提交
    addUsers() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const query = {
          roleName: this.addForm.roleNamem,
          roleDesc: this.addForm.roleDesc
        }
        const { data: res } = await request({
          url: 'roles',
          params: query,
          method: 'post'
        })
        if (res.meta.status !== 201) {
          this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        //关闭对话框，并且重新刷下用户列表的数据
        this.dialogVisible = false
        this.getRoles()
      })
    },
    //删除用户
    async removeUser(id) {
      const confirmRes = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      //点击取消必须用过catch返回出来，点击确定返回confirm，取消返回cancel
      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除角色')
      }
      const { data: res } = await request({
        url: 'roles/' + id,
        method: 'delete'
      })
      if (res.meta.status !== 200) {
        return this.$message.error('删除信息失败')
      }
      this.$message.success('删除角色成功')
      this.getRoles()
    },
    //根据id删除对应权限
    async removeRightTag(row, rightId) {
      const confirmRes = await this.$confirm(
        '此操作将删除该权限 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('取消删除成功')
      }
      const { data: res } = await request({
        url: `roles/${row.id}/rights/${rightId}`,
        method: 'delete'
      })
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户权限失败')
      }
      this.$message.success('删除用户权限成功')
      //如果调用这个函数的话，那么整个页面都会被重新渲染，不是那么合适
      // this.getRoles()
      // 应该将返回的数值赋值给row重新去渲染
      row.children = res.data
    },
    //分配权限对话框
    async setRightDialog(row) {
      this.roleId = row.id
      const { data: res } = await request({ url: 'rights/tree' })
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightList = res.data
      this.getLeafKeys(row, this.defKeys)
      this.setRight = true
    },
    //获取所有被选中的三级权限id
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    //分配权限对话框关闭
    setRightDialogClose() {
      this.defKeys = []
    },
    //确定分配权限
    async checkSetRight() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const keyStr = keys.join(',')
      const { data: res } = await request({
        url: `roles/${this.roleId}/rights`,
        method: 'post',
        params: { rids: keyStr }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRoles()
      this.setRight = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.v-center {
  display: flex;
  align-items: center;
}
</style>