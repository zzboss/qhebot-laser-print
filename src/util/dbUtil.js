import DBExcutor from "./DBExecutor";
const dbExecutor = new DBExcutor({
  dbName: "imgDb",
  version: "1.0.0",
  description: "save image for select",
  size: 1 * 1024 * 1024
});

const dbUtil = {
  imgDataTableName: "IMG_DATA",
  /**
   * 存储图片数据
   * @param {String} dataUrl 图片base64
   * @returns Promise 插入结果
   */
  insertImg(dataUrl) {
    return this.executeSql(
      `INSERT INTO ${this.imgDataTableName} (data_url) values (?)`,
      [dataUrl]
    );
  },
  /**
   * 生成图片存储数据库表
   * @returns Promise 图片数据库表创建结果
   */
  createImgDb() {
    return this.executeSql(
      `CREATE TABLE IF NOT EXISTS ${this.imgDataTableName} (id integer primary key autoincrement, data_url)`
    );
  },
  /**
   * 删除图片资源
   * @param {String} id 图片id
   */
  deleteImg(id) {
    return this.executeSql(
      `DELETE FROM ${this.imgDataTableName} WHERE id = ?`,
      [id]
    );
  },
  /**
   * sql 执行函数
   */
  executeSql: (sql, params) => dbExecutor.executeSql(sql, params),
  /**
   * 查询所有图片数据
   * @return Promise 全部的图片数据
   */
  queryAllImgs() {
    return this.executeSql(`select * from ${this.imgDataTableName}`);
  },
  /**
   * 初始化图数据库表
   * @returns Promise 首次初始化后的结果
   */
  initImg() {
    this.createImgDb().then(() => {
      const imgList = ["ct_01.jpg", "ct_02.jpg", "ct_03.jpg", "ct_04.jpeg"];
      const promiseList = imgList.map(item => {
        const dataUrl = pathToDataUrl(item);
        return this.insertImg(`data:image/jpg;base64,${dataUrl}`);
      });
      return Promise.all(promiseList);
    });
  }
};

/**
 * 通过图片路径获取图片dataUrl
 * @param {String} imgPath 图片名
 */
function pathToDataUrl(imgPath) {
  const fs = window.require("fs");
  const path = window.require("path");
  const { remote } = window.require("electron");
  const filePath =
    process.env.NODE_ENV === "development"
      ? remote.app.getAppPath() + "\\bundled\\img\\" + imgPath
      : path.join(__dirname, `/img/${imgPath}`);
  return fs.readFileSync(filePath).toString("base64");
}
export default dbUtil;
