<template>
  <main class="container">
    <aside class="area-select">
      <div class="origin-image-container">
        <img class="img-stage" :src="originPath" alt="no origin image" />
      </div>
      <div class="img-table">
        <div @click="addImg">
          <img src="@/assets/add_image.png" alt="add a image" />
        </div>
        <div
          @click="selectImage"
          v-for="(img, index) in imgList"
          :data-path="img"
          :key="index"
        >
          <img :src="require(`@/assets/${img}`)" alt="img" />
        </div>
      </div>
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
export default {
  data() {
    return {
      originPath: "",
      currentPath: "",
      fileSystem: window.require("electron").remote.dialog,
      imgList: ["ct_01.jpg", "ct_02.jpg", "ct_03.jpg", "ct_04.jpeg"]
    };
  },
  mounted() {},
  methods: {
    addImg() {
      this.fileSystem
        .showOpenDialog({
          // 默认打开目录, 桌面
          defaultPath: "C:\\Users\\Public\\Desktop",
          // 允许选择文件
          properties: ["openFile"],
          filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png"] }]
        })
        .then(result => {
          console.log("result", result);
        })
        .catch(err => {
          console.log(err);
        });
    },
    selectImage(e) {
      let imgName = e.currentTarget.dataset.path;
      this.originPath = require(`@/assets/${imgName}`);
      this.transferImg();
    },
    saveImgToLocal(path) {
      console.log(path);
    },
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
          //   grayVal = grayVal > 180 ? 255 : 0;
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
    }
    .img-table {
      flex: 1;
      overflow-y: auto;
      border: solid 1px #bbb;
      margin: 10px 0;
      display: grid;
      justify-content: space-evenly;
      grid-template-columns: repeat(auto-fill, 5rem);
      row-gap: 6px;
      div {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 5rem;
        border: solid 1px black;

        img {
          width: 70%;
          height: 70%;
        }
      }
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
    }
    div:last-child {
      flex: 1;
      margin: 10px 0;
    }
  }
}
</style>
