<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="栏目名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.menu_id" placeholder="主菜单" clearable class="filter-item" style="width: 130px" @change="handleFilter">
        <el-option v-for="item in menuOptions" :key="item.id" :label="item.menu_name" :value="item.id" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">简介</el-checkbox>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="栏目名" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主菜单" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.menu_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="路由" width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column label="官方文档">
        <template slot-scope="scope">
          <span><a :href="scope.row.official_doc" style="color:#409EFF" target="_blank">{{ scope.row.official_doc }}</a></span>
        </template>
      </el-table-column>
      <el-table-column v-if="showReviewer" label="简介" min-width="300px">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 90%; margin-left:50px;">
        <el-form-item label="主菜单" prop="menu_id">
          <el-select v-model="temp.menu_id" class="filter-item" placeholder="Please select" style="width: 100%;">
            <el-option v-for="item in menuOptions" :key="item.id" :label="item.menu_name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="栏目名" prop="name">
          <el-input v-model="temp.name" @blur="setPath" /></el-form-item>
        <el-form-item label="官网" prop="official_doc">
          <el-input v-model="temp.official_doc" />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input v-model="temp.description" :autosize="{ minRows: 2, maxRows: 10}" type="textarea" />
        </el-form-item>
        <el-form-item label="图片" prop="pic">
          <el-upload
            :on-success="handleSuccess"
            :on-remove="handleRemove"
            :on-exceed="handleExceed"
            :file-list="fileList2"
            :limit="1"
            class="upload-demo"
            :action="imageApi"
            list-type="picture"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="路由">
          <el-input v-model="temp.path" :disabled="true" />
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
import { menuList, submenuList, menuDetail, saveSubmenu, deleteSubmenu, hardDeleteSubmenu } from '@/api/column'
import { deleteImage } from '@/api/menu'
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
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 5,
        menu_id: undefined,
        name: undefined
      },
      menuOptions: [],
      statusOptions: [1, 0],
      showReviewer: false,
      temp: {
        id: undefined,
        menu_id: '',
        name: '',
        description: '',
        official_doc: '',
        pic: '',
        path: '',
        status: 1
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        menu_id: [{ required: true, message: '请选择主菜单', trigger: 'change' }],
        name: [{ required: true, message: '请输入栏目名', trigger: 'blur' }],
        description: [{ required: true, message: '请输入简介', trigger: 'blur' }],
        official_doc: [{ required: true, message: '请输入官方文档地址', trigger: 'blur' }],
        pic: [{ required: true, message: '请上传栏目图片', trigger: 'change' }]
      },
      downloadLoading: false,
      fileList2: []

    }
  },
  computed: {
    imageApi() {
      const host = process.env.VUE_APP_PROXY_URL
      return process.env.NODE_ENV === 'production' ? '/v1/upload/image' : host + '/v1/upload/image'
    }
  },
  async created() {
    await this.getMenu()
    await this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      this.listQuery.status = 0
      const { data } = await submenuList(this.listQuery)
      this.list = data.data
      this.total = data.total
      this.listLoading = false
      // // Just to simulate the time of the request
      // setTimeout(() => {
      //   this.listLoading = false
      // }, 1.5 * 1000)
    },
    async getMenu() {
      this.listLoading = true
      const { data } = await menuList()
      this.menuOptions = data
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        menu_id: '',
        name: '',
        description: '',
        official_doc: '',
        pic: '',
        path: '',
        status: 1
      }
    },
    handleCreate() {
      this.resetTemp()
      this.fileList2 = []
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (valid) {
          const data = await saveSubmenu(this.temp)
          if (data.error_code === 0) {
            this.temp = data.data
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
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
    async setPath() {
      if (this.temp.menu_id) {
        const { data } = await menuDetail({ id: this.temp.menu_id })
        this.temp.path = `${data.en_name}/${this.temp.name}`
      }
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      const filename = row.pic.split('/')
      const name = filename[(filename.length) - 1]
      this.fileList2 = [{
        name: name,
        url: row.pic
      }]
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          saveSubmenu(tempData).then(() => {
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
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将删除该栏目, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        if (row.status === 1) {
          await deleteSubmenu({ id: row.id })
        } else {
          await hardDeleteSubmenu({ id: row.id })
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
    },
    async handleRemove(file, fileList) {
      // console.log(file, fileList)
      await deleteImage(file.name)
      this.fileList2 = []
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择1个文件`)
    },
    async handleSuccess(response, file, fileList) {
      // console.log(response, file, fileList)
      const name = response.data.filename
      let url = response.data.url
      url = process.env.NODE_ENV === 'production' ? url : process.env.VUE_APP_PROXY_URL + url
      const fileItem = {
        name: name,
        url: url + '/' + name
      }
      this.fileList2 = [fileItem]
      this.temp.pic = url + '/' + name
    }
  }
}
</script>

<style>
  .filter-container {
    margin-bottom: 20px;
  }
</style>

