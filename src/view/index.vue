<template>
  <main class="container">
    <aside class="area-select">
      <div class="origin-image-container">
        <img class="img-stage" :src="originPath" alt="no origin image" />
      </div>
      <Select-Stage @selectImg="selectImage" />
    </aside>
    <main class="area-opration">
      <div class="current-img-container">
        <img class="img-stage" :src="currentPath" alt="no generated image" />
      </div>
      <div></div>
    </main>
  </main>
</template>

<script>
import SelectStage from "@/components/select-stage";
export default {
  components: {
    SelectStage
  },
  data() {
    return {
      originPath: "",
      currentPath: ""
    };
  },
  mounted() {},
  methods: {
    /**
     * 选中要处理的图片
     */
    selectImage(imgData) {
      this.originPath = imgData;
      this.transferImg();
    },
    /**
     * 图片转换
     */
    transferImg() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = this.originPath;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          let grayVal = (data[i] + data[i + 1] + data[i + 2]) / 3;
          // 黑白化
          grayVal = grayVal > 125 ? 255 : 0;
          data[i] = grayVal;
          data[i + 1] = grayVal;
          data[i + 2] = grayVal;
        }
        ctx.putImageData(imageData, 0, 0);
        this.currentPath = canvas.toDataURL();
      };
    }
  }
};
</script>

<style lang="less" scoped>
.img-stage {
  width: 20rem;
  height: 20rem;
}

.container {
  display: flex;
  height: 85vh;
  width: 95vw;

  .area-select {
    flex: 1;
    display: flex;
    flex-direction: column;

    .origin-image-container {
      flex: 2;
      display: flex;
      justify-content: center;
      align-items: center;
      border: solid 1px #bbb;
      border-bottom: none;
    }
  }
  .area-opration {
    flex: 1;
    display: flex;
    flex-direction: column;

    .current-img-container {
      flex: 2;
      display: flex;
      justify-content: center;
      align-items: center;
      border: solid 1px #bbb;
      border-left: none;
    }
    div:last-child {
      flex: 1;
    }
  }
}
</style>
