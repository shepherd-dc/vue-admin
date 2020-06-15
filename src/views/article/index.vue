<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="标题" style="width: 226px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select ref="menu" v-model="listQuery.menu_id" placeholder="主栏目" clearable class="filter-item" style="width: 216px" @change="handleFilter">
        <el-option v-for="item in menus" :key="item.id" :label="item.menu_name" :value="item.id" />
      </el-select>
      <el-select v-model="listQuery.column_id" placeholder="子栏目" clearable class="filter-item" style="width: 216px" @change="handleFilter">
        <el-option-group v-for="group in menus" :key="group.id" :label="group.menu_name">
          <el-option v-for="item in group.submenu" :key="item.id" :label="item.name_zh" :value="item.id+'-'+item.path" />
        </el-option-group>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
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
      <el-table-column label="发布时间" prop="time" sortable="custom" width="160px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主栏目" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.menu_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="子栏目" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.column_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="作者" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="110px" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status === 1 ? '发布' : '草稿' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="推荐" class-name="status-col" width="110px" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.recommend | statusFilter">{{ scope.row.recommend === 0 ? '否' : '是' }}</el-tag>
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
  </div>
</template>

<script>
import { fetchList, deleteArticle } from '@/api/article'
import { fetchMenu } from '@/api/menu'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { mapGetters } from 'vuex'

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
        limit: 10,
        menu_id: undefined,
        column_id: undefined,
        title: undefined,
        order: 0
      },
      statusOptions: [1, 0]
    }
  },
  computed: {
    ...mapGetters([
      'menus'
    ])
  },
  created() {
    this.getList()
    if (!this.menus.length) {
      this.getMenu()
    }
  },
  methods: {
    async getList() {
      this.listLoading = true
      const { data } = await fetchList(this.listQuery)
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
      const { data } = await fetchMenu('nav')
      this.$store.commit('menus/saveMenus', data)
      // localStorage.setItem('menus', JSON.stringify(data))
      this.listLoading = false
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
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将删除该篇文章, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteArticle({ id: row.id })
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
    handleUpdate(row) {
      // console.log(row)
      this.$router.push({
        path: `/article/edit/${row.id}`
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
