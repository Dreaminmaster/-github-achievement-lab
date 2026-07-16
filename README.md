# 名画空间 · Painted Worlds

把经典名画重新搭建成可以进入、移动和观察的互动三维空间。项目以手机端体验为主，同时支持电脑浏览；每幅画拥有独立网址，并可通过场景右上角的选择器在作品之间切换。

## 在线入口

**作品目录：**  
https://dreaminmaster.github.io/-github-achievement-lab/

进入任一场景后，点击右上角的场景名称即可返回作品目录或切换到其他名画。

## 已开放场景

| 作品 | 作者 | 年份 | 简介 | 在线体验 |
| --- | --- | ---: | --- | --- |
| **《夜游者》 Nighthawks** | 爱德华·霍普 Edward Hopper | 1942 | 从原画的空间关系重新搭建弧形玻璃餐厅、交叉街道、对街暗楼、后方建筑体、室内 U 形长柜台与四个人物，并向画外自然延伸寂静城市。 | https://dreaminmaster.github.io/-github-achievement-lab/scenes/nighthawks/ |
| **《海边的房间》 Rooms by the Sea** | 爱德华·霍普 Edward Hopper | 1951 | 重建直面海水的门洞、米白墙体、黄色地板、锐利几何日照和左侧相邻起居室，并补全红色沙发、木柜、岩体与动态海面。 | https://dreaminmaster.github.io/-github-achievement-lab/scenes/rooms-by-the-sea/ |
| **《最后的晚餐》 The Last Supper** | 列奥纳多·达·芬奇 Leonardo da Vinci | 1495–1498 | 把画中的透视餐厅与圣玛利亚感恩修道院真实食堂连续起来，重建长桌、三扇远景窗、格状天花、十二门徒和中心人物，并向画面外补全侧墙与餐厅纵深。 | https://dreaminmaster.github.io/-github-achievement-lab/scenes/last-supper/ |
| **《地铁》 The Subway** | 乔治·图克 George Tooker | 1950 | 重建瓷砖柱网、栏栅、闸机、楼梯、中央女子和周围通勤者，以多重消失点向画外延伸迷宫式地下通道。 | https://dreaminmaster.github.io/-github-achievement-lab/scenes/the-subway/ |

## 网址与场景结构

GitHub Pages 在一个仓库中提供一个站点，但站点可以包含很多独立子网址：

```text
/                                  作品目录
/scenes/nighthawks/                《夜游者》
/scenes/rooms-by-the-sea/          《海边的房间》
/scenes/last-supper/               《最后的晚餐》
/scenes/the-subway/                《地铁》
/scenes/<future-scene>/            后续名画场景
```

场景资料统一记录在 [`scenes/manifest.json`](./scenes/manifest.json)。目录页和场景右上角选择器都会读取这份清单。

## 交互方式

- 单指拖动：旋转视角。
- 双指捏合：缩放；松手后保留当前距离。
- 双指拖动：平移；松手后保留当前位置。
- 双击画面或点击“构图 / 复位”：回到原画构图视角。
- “环绕 / 漫游 / 巡游”：开启或关闭缓慢自动观察。
- “灯光 / 阳光 / 光线”：查看主要光源开启和关闭时的空间关系。

## 《最后的晚餐》场景内容

- 以中心人物为单点透视核心，重建长桌和十三人物群像。
- 十二门徒按照四组三人节奏分布，并使用不同身体倾斜和手势表现事件发生后的反应。
- 补全三扇远景窗、格状天花、两侧挂毯、长凳、餐具和食物。
- 把画中的虚构空间与真实修道院食堂的侧向自然光关系连接起来。
- 允许离开初始构图观察侧墙、入口、天花和画外延伸空间。

## 《地铁》场景内容

- 重建中央女子、棕红色与土黄色通勤者、帽子和公文包等人物关系。
- 使用低矮站厅、重复瓷砖柱网、横梁、绿色墙裙和冷白灯带形成压迫感。
- 加入栏栅、闸机、楼梯、侧向通道、后方通道和多组消失方向。
- 栏栅阴影以网格覆盖中央区域，强化被监视与被困住的视觉感受。
- 向画外继续延伸通道，使旋转和移动视角后仍然保持迷宫结构。

## 技术实现

- Three.js r166 固定在仓库的 `vendor/three/` 中，线上运行不依赖第三方 CDN。
- 所有建筑、家具、人物、海面与灯光均由代码程序化生成，没有把原作图片直接贴到三维平面上。
- 所有场景提供移动端触控约束、响应式构图、阴影、雾、颗粒和加载失败提示。
- `scripts/validate.mjs` 检查全部四个场景、依赖、清单、入口和关键交互标记。
- `.github/workflows/scene-validation.yml` 在 PR 中用真实 Chrome 和 SwiftShader 启动全部场景，确认 WebGL 画布创建且加载完成。

## 本地预览

```bash
python3 -m http.server 4173
```

然后打开：

```text
http://localhost:4173/
http://localhost:4173/scenes/nighthawks/
http://localhost:4173/scenes/rooms-by-the-sea/
http://localhost:4173/scenes/last-supper/
http://localhost:4173/scenes/the-subway/
```

## 验证

```bash
node scripts/validate.mjs
```

## 部署

站点直接从 `main` 分支的仓库根目录发布。Pages 设置为：`Deploy from a branch` → `main` → `/(root)`。

## 原 GitHub 练习文档

仓库早期的 GitHub 工作流练习资料保留在 [`docs/`](./docs/) 中。
