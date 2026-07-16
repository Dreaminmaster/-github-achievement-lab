# 名画空间 · Painted Worlds

把经典名画重新搭建成可以进入、移动和观察的互动三维空间。项目以手机端体验为主，同时支持电脑浏览；每幅画拥有独立网址，并可通过场景右上角的选择器在作品之间切换。

## 在线入口

**作品目录：**  
https://dreaminmaster.github.io/-github-achievement-lab/

进入任一场景后，点击右上角的场景名称即可返回作品目录或切换到其他名画。

## 已开放场景

| 作品 | 作者 | 年份 | 简介 | 在线体验 |
| --- | --- | ---: | --- | --- |
| **《夜游者》 Nighthawks** | 爱德华·霍普 Edward Hopper | 1942 | 以完整三维方式还原深夜街角的玻璃餐厅、人物、柜台、街道、店铺和冷暖灯光关系。支持手机单指旋转、双指缩放与移动、构图复位、灯光切换和缓慢环绕。 | https://dreaminmaster.github.io/-github-achievement-lab/scenes/nighthawks/ |

## 网址与场景结构

GitHub Pages 在一个仓库中提供一个站点，但这个站点可以包含很多独立子网址，因此不需要为每幅画新建仓库。

```text
/                              作品目录
/scenes/nighthawks/            《夜游者》
/scenes/<future-scene>/        后续名画场景
```

场景资料统一记录在 [`scenes/manifest.json`](./scenes/manifest.json)。目录页和场景右上角选择器都会读取这份清单。以后新增名画时，只需：

1. 在 `scenes/` 下建立新的场景目录。
2. 为场景提供独立的 `index.html`、样式和运行代码。
3. 在 `scenes/manifest.json` 中加入作品名称、作者、年份、简介和网址路径。
4. 在本 README 的“已开放场景”表格中加入简介和在线网址。

## 《夜游者》当前能力

- 程序化建立弧形玻璃餐厅、柜台、吧椅、街道、邻近店铺、四个人物、咖啡机、杯具和招牌。
- 使用 Three.js 实现真实三维空间，而不是把画作贴到平面上。
- 手机端支持单指旋转、双指缩放与移动、双击返回画作构图。
- 支持构图、缓慢环绕、室内灯光和视角复位控制。
- 包含玻璃、阴影、雾气、空气尘埃、画面颗粒和响应式镜头构图。
- 场景右上角提供统一作品选择器，可返回目录或切换到后续场景。

## 本地预览

```bash
python3 -m http.server 4173
```

然后打开：

```text
http://localhost:4173/
http://localhost:4173/scenes/nighthawks/
```

## 验证

```bash
node scripts/validate.mjs
```

## 部署

站点直接从 `main` 分支的仓库根目录发布。仓库包含 `.nojekyll`，GitHub Pages 会按原样提供 HTML、CSS、JavaScript 和所有场景子目录。

Pages 设置应为：`Deploy from a branch` → `main` → `/(root)`。

## 原 GitHub 练习文档

仓库早期的 GitHub 工作流练习资料保留在 [`docs/`](./docs/) 中。
