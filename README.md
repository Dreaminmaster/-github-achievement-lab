# 名画空间 · Painted Worlds

把经典名画重新搭建成可以进入、移动和观察的互动三维空间。项目以手机端体验为主，同时支持电脑浏览；每幅画拥有独立网址，并可通过场景右上角的选择器在作品之间切换。

## 在线入口

**作品目录：**  
https://dreaminmaster.github.io/-github-achievement-lab/

进入任一场景后，点击右上角的场景名称即可返回作品目录或切换到其他名画。

## 已开放场景

| 作品 | 作者 | 年份 | 简介 | 在线体验 |
| --- | --- | ---: | --- | --- |
| **《夜游者》 Nighthawks** | 爱德华·霍普 Edward Hopper | 1942 | 从原画的空间关系重新搭建弧形玻璃餐厅、交叉街道、对街暗楼、后方建筑体、室内 U 形长柜台与四个人物，并向画外自然延伸寂静城市。手机双指缩放和平移会停留在松手时的位置，不再自动回弹。 | https://dreaminmaster.github.io/-github-achievement-lab/scenes/nighthawks/ |
| **《海边的房间》 Rooms by the Sea** | 爱德华·霍普 Edward Hopper | 1951 | 重建直面海水的门洞、米白墙体、黄色地板、锐利几何日照和左侧相邻起居室；补全红色沙发、木柜、画框、房屋下方岩体与动态海面，同时保留原作不合现实的悬浮感。 | https://dreaminmaster.github.io/-github-achievement-lab/scenes/rooms-by-the-sea/ |

## 网址与场景结构

GitHub Pages 在一个仓库中提供一个站点，但这个站点可以包含很多独立子网址，因此不需要为每幅画新建仓库。

```text
/                                  作品目录
/scenes/nighthawks/                《夜游者》
/scenes/rooms-by-the-sea/          《海边的房间》
/scenes/<future-scene>/            后续名画场景
```

场景资料统一记录在 [`scenes/manifest.json`](./scenes/manifest.json)。目录页和场景右上角选择器都会读取这份清单。以后新增名画时，需要同时：

1. 在 `scenes/` 下建立新的场景目录。
2. 为场景提供独立的 `index.html`、样式和运行代码。
3. 在 `scenes/manifest.json` 中加入作品名称、作者、年份、简介和网址路径。
4. 在本 README 的“已开放场景”表格中加入简介和在线网址。
5. 更新目录页的场景缩略构图与自动验证。

## 交互方式

- 单指拖动：旋转视角。
- 双指捏合：缩放；松手后保留当前距离。
- 双指拖动：平移；松手后保留当前位置。
- 双击画面或点击“构图 / 复位”：回到原画构图视角。
- “环绕 / 漫游”：开启或关闭缓慢自动观察。
- “灯光 / 阳光”：查看主要光源开启和关闭时的空间关系。

## 《夜游者》重构内容

- 重新定义前景横向街道、左侧纵深街道、两组人行道与路缘关系。
- 餐厅改为长条梯形体量，并以真实曲线形成原画中的圆弧玻璃转角。
- 对街建筑与餐厅之间保留明确街道间隔，不再像此前版本那样错误贴合。
- 增加餐厅后方建筑体、画外远处楼体、侧街延伸与稀疏街景。
- U 形柜台、吧椅、咖啡机、杯具、四个人物与玻璃分格重新定位。
- 修复多点触控结束时被误判为“双击复位”的问题。

## 《海边的房间》场景内容

- 主房间、海边门洞、开启的门扇、门框与踢脚线完整建模。
- 动态海面直接抵达门槛，保留原作最重要的超现实空间矛盾。
- 用硬边几何光面和真实方向光共同重现墙面与地面的锐利日照。
- 向左补全相邻房间、红色沙发、木柜和墙上画框。
- 向下补全被原画裁掉的房屋岩体，但从初始构图中保持克制。
- 支持手机端持续缩放、平移、旋转与构图复位。

## 技术实现

- Three.js r166 已固定在仓库的 `vendor/three/` 中，线上运行不依赖第三方 CDN。
- 所有建筑、家具、人物、海面与灯光均由代码程序化生成。
- 场景提供移动端触控约束、响应式构图、阴影、雾、颗粒和加载失败提示。
- `scripts/validate.mjs` 会检查两个场景、所有本地依赖、清单、入口和关键交互标记。

## 本地预览

```bash
python3 -m http.server 4173
```

然后打开：

```text
http://localhost:4173/
http://localhost:4173/scenes/nighthawks/
http://localhost:4173/scenes/rooms-by-the-sea/
```

## 验证

```bash
node scripts/validate.mjs
```

## 部署

站点直接从 `main` 分支的仓库根目录发布。仓库包含 `.nojekyll`，GitHub Pages 会按原样提供 HTML、CSS、JavaScript、本地 Three.js 和所有场景子目录。

Pages 设置：`Deploy from a branch` → `main` → `/(root)`。

## 原 GitHub 练习文档

仓库早期的 GitHub 工作流练习资料保留在 [`docs/`](./docs/) 中。
