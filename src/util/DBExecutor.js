export default class DBExcutor {
  constructor(params) {
    this.db = this.openDB(params);
  }
  /**
   *
   * @param {Obeject} params 数据库参数
   * @returns db 数据库操作对象
   */
  openDB(params) {
    return window.openDatabase(
      params.dbName,
      params.version,
      params.description,
      params.size
    );
  }
  /**
   * 执行sql
   * @param {String} sql 需要执行的sql
   * @param {*} params 执行参数
   * @returns Promise 执行结果
   */
  executeSql(sql, params) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          sql,
          params,
          (tx, value) => resolve(value),
          (tx, reason) => reject(reason)
        );
      });
    });
  }
}
