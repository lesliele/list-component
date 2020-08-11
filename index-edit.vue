<template>
  <div class="edit-select">
    <slot name="content" v-bind:tagData="tagData" v-bind:handleClose="handleClose">
      <Tag
        color="primary"
        type="dot"
        closable
        :fade="isAnimate"
        @on-close="handleClose(item.id)"
        size="large"
        class="flex_tag"
        v-for="item in tagData"
        :key="item.id">
        {{item.name}}
      </Tag>
    </slot>
    <template v-if="showBtn">
      <slot></slot>
    </template>
  </div>
</template>

<script>
export default {
  props: ['data', 'type'],
  data () {
    return {
      isAnimate: false,
      tagData: []
    }
  },
  computed: {
    showBtn () {
      return (this.type === 'radio' && this.tagData.length === 0) || this.type === 'checkbox';
    }
  },
  methods: {
    reset () {
      this.tagData = [];
    },
    handleClose (id) {
      const index = this.tagData.findIndex(item => item.id === id);
      this.tagData.splice(index, 1);
      this.$emit('del-tag', this.tagData);
    }
  },
  watch: {
    data: {
      handler (nV) {
        this.tagData = [...nV];
      },
      immediate: true
    }
  }
}
</script>
