<template>
  <div class="img-table">
    <div @click="addImg">
      <img src="@/assets/add_image.png" alt="add a image" title="添加图片" />
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
    this.initData() // 如果首次加载需要初始化数据
      .then(() => this.$dbUtil.queryAllImgs()) // 查询所有图片
      .then(res => {
        // 如果有数据选中最后一张
        for (let i = 0; i < res.rows.length; i++) {
          this.imgList.push(res.rows.item(i));
        }
        if (this.imgList && this.imgList.length > 0) {
          this.imgList.reverse();
          this.$emit("selectImg", this.imgList[0].data_url);
        }
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
            that.$dbUtil.deleteImg(imgId).then(() => {
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
      const typeIndex = path.lastIndexOf(".") + 1;
      const fileType = path.substring(typeIndex);
      const bData = fs.readFileSync(path);
      console.log(fileType);
      const imgData = `data:image/${fileType};base64,${bData.toString(
        "base64"
      )}`;
      this.$emit("selectImg", imgData);
      this.$dbUtil
        .insertImg(imgData)
        .then(res =>
          this.imgList.unshift({ id: res.insertId, data_url: imgData })
        );
    },
    /**
     * 初始化数据
     */
    initData() {
      return this.$dbUtil
        .executeSql("CREATE TABLE IF NOT EXISTS init (id unique)")
        .then(() => this.$dbUtil.executeSql("select * from init"))
        .then(res => {
          if (res.rows.length === 0) {
            this.$dbUtil.initImg();
            this.$dbUtil.executeSql("insert into init(id) values(1)");
          }
        })
        .catch(reason => {
          console.log("error log:", reason);
        });
    }
  }
};
</script>

<style lang="less" scoped>
.img-table {
  overflow-y: auto;
  display: flex;
  align-content: flex-start;
  flex-wrap: wrap;
  div {
    width: 5rem;
    margin: 5px;
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
