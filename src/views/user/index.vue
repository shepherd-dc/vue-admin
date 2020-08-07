<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.kw" placeholder="用户名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.auth" placeholder="角色权限" clearable class="filter-item" style="width: 130px" @change="handleFilter">
        <el-option v-for="item in authOptions" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <!-- <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">简介</el-checkbox> -->
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="time" sortable="custom" width="160px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="昵称" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column label="权限" width="110px" align="center">
        <template slot-scope="scope">
          <span :style="scope.row.auth === 2 ? 'color:#409EFF' : ''">{{ scope.row.auth === 2 ? '管理员' : '普通用户' }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="官方文档">
        <template slot-scope="scope">
          <span><a :href="scope.row.official_doc" style="color:#409EFF" target="_blank">{{ scope.row.official_doc }}</a></span>
        </template>
      </el-table-column> -->
      <!-- <el-table-column v-if="showReviewer" label="简介" min-width="300px">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="状态" class-name="status-col" width="110px" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status === 1 ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="90px" style="width: 90%; margin-left:50px;">
        <el-form-item label="角色权限" prop="auth">
          <el-select v-model="temp.auth" class="filter-item" placeholder="Please select" style="width: 100%;">
            <el-option v-for="item in authOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-show="dialogStatus==='create'" label="用户名" prop="nickname">
          <el-input v-model="temp.nickname" /></el-form-item>
        <el-form-item v-show="dialogStatus==='create'" label="邮箱" prop="email">
          <el-input v-model="temp.email" type="email" />
        </el-form-item>
        <el-form-item v-show="dialogStatus==='create'" label="密码" prop="password">
          <el-input v-model="temp.password" type="password" />
        </el-form-item>
        <el-form-item v-show="dialogStatus==='create'" label="确认密码" prop="repassword">
          <el-input v-model="temp.repassword" type="password" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item" :label="item===1?'启用':'禁用'" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="width:96%">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { fetchUserList, checkUser, checkAccount, addUser, editUser, deleteUser, hardDeleteUser } from '@/api/user'
import { desEncrypt, desEncryptPlainObject } from '@/utils/crypto'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'danger'
      }
      return statusMap[status]
    }
    // typeFilter(type) {
    //   return calendarTypeKeyValue[type]
    // }
  },
  data() {
    var checkName = async(rule, value, callback) => {
      if (!value) {
        return callback(new Error('昵称不能为空'))
      } else {
        const nickname = desEncrypt(this.temp.nickname, atob(this.key))
        const data = await checkUser({ nickname })
        if (data.error_code === 0) {
          callback()
        } else if (data.error_code === 101) {
          return callback(new Error('昵称已注册'))
        }
      }
    }
    var checkEmail = async(rule, value, callback) => {
      if (!value) {
        return callback(new Error('邮箱不能为空'))
      } else {
        const email = desEncrypt(this.temp.email, atob(this.key))
        const data = await checkAccount({ email })
        if (data.error_code === 0) {
          callback()
        } else if (data.error_code === 100) {
          return callback(new Error('邮箱已注册'))
        }
      }
    }
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.temp.repassword !== '') {
          this.$refs.dataForm.validateField('repassword')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.temp.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        kw: undefined,
        auth: undefined,
        order: 0
      },
      authOptions: [
        { id: 1, name: '普通用户' },
        { id: 2, name: '管理员' }
      ],
      statusOptions: [1, 0],
      showReviewer: false,
      temp: {
        id: undefined,
        auth: 1,
        nickname: '',
        email: '',
        password: '',
        repassword: '',
        status: 1
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        auth: [{ required: true, message: '请选择角色权限', trigger: 'change' }],
        nickname: [{ required: true, validator: checkName, trigger: 'blur' }],
        email: [
          { required: true, validator: checkEmail, trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        password: [{ required: true, validator: validatePass, trigger: 'blur' }],
        repassword: [{ required: true, validator: validatePass2, trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'key'
    ])
  },
  async created() {
    await this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      const { data } = await fetchUserList(this.listQuery)
      this.list = data.data
      this.total = data.total
      this.listLoading = false
      // // Just to simulate the time of the request
      // setTimeout(() => {
      //   this.listLoading = false
      // }, 1.5 * 1000)
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id' || prop === 'time') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.order = 1
      } else {
        this.listQuery.order = 0
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        auth: 1,
        nickname: '',
        email: '',
        password: '',
        repassword: '',
        status: 1
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (valid) {
          const formData = desEncryptPlainObject(this.temp, atob(this.key))
          const res = await addUser(formData)
          if (res.error_code === 0) {
            // this.temp = res.data
            // this.list.unshift(this.temp)
            this.dialogFormVisible = false
            await this.getList()
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          }
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async updateData() {
      const tempData = Object.assign({}, this.temp)
      delete tempData.nickname
      delete tempData.email
      delete tempData.create_time
      const data = await editUser(tempData)
      if (data.error_code === 0) {
        for (const v of this.list) {
          if (v.id === this.temp.id) {
            const index = this.list.indexOf(v)
            this.list.splice(index, 1, this.temp)
            break
          }
        }
        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
      }
    },
    handleDelete(row) {
      this.$confirm('此操作将删除该栏目, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        console.log(row.status)
        if (row.status === 1) {
          await deleteUser({ id: row.id })
        } else {
          await hardDeleteUser({ id: row.id })
        }
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style>
  .filter-container {
    margin-bottom: 20px;
  }
</style>

