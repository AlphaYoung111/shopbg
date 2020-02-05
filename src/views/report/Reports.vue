<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <div id="myChart" :style="{width: '750px', height: '400px'}"></div>
    </el-card>
  </div>
</template>
<script>
import { request } from '@/network/request'
import _ from 'lodash'
export default {
  name: 'reports',
  data() {
    return {
      // 需要合并的参数对象
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created() {
  
  },
  mounted() {
    this.drawReport()
  },
  methods: {
    // 图表绘制
   async drawReport() {
      let myChart = this.$echarts.init(document.getElementById('myChart'))
      const { data: res } = await request({
        url: 'reports/type/1'
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取图表数据失败')
      }
       const result =  _.merge(res.data,this.options)
      myChart.setOption(result)
    },
    // 图表数据
  }
}
</script>
<style lang="less" scoped>
</style>