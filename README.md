# VeiJay

基于 Astro 的个人站点，包含中英文页面、作品与文章、交互流光背景和可配置社交链接。

网站地址：https://vjangel.github.io/

## 在新电脑上开始

安装 Git 和 Node.js 24 LTS（附带 npm），然后运行：

```sh
git clone https://github.com/vjangel/vjangel.github.io.git
cd vjangel.github.io
npm ci
npm run dev
```

打开终端输出的本地地址。`.nvmrc` 记录了建议的 Node.js 版本；使用 nvm 的环境可先运行 `nvm install` 和 `nvm use`。无需全局安装 Astro。首次安装需要联网下载依赖。

## 修改内容

- 中文文章：`src/content/posts/<名称>.md`；英文版本：`src/content/posts/en/<同名>.md`。
- 中文作品：`src/content/projects/<名称>.md`；英文版本：`src/content/projects/en/<同名>.md`。
- 页面文字：`src/lib/i18n.ts`。
- GitHub、X 个人主页：`src/lib/socials.ts`。填写完整链接；空白项自动隐藏。
- 图片和其他公开资源：`public/`。例如 `public/images/example.png` 对应 `/images/example.png`。
- 首页布局：`src/components/HomePage.astro`；样式：`src/styles/global.css`。
- 鼠标背景：`src/scripts/interactive-background.ts`。

文章最少需要以下 Markdown 头部：

```yaml
---
title: 一篇项目笔记
description: 记录项目的思路与实现。
date: 2026-11-12
---
```

作品还需要 `image`，可通过 `featured: true` 放到首页精选区。同名文章或作品暂缺翻译时会使用已有语言版本，并标注正文语言。

## 本地验证与发布

```sh
npm run build
npm run preview
```

构建产物是 `dist/`，不提交到 Git。`node_modules/` 和 `.astro/` 也只保留在本地。更新依赖后一起提交 `package.json` 与 `package-lock.json`，日常安装用 `npm ci`。

首次发布需在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。之后：

- 面向 `main` 的 Pull Request：仅安装依赖和构建检查。
- 推送或合并到 `main`：构建后自动发布。
- 在 `main` 手动运行工作流：可重新部署。

部署配置在 `.github/workflows/deploy.yml`。它只将 `dist/` 上传为站点，不需要手动复制生成文件，也不需要个人访问令牌。实际部署结果以 GitHub Actions 的运行结果为准。

## 公开内容与当前范围

这个 GitHub 仓库是公开的。推送的源码、Markdown、图片以及 Git 历史都可能被他人查看；`public/` 内的内容会随构建直接发布。不要将私密草稿、密钥或个人文件放入待提交目录。

完整光标展馆位于 `/cursor-gallery/`，从首页精选作品和项目介绍均可进入，提供主题浏览、角色预览与试用。主题和预览资源随展馆内容同步更新。博客已有中英文站点改版记录。

### 同步展馆与本地下载

```sh
npm run gallery:sync -- "你的本地 cursor-gallery 目录"
npm run build
npm run preview:gallery
```

同步脚本复制运行页面、脚本、样式及目录实际引用的预览图，不复制 ZIP、缓存或报告。原展馆保持不变。再次更新后可直接运行 `npm run gallery:sync`，它会从被 Git 忽略的 `gallery.local.json` 读取本机源目录。

本地 `dev` 和 `preview:gallery` 通过 Vite 中间件直接读取原目录中的当前版本 ZIP，因此可下载而不用再复制安装包。只允许本机访问，安装包不进入 Git 或 `dist/`；生产环境没有这个本地服务。普通 `npm run preview` 则模拟线上静态版本，未发布的下载入口保持隐藏。

线上展馆通过 `public/cursor-gallery/download-links.js` 中配置的 GitHub Releases 链接提供安装包。已配置下载地址的主题会在详情页显示下载入口。更新安装包时，将 ZIP 上传为 Release 资产并核对下载内容，再按主题 ID 更新对应的版本化链接并重新部署。

`public/cursor-gallery/site-bridge.js` 和 `.css` 负责个人站返回入口、语言衔接及下载状态；同步脚本保留这两个文件和 `download-links.js`，其余展馆核心文件来自原展馆。

旧 Hexo 站点保留在 Git 历史，迁移前提交为 `ef110fa8c6d7e6b13988d6deb39b6b8f677ba6a6`。迁移会替换旧页面结构，旧文章地址尚未建立重定向。

部署参考：[Astro GitHub Pages 文档](https://docs.astro.build/en/guides/deploy/github/)、[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
