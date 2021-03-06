export default {
  data () {
    return {
      currentStatus: {}
    }
  },
  props: {
    mode: String,
    type: String,
    data: Array,
    // extraAddtion代表一些外界的条件,比如店铺下的店员
    extraAddtion: {
      type: Object,
      default () {
        return {};
      }
    }
  },
  methods: {
    // 必须声明的
    showModal() {
      // 数据传递到模板
      this.currentStatus = this.$props;
      this.$refs.listComponent.showModal();
    },
    handleData(data) {
      this.$emit('get-list', data);
    },
    handleDestroy() {
      this.$emit('destroy');
    }
  }
}
