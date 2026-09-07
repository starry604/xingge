# 星哥个人展示网站 · 已恢复的源码

完整源码已从之前保存的源仓库恢复。旧的 xingge 文件夹保持原样；今后请维护这个 xingge-source 文件夹。

## 你会得到什么

- 原来的页面设计、Three.js 星轨、D3.js 关系图与 p5.js 流场。
- 用户本次提供的新微信二维码，位于 public/images/wechat.jpg。
- GitHub Pages 自动构建发布工作流，自动适配仓库名。
- 页面资源完整性检查，防止缺少主页、图片或动态脚本时继续发布。

## 用网页完成发布（推荐）

1. 登录 GitHub，新建一个 **Public** 仓库，建议叫 **xingge**。勾选 **Add a README file**，使用 main 分支。不要覆盖你现有的 xingge-ai-kit 仓库。
2. 在新仓库打开 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。
3. 解压提供的源码 ZIP。回到仓库 **Code → Add file → Upload files**，上传解压后的全部源码内容。
4. 仓库最外层应直接看到 **package.json、app、public、scripts、.github**；不要把 xingge-source 整个套在外层。必须保留 `.github/workflows/pages.yml`，它负责发布。
5. 点击 **Commit changes** 提交到 main。进入 **Actions**，打开 **Deploy GitHub Pages**，等待 build 和 deploy 两项变绿。
6. 在 **Settings → Pages → Visit site** 获取网站地址。若用户名是 `jiu-xing`、仓库名是 `xingge`，地址就是 `https://jiu-xing.github.io/xingge/`。

如果首次 Actions 因尚未启用 Pages 失败，完成第 2 步后，在 Actions 打开对应运行，点击 **Re-run all jobs**；或选择工作流右侧 **Run workflow**。

不需要 SSH 私钥、自己的服务器、DNS 设置或第三方部署密钥。GitHub Actions 使用该仓库自带的 GITHUB_TOKEN。

## 以后如何改文案、照片和二维码

- 文案和项目：`app/page.tsx`
- 样式与手机适配：`app/globals.css`
- 浏览器标题与说明：`app/layout.tsx`
- 动效：`lib/visuals-*.ts`
- 微信二维码：`public/images/wechat.jpg`，新图保持同名，提交即可自动更新。
- 动漫头像：`public/images/xingge.jpg`

只提交源码。`dist/client` 是每次构建自动生成的发布文件，**不要用它覆盖源码目录**。自动工作流只发布该目录中的网页文件，源码继续留在仓库。

## 本地开发与验证

建议使用 Node.js 22.13 或以上版本。

```powershell
npm ci
npm run dev
npm run typecheck
npm run build:pages -- --base=/xingge
npm run verify:pages
```

`--base` 对应你想使用的仓库名。GitHub Actions 会从 Pages 配置自动得到路径，无需手动改源码；根站点和配置了自定义域名的根路径也支持。

本页只有一个页面，内部导航使用锚点。框架采用静态导出和资源前缀；图片、图标与二维码下载地址也带相同前缀。这样既支持 `/仓库名/`，又避免当前 Vinext 版本的 basePath 预渲染兼容问题。

Windows 下的成功退出延迟只用于让预渲染服务关闭回调完成，所有失败退出码原样保留。GitHub Actions 在 Ubuntu 上运行，不需要这个补丁。

## 常见问题

- **页面没有样式或头像：** 确认使用自带工作流，Source 选的是 GitHub Actions；不要直接把根域名构建结果上传到项目子目录。
- **没有触发工作流：** 确认文件位置是 `.github/workflows/pages.yml`，并提交到了 main；也可以手动 Run workflow。
- **仓库顶层看不到 package.json：** 上传时多套了一层文件夹，需要把源码内容放到根目录。
- **Actions 提示 npm ci 错误：** package.json 与 package-lock.json 必须一起上传。
- **二维码还是旧图：** 确认替换的是 public/images/wechat.jpg，等 Actions 变绿后刷新页面。

## 验证范围

已检查静态构建、TypeScript、修改代码 lint、子目录资源路径、三种动效分包，以及新二维码文件一致性。尚未在你的 GitHub 账号实际发布，也未执行浏览器交互测试。

脚手架自带但未使用的部分 UI 组件有原有全量 lint 提示，未作无关修改。本次源码包不包含私钥、服务器文件、node_modules 或发布凭据。

参考：[GitHub Pages 自定义工作流](https://docs.github.com/zh/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[选择发布来源](https://docs.github.com/zh/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。
