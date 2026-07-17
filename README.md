# 名画空间 · Painted Worlds

把经典名画重新搭建成可以进入、移动和观察的互动三维空间。每个场景先以原画中的透视、建筑、人物和光线关系为骨架，再把画面裁切之外补成能够从不同方向观察的完整环境。

## 在线入口

**作品目录：**  
https://dreaminmaster.github.io/-github-achievement-lab/

进入任一场景后，点击右上角的场景名称即可返回作品目录或切换到其他名画。

## 已开放场景

| 作品 | 作者 | 年份 | 本次空间重建 | 在线体验 |
| --- | --- | ---: | --- | --- |
| **《夜游者》 Nighthawks** | 爱德华·霍普 Edward Hopper | 1942 | 重新安排前景大道、餐馆后方侧街、沿侧街排列的暗楼和餐馆所属建筑；餐馆改成无可见入口的弧形玻璃楔体，柜台、人物、设备和画外街区按同一交叉路口继续展开。 | https://dreaminmaster.github.io/-github-achievement-lab/scenes/nighthawks/ |
| **《海边的房间》 Rooms by the Sea** | 爱德华·霍普 Edward Hopper | 1951 | 保留原画中门槛直接连接海水的超现实矛盾，同时补全起居室、后部走廊、楼梯、储物区、侧窗、外墙板、屋顶、平台、岩基和连续海岸。 | https://dreaminmaster.github.io/-github-achievement-lab/scenes/rooms-by-the-sea/ |
| **《最后的晚餐》 The Last Supper** | 列奥纳多·达·芬奇 Leonardo da Vinci | 1495–1498 | 将画中餐厅改为真正向中心消失点收缩的实体透视盒，并嵌入完整修道院食堂；补全左侧自然光窗、右侧门、长凳、纵深长厅和南墙壁画，可以从人物后方反向观察。 | https://dreaminmaster.github.io/-github-achievement-lab/scenes/last-supper/ |
| **《地铁》 The Subway** | 乔治·图克 George Tooker | 1950 | 放弃泛化现代站厅，重新建立浅宽空间、左侧封闭隔间、右侧栏栅笼与闸机、中央女子和横向人物节奏，并以中央、斜向和横向通道形成多个相互竞争的消失方向。 | https://dreaminmaster.github.io/-github-achievement-lab/scenes/the-subway/ |

## 网址与场景结构

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

## 四幅作品的空间层

### 《夜游者》

- 前景道路与餐馆后方侧街分开建立，不再把周边建筑随意贴合。
- 暗色店铺楼沿侧街朝向餐馆转角，餐馆主体连接后方砖砌建筑。
- 弧形玻璃转角没有人为增加正面入口，保持原作的封闭感。
- 柜台、吧椅、人物、咖啡设备和招牌重新定位。
- 画外建筑继续沿两条既有道路延伸，而不是增加互不关联的体块。

### 《海边的房间》

- 原画可见的主房间、左侧起居室、门扇和硬边日照保持为初始构图核心。
- 裁切之外增加后部走廊、楼梯、书架、桌子和完整围护结构。
- 增加侧窗、外墙板、屋顶、海边平台、立柱、岩基和远处海岸。
- 从正面仍然看到海水抵达门槛；从侧后方则能理解房屋如何立在岩岸上。

### 《最后的晚餐》

- 地面、两侧墙和天花都由前宽后窄的真实几何组成，纵向构件汇向中心消失点。
- 三扇远景窗、收缩的天花格、侧墙挂毯和长桌遵循同一透视系统。
- 十二门徒按四组三人重新安排，中心人物保持独立，犹大略向桌前突出。
- 画中透视房间被嵌入更长的真实修道院食堂。
- 真实食堂增加左侧窗、右侧门、墙边长凳、后部纵深和对面南墙壁画，因此可以绕到人物后方向北观察。

### 《地铁》

- 初始构图改成浅而宽的低矮站厅，而不是规则的现代柱网大厅。
- 左侧增加三个封闭隔间及其中的人物；右侧增加占据前景的栏栅笼和闸机。
- 中央女子、近处通勤者、远处人物与栏栅阴影重新排列。
- 中央通道、左右斜向通道和横向走廊拥有不同消失方向。
- 楼梯、隔间和通道都可以进入，画外延伸仍保持图克作品中的压迫和迷宫感。

## 技术与验证

- Three.js r166 固定在仓库的 `vendor/three/` 中，线上运行不依赖第三方 CDN。
- 所有建筑、家具、人物、海面与灯光均由代码程序化生成，没有把原作图片直接贴到三维平面上。
- 四幅作品拥有独立的高还原空间模块；旧研究模型保留在版本历史中，不再作为线上可见模型。
- `scripts/validate.mjs` 检查全部场景、运行时、清单、入口和关键空间标记。
- `.github/workflows/scene-validation.yml` 使用真实 Chrome 和 SwiftShader 启动全部场景，并输出四张 1440×900 初始构图截图用于视觉审查。

## 本地预览

```bash
python3 -m http.server 4173
```

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
