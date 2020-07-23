const TABLE_IMG = "IMG_DATA";
const db = window.openDatabase(
  "imgDb",
  "1.0.0",
  "save image for select",
  1 * 1024 * 1024
);
// db.transaction(tx => tx.executeSql("drop table init"));
// db.transaction(tx => tx.executeSql("drop table " + TABLE_IMG));
const dbUtil = {
  TABLE_IMG,
  /**
   * 存储图片数据
   * @param {String} dataUrl 图片base64
   * @param {Function} onSuccess 存储成功的回调
   * @param {Function} onErr 存储失败的回调
   */
  insertImg(dataUrl, onSuccess, onErr) {
    return new Promise((resolve, reject) => {
      this.count++;
      this.excute(
        `INSERT INTO ${TABLE_IMG} (id, data_url) values (?,?)`,
        [new Date().getTime(), dataUrl],
        (tx, res) => {
          onSuccess && onSuccess(tx, res);
          resolve();
        },
        (tx, res) => {
          onErr && onErr(tx, res);
          reject();
        }
      );
    });
  },
  /**
   * 生成图片存储数据库表
   * @param {Function} onSuncess 成功回调
   * @param {Function} onErr 失败回调
   */
  createImgDb(onSuncess, onErr) {
    this.excute(
      `CREATE TABLE IF NOT EXISTS ${TABLE_IMG} (id unique, data_url)`,
      null,
      onSuncess,
      onErr
    );
  },
  /**
   * 删除图片资源
   * @param {String} id 图片id
   * @param {Function} onSuccess 删除成功回调
   * @param {Function} onErr 删除失败回调
   */
  deleteImg(id, onSuccess, onErr) {
    this.excute(
      `DELETE FROM ${TABLE_IMG} WHERE id = ?`,
      [id],
      (tx, res) => {
        this.count--;
        onSuccess && onSuccess(tx, res);
      },
      onErr
    );
  },
  /**
   * sql执行
   * @param {String} sql 需要执行的sql
   * @param {Array} param 执行sql需要的参数
   * @param {Function} onSuccess 成功回调
   * @param {Function} onErr 失败回调
   */
  excute(sql, param, onSuccess, onErr) {
    db.transaction(tx =>
      tx.executeSql(
        sql,
        param,
        (tx, res) => {
          if (onSuccess) {
            onSuccess(tx, res);
          } else {
            console.log("excute success", res);
          }
        },
        (tx, res) => {
          if (onErr) {
            onErr(tx, res);
          } else {
            console.log(`excute err: sql:'${sql}'\nparams:${param}\n`, res);
          }
        }
      )
    );
  },
  /**
   * 查询所有图片数据
   * @param {Function} onSuccess 成功回调
   * @param {Function} onErr 失败回调
   */
  queryAllImgs(onSuccess, onErr) {
    this.excute(`select * from ${this.TABLE_IMG}`, null, onSuccess, onErr);
  },
  /**
   * 初始化图数据库表
   * @param {Function} callback 初始化回调
   */
  initImg(callback) {
    this.createImgDb(() => {
      const fs = window.require("fs");
      const path = window.require("path");
      const { remote } = window.require("electron");
      const imgList = ["ct_01.jpg", "ct_02.jpg", "ct_03.jpg", "ct_04.jpeg"];
      const promiseList = [];
      imgList.forEach(item => {
        const filePath =
          process.env.NODE_ENV === "development"
            ? remote.app.getAppPath() + "\\bundled\\img\\" + item
            : path.join(__dirname, `/img/${item}`);
        console.log(filePath);
        const dataUrl = fs.readFileSync(filePath).toString("base64");
        let p = this.insertImg(`data:image/jpg;base64,${dataUrl}`);
        promiseList.push(p);
      });
      Promise.all(promiseList).then(() => callback());
    });
  }
};

export default dbUtil;
