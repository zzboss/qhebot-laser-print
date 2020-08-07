# qhebot-laser-print

用于控制激光雕刻机

## 项目搭建

- 使用 vue-cli4 创建 vue 项目: `vue create projectName`
- 添加 electron 依赖: `vue add electron`, 该步骤耗时较长, 完成后会生成 background.js 文件

## 运行

- 使用 `npm run electron:serve` 运行(可以自己在 `package.json` 改命令)

## 开发

- 在渲染进程使用 require 引入 electron api, 需要在 background.js 中的 createWindow 函数中修改构造窗口的参数:

  ```JavaScript
      win = new BrowserWindow({
          width: 800,
          height: 600,
          webPreferences: {
            // 修改这里
            nodeIntegration: true
          }
      });
  ```

- 使用 require: `window.require(...)` 这里 require 被绑定在 window 上

- 图片存储: 选择电脑上的图片后将图片转为 `base64` 数据, 通过 `websql` 存储

  - websql api 封装

    - 原生 websql 基础操作代码

    ```javascript
    function executeSql(sql, params, onResolved, onRejected) {
      db.transaction(tx => {
        tx.executeSql(sql, params, onResolved, onRejected);
      });
    }
    ```

    - websql api 是异步函数, 想要在获取数据后做处理需要使用大量回调来控制函数的顺序执行, 如下

    ```javascript
    function foo(param, dataHandler, errorHandler) {
      db.executeSql(
        "sql_01",
        param,
        res1 =>
          db.executeSql(
            "sql_02",
            res1,
            res2 => db.executeSql("sql_03", res2, dataHandler, errorHandler),
            errorHandler
          ),
        errorHandler
      );
    }
    ```

    - websql 基础操作封装代码

    ```javascript
    function executeSql(sql, params) {
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            sql,
            params,
            (tx, value) => resolve(value),
            (tx, reason) => reject(reason)
          );
        });
      });
    }
    ```

    - 通过 Promise 封装基本的 sql 执行, 返回一个 Promise , 使得数据库操作类似以下代码

    ```javascript
    function foo(param, dataHandler, errorHandler) {
      db.executeSql("sql_01", param)
        .then(res1 => db.executeSql("sql_02", res1))
        .then(res2 => db.executeSql("sql_03", res2))
        .then(dataHandler)
        .catch(errorHandler);
    }
    ```

    - 使用 Promise 封装后同样可以使用 `async` , `await` 优化链式操作

    ```javascript
    async function foo(param, dataHandler, errorHandler) {
      try {
        const res1 = await db.executeSql("sql_01", param);
        const res2 = await db.executeSql("sql_02", res2);
        const res3 = await db.executeSql("sql_03", res3);
        dataHandler(res3);
      } catch (error) {
        errorHandler(error);
      }
    }
    ```

  - 使用方式
    - 基础的执行器类已封装, `new DBExcutor(databaseParam)` 可以创建执行器, 在构造函数中已经做了打开数据库的操作
    - dbUtil 同样已封装好, 并在 main.js 中设置在 Vue 原型上, 调用时使用 `this.$dbUtil.xxx()` 即可

- 图片灰化：通过拿到图片数据数组(`[r,g,b,a,r,g,b,a...]`), 每个 `r,g,b,a` 代表一个像素点, 将 rgb 取平局值即可获取到灰色图片

- 图片黑白化: 将图片灰化后, 取一个中间值, 大于中间值的赋值为 255，其余为 0

- 图片轮廓化:
  - 方案一: 将图片黑白化后, 将每一个点与右边点和下边点比较, 色值不同的则为轮廓, 该方式受黑白化中间点影响较大, 通过调节中间点可以调节轮廓, 通过调节比较的点的距离(即距离右边和下边 2 个点或更多)也可调节轮廓清晰度
  - 方案二: 将图片灰化, 将每个点与右边和下边的点比较，色值相差在一定范围的点视为色值相同, 同色点为 255, 异色点为 0, 通过调节色值比较范围, 可以调节轮廓清晰度
  - 方案三: 直接使用彩色图片, 比较点的 rgb 值, 三个值误差不超过指定值视为同色
