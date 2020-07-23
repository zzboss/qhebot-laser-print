<template>
  <div class="img-table">
    <div @click="addImg">
      <img src="@/assets/add_image.png" alt="add a image" />
    </div>
    <div
      v-for="(img, index) in imgList"
      :data-path="img.data_url"
      :data-id="img.id"
      :key="index"
      @click="selectImage"
      @contextmenu="rightClick"
    >
      <img :src="img.data_url" alt="img" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      imgList: []
    };
  },
  mounted() {
    this.initData(() => {
      this.$dbUtil.queryAllImgs((tx, res) => {
        console.log("res:", res.rows);
        for (let i = 0; i < res.rows.length; i++) {
          this.imgList.push(res.rows.item(i));
        }
        this.imgList.reverse();
        if (this.imgList && this.imgList.length > 0) {
          this.$emit("selectImg", this.imgList[0].data_url);
        }
      });
    });
  },
  methods: {
    /**
     * 选中图片
     */
    selectImage(e) {
      let imgData = e.currentTarget.dataset.path;
      this.$emit("selectImg", imgData);
    },
    /**
     * 右键删除
     */
    rightClick(e) {
      const that = this;
      const imgId = parseInt(e.currentTarget.dataset.id);
      const { remote } = window.require("electron");
      const { Menu, MenuItem } = remote;
      const menu = new Menu();
      menu.append(
        new MenuItem({
          label: "删除",
          click() {
            const img = that.imgList.find(item => item.id === imgId);
            const index = that.imgList.indexOf(img);
            that.$dbUtil.deleteImg(imgId, () => {
              that.imgList.splice(index, 1);
              if (that.imgList && that.imgList.length > 0) {
                that.$emit("selectImg", that.imgList[0].data_url);
              }
            });
          }
        })
      );
      menu.popup(remote.getCurrentWindow());
    },
    /**
     * 添加图片
     */
    addImg() {
      const { dialog } = window.require("electron").remote;
      dialog
        .showOpenDialog({
          // 允许选择文件
          properties: ["openFile"],
          // 支持的文件格式
          filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png"] }]
        })
        .then(result => {
          if (!result.canceled) {
            this.saveImgToLocal(result.filePaths[0]);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * 将电脑文件存到项目下
     */
    saveImgToLocal(path) {
      const fs = window.require("fs");
      const bData = fs.readFileSync(path);
      const imgData = `data:image/png;base64,${bData.toString("base64")}`;
      this.$emit("selectImg", imgData);
      this.$dbUtil.insertImg(imgData, (tx, res) => {
        this.imgList.unshift({ id: res.insertId, data_url: imgData });
      });
    },
    /**
     * 初始化数据
     */
    initData(callback) {
      this.$dbUtil.excute(
        "CREATE TABLE IF NOT EXISTS init (id unique)",
        null,
        () => {
          this.$dbUtil.excute("select * from init", null, (tx, res) => {
            if (res.rows.length === 0) {
              this.$dbUtil.initImg(callback);
              this.$dbUtil.excute("insert into init(id) values(1)");
            } else {
              callback();
            }
          });
        }
      );
    }
  }
};
</script>

<style lang="less" scoped>
.img-table {
  flex: 1;
  overflow-y: auto;
  border: solid 1px #bbb;
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
</style>
