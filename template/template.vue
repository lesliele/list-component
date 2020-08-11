<template>
  <div>
    <Modal
      v-model="isVisible"
      class-name="template-modal"
      :title="title"
      :width="880"
      :mask-closable="isCloseMask"
      @on-visible-change="handleModal"
      transfer>
      <div class="container">
        <div class="left">
          <Card class="card">
            <div class="card_header">
              <p class="mode">已选项<span class="sign">[{{type === 'radio' ? '单选模式' : '多选模式'}}]</span></p>
              <Divider class="divider"/>
            </div>
            <div class="selected_wrapper" v-show="selectedData.length > 0">
              <!-- 已选数据 -->
              <slot name="selected" v-bind:selectedData="selectedData" v-bind:delItem="delItem">
                <span class="item" v-for="item in selectedData" :key="item.id">
                  <p class="title">{{item.name}}</p>
                  <Icon type="ios-close-circle-outline" class="close" title="删除" @click="delItem(item.id)"/>
                </span>
              </slot>
            </div>
            <div class="empty" v-show="selectedData.length === 0">
              暂无选中项
            </div>
          </Card>
        </div>
        <div class="right">
          <!-- 搜索 -->
          <div class="search">
            <slot name="search" v-bind:searchPage="searchPage" v-bind:data="data"></slot>
          </div>
          <Table
            :loading="tableLoading"
            :height="defaultHeight"
            :columns="tableColumn"
            :data="tableData"
            width="620"
            ref="myTable"
            @on-select-cancel="handleSelectCancel"
            @on-select="handleSelect"
            @on-select-all="handleSelectAll"
            @on-select-all-cancel="handleCancelAll"></Table>
          <div v-show="pageTotal" class="list_page">
            <Page
              :total="pageTotal"
              :page-size="pageSize"
              :current="currentPage"
              :page-size-opts="pageSizeOpts"
              @on-change="e => changePage(e)"
              @on-page-size-change="ps => handlePageSize(ps)"
              show-total
              show-sizer></Page>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button type="default" @click="cancel">取消</Button>
        <Button type="primary" @click="comfirm">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Config from './config.js';
import PageHelper from '@/libs/page-helper.js';

export default {
  name: 'listTemplate',
  props: ['status', 'tableColumn', 'formSearch'],
  mixins: [PageHelper],
  data () {
    return {
      isVisible: false,
      isCloseMask: false,
      selectedData: [],
      // 存储已选ID
      hashMap: {},
      // 不同接口的请求参数
      condition: {},
      defaultHeight: 300,
      title: '',
      mode: 'store',
      type: 'radio'
    }
  },
  computed: {
    // 已选数据
    serverData () {
      return this.status.data || [];
    }
  },
  methods: {
    showModal () {
      this.isVisible = true;
    },
    hideModal () {
      this.isVisible = false;
    },
    comfirm () {
      if (this.selectedData.length === 0) {
        this.$Message.error('请选择内容!');
        return false;
      }
      this.hideModal();
      this.$parent.handleData(this.selectedData);
    },
    cancel () {
      this.hideModal();
    },
    handleModal (bool) {
      if (!bool) {
        this.hideModal();
        // 似乎销毁时机太早，导致部分样式未隐藏???
        // this.$nextTick(() => {
        //   this.$parent.handleDestroy();
        // });
        setTimeout(() => {
          this.$parent.handleDestroy();
        }, 1000);
      }
    },
    onLoadData (page, data) {
      let params = Object.assign({}, data, this.condition);
      return this.$ajax.post(this.$api[Config[this.mode].api], params)
      .then(response => {
        const res = response.data;
        if (res.code) {
          this.data = res.data;
        }
      });
    },
    searchPage (searchData) {
      this.condition = searchData;
      this.loadData();
    },
    // 选中项逻辑
    handleSelect (selected, latest) {
      if (this.type === 'radio') {
        this.selectedData = [];
        this.hashMap = {};
        this.selectedData.push(latest);
        this.hashMap[latest.id] = true;
      } else {
        selected.forEach(item => {
          if (!(item.id in this.hashMap)) {
            this.selectedData.push(item);
            this.hashMap[item.id] = true;
          }
        });
      }
      // 进行样式赋值
      this.setCheckStatus();
    },
    handleSelectCancel (selected, cancelItem) {
      this.delItem(cancelItem.id);
    },
    handleSelectAll (selected) {
      // 多选可见
      this.handleSelect(selected);
    },
    handleCancelAll (selected) {
      this.tableData.forEach(item => this.delItem(item.id));
    },
    delItem (id) {
      if (id in this.hashMap) {
        delete this.hashMap[id];
        const index = this.selectedData.findIndex(item => item.id === id);
        this.selectedData.splice(index, 1);
        this.setCheckStatus();
      }
    },
    setCheckStatus () {
      this.tableData.forEach(item => {
        if (item.id in this.hashMap) {
          item._checked = true;
        } else {
          item._checked = false;
        }
      });
    }
  },
  watch: {
    serverData (nV) {
      this.selectedData = [...nV];
      this.selectedData.forEach(item => {
        this.hashMap[item.id] = true;
      });
    },
    tableData () {
      this.tableData.forEach(item => {
        this.$set(item, '_checked', false);
      });
      this.setCheckStatus();
      // 单选隐藏全选框
      const dom = this.$refs.myTable.$el.querySelector('.ivu-table-header').querySelector('.ivu-table-cell-with-selection');
      if (this.type === 'radio') dom.style.display = 'none';
    },
    status ({mode, type}) {
      this.title = Config[mode].title;
      this.mode = mode;
      this.type = type;
      this.condition = {...this.formSearch};
      this.loadData();
    }
  }
}
</script>

<style lang="less">
.template-modal{
  display: flex;
  align-items: center;
  justify-content: center;

  .ivu-modal{
    top: 0;
  }
  .search_input{
    width: 200px;
  }
  .ivu-input-icon{
    right: 50px;
  }
  .container{
    display: flex;
    align-items: flex-start;
    .left{
      flex:1 0 200px;
      margin-right: 20px;
      .card_header{
        font-size: 16px;
        text-align: center;
        .sign{
          color: red;
        }
        .divider{
          margin: 18px 0;
        }
      }
      .selected_wrapper{
        display: flex;
        flex-direction: column;
        height: 300px;
        overflow-y: auto;
        align-items: center;
        padding: 6px 0;
        .item{
          position: relative;
          width: 134px;
          padding: 4px 4px;
          border-radius: 4px;
          border: 1px solid #efefef;
          text-align: center;
          margin-bottom: 10px;
          // .title{
          //   text-overflow: ellipsis;
          //   overflow: hidden;
          //   white-space: nowrap;
          // }
          .close{
            color:#ED4014;
            font-size:16px;
            position: absolute;
            right: -8px;
            top: -8px;
            cursor: pointer;
            font-weight: bold;
          }
        }
      }
      .empty{
        text-align: center;
      }
    }
    .right{
      flex: 1 1 auto;
    }
  }
}
</style>
