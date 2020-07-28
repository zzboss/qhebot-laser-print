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

- 图片灰化：通过拿到图片数据数组(`[r,g,b,a,r,g,b,a...]`), 每个 `r,g,b,a` 代表一个像素点, 将 rgb 取平局值即可获取到灰色图片

- 图片黑白化: 将图片灰化后, 取一个中间值, 大于中间值的赋值为 255，其余为 0

- 图片轮廓化:
  - 方案一: 将图片黑白化后, 将每一个点与右边点和下边点比较, 色值不同的则为轮廓, 该方式受黑白化中间点影响较大, 通过调节中间点可以调节轮廓, 通过调节比较的点的距离(即距离右边和下边 2 个点或更多)也可调节轮廓清晰度
  - 方案二: 将图片灰化, 将每个点与右边和下边的点比较，色值相差在一定范围的点视为色值相同, 同色点为 255, 异色点为 0, 通过调节色值比较范围, 可以调节轮廓清晰度
  - 方案三: 直接使用彩色图片, 比较点的 rgb 值, 三个值误差不超过指定值视为同色
