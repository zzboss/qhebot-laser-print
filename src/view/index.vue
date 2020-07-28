<template>
  <main class="container">
    <aside class="area-select">
      <div class="origin-image-container" id="origin-img">
        <img class="img-stage" :src="originPath" alt="no origin image" />
      </div>
      <select-stage class="img-select-stage" @selectImg="selectImage" />
    </aside>
    <main class="area-opration">
      <div class="current-img-container">
        <img
          id="targetImg"
          class="img-stage"
          :src="currentPath"
          alt="no generated image"
        />
      </div>
      <image-opration
        class="img-opration-stage"
        @changeGray="changeGray"
        @changeMode="changeMode"
        :grayValue="grayValue"
      />
    </main>
  </main>
</template>

<script>
import SelectStage from "@/components/select-stage";
import ImageOpration from "@/components/image-opration";
import imgDataUtil from "@/util/imgDataUtil";
export default {
  components: {
    SelectStage,
    ImageOpration
  },
  data() {
    return {
      originPath: "",
      currentPath: "",
      grayValue: 50,
      mode: "0"
    };
  },
  mounted() {
    const targetImg = document.getElementById("targetImg");
    targetImg.onmousedown = event => {
      event.preventDefault();
      console.log(event.clientX, event.clientY);
      console.log(
        targetImg.offsetLeft,
        targetImg.offsetTop,
        targetImg.offsetWidth
      );
    };
  },
  methods: {
    transformImgToDataUrl(filePath) {
      const arr = filePath.split(".");
      const suffix = arr[arr.length - 1];
      if (["jpg", "jpeg", "png"].includes(suffix)) {
        const content = this.fs.readFileSync(filePath).toString("base64");
        return `data:image/${suffix};base64,${content}`;
      }
      return false;
    },
    /**
     * 选中要处理的图片
     */
    selectImage(imgData) {
      this.originPath = imgData;
      this.transeformImg();
    },
    /**
     * 修改图片转换模式,重新生成图片
     */
    changeMode(mode) {
      this.mode = mode;
      this.transeformImg();
    },
    /**
     * 转换图片
     */
    transeformImg() {
      switch (this.mode) {
        case "0":
          this.loadImg(data =>
            imgDataUtil.blackImg(data, (this.grayValue / 100) * 255)
          );
          break;
        case "1":
          this.loadImg(data => imgDataUtil.grayImg(data));
          break;
        case "3":
          this.loadImg((data, width, height) =>
            imgDataUtil.lineImgWithGray(
              data,
              (this.grayValue / 100) * 30,
              width,
              height
            )
          );
          break;
        case "4":
          this.loadImg((data, width, height) =>
            imgDataUtil.lineImgWithRgb(
              data,
              (this.grayValue / 100) * 50,
              width,
              height
            )
          );
          break;
      }
    },
    /**
     * 修改图片灰度
     */
    changeGray(grayValue) {
      this.grayValue = parseInt(grayValue);
      if (this.mode !== "1") {
        this.transeformImg();
      }
    },
    /**
     * 图片通过黑色图片轮廓化
     */
    transeforOutlineWithBlack() {
      this.loadImg((data, width, height) =>
        imgDataUtil.lineImgWithBlack(data, this.grayValue, width, height)
      );
    },
    /**
     * 图片通过灰色图片轮廓化
     */
    transeforOutlineWithGray() {
      this.loadImg((data, width, height) =>
        imgDataUtil.lineImgWithGray(
          data,
          (this.grayValue / 100) * 30,
          width,
          height
        )
      );
    },
    /**
     * 图片加载，用于转换
     * @param {Function} callback 图片数据处理
     */
    loadImg(callback) {
      const img = new Image();
      img.src = this.originPath;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        callback(imageData.data, img.width, img.height);
        ctx.putImageData(imageData, 0, 0);
        this.currentPath = canvas.toDataURL();
      };
    }
  }
};
</script>

<style lang="less" scoped>
.img-stage {
  width: 256px;
  height: 256px;
  margin: 5rem;
  border: solid 2px #ccc;
  box-shadow: #bbb 2px 2px 3px;
}

.container {
  display: flex;
  width: 98vw;
  height: 95vh;
  justify-content: flex-start;
  align-items: flex-start;
  border: solid 1px #bbb;

  .area-select {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-right: solid 1px #bbb;
    margin-right: -1px;

    .origin-image-container {
      flex: 2;
      display: flex;
      justify-content: center;
      align-items: center;
      border-bottom: solid 1px #bbb;
    }
    .img-select-stage {
      flex: 1;
      margin: 0.5rem 0.5rem;
    }
  }
  .area-opration {
    flex: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-left: solid 1px #bbb;

    .current-img-container {
      flex: 2;
      display: flex;
      justify-content: center;
      align-items: center;
      border-bottom: solid 1px #bbb;
    }
    .img-opration-stage {
      flex: 1;
      margin: 0.5rem 0.5rem;
    }
  }
}
</style>
