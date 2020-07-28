<template>
  <div class="img-opration">
    <div class="opration-item">
      <span class="opration-label">处理模式:</span>
      <div class="opration-content mode-selector">
        <el-select v-model="mode" placeholder="请选择" @change="changeMode">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
    </div>
    <div class="opration-item">
      <span class="opration-label">图像色值:</span>
      <div class="opration-content">
        <el-slider
          :disabled="mode === '1'"
          v-model="gray"
          show-input
          :min="1"
          :max="99"
          :step="0.01"
        />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["grayValue"],
  data() {
    return {
      min: 10,
      max: 240,
      options: [
        {
          label: "黑白图",
          value: "0"
        },
        {
          label: "灰度图",
          value: "1"
        },
        {
          label: "灰度轮廓图",
          value: "3"
        },
        {
          label: "彩色轮廓图",
          value: "4"
        }
      ],
      mode: "0"
    };
  },
  methods: {
    changeMode() {
      this.$emit("changeMode", this.mode);
    }
  },
  computed: {
    gray: {
      get() {
        return this.grayValue;
      },
      set(val) {
        this.$emit("changeGray", val);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.img-opration {
  display: flex;
  flex-direction: column;

  .opration-item {
    padding: 1rem;
    display: flex;
    .opration-label {
      width: 4.5rem;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding-right: 1rem;
    }
    .opration-content {
      flex: 1;
      margin-right: 1rem;
    }
    .mode-selector {
      display: flex;
      justify-content: flex-start;
    }
  }
}
</style>
