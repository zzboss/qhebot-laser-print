# qhebot-laser-print

用于控制激光雕刻机

## 项目搭建

- 使用 vue-cli4 创建 vue 项目: `vue create projectName`
- 添加 electron 依赖: `vue add electron`, 该步骤耗时较长, 完成后会生成 background.js 文件

## 运行

- 使用 `npm run electron:serve` 运行

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
