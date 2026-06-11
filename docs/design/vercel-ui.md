# YApi 前端 UI 规范（Vercel 风格）

> 适用范围：`client/` 全部页面与组件。  
> 参考：Vercel 官网 / Dashboard 的极简、高对比、细边框与克制用色。  
> 实现：Tailwind CSS + shadcn/ui（仅作行为与无障碍基础，视觉以本规范为准）。

---

## 1. 设计原则

| 原则 | 说明 |
|------|------|
| **内容优先** | 减少装饰；边框、阴影、渐变仅用于层次与分区。 |
| **高对比可读** | 正文与背景对比清晰；次要信息用 `neutral-500` 级别，不用纯灰块。 |
| **细边框分区** | 用 `border-neutral-200`（浅色）/ `border-neutral-800`（深色）代替厚重阴影。 |
| **一致圆角** | 控件 `rounded-md`（6px）；大容器 `rounded-lg`（8px）；药丸按钮 `rounded-full` 仅用于 Tag。 |
| **克制品牌色** | 旧版 `#2395f1` 大面积铺色逐步淘汰；品牌仅出现在 Logo 点缀或链接 hover。 |
| **双主题分区** | **营销/登录** 用深色；**工作台** 用浅色（Vercel Dashboard 式）。 |

---

## 2. 色彩 Token

### 2.1 营销 / 登录（深色）

与 `client/src/app/login/page.tsx` 对齐。

| 用途 | Tailwind |
|------|----------|
| 页面背景 | `bg-black` |
| 顶栏/面板底 | `bg-neutral-950` |
| 输入框底 | `bg-neutral-950` |
| 主文字 | `text-white` |
| 次要文字 | `text-neutral-400` |
| 辅助/脚注 | `text-neutral-600` |
| 边框 | `border-neutral-800` |
| 边框 hover / focus | `border-neutral-600` |
| 主按钮 | `bg-white text-black hover:bg-neutral-200` |
| 分段选中 | `bg-neutral-800 text-white` |
| 错误 | `border-red-900/80 bg-red-950/40 text-red-300` |
| 背景光晕 | `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,119,198,0.18), transparent)` |
| 背景网格 | `linear-gradient` 1px 线，`#ffffff08`，`bg-[size:4rem_4rem]` |

### 2.2 工作台（浅色，目标态）

当前 `AppShell` 仍为 `#fafafa` / 深灰顶栏，**新页面与改版请按下列 token 迁移**。

| 用途 | Tailwind |
|------|----------|
| 页面背景 | `bg-[#fafafa]` 或 `bg-neutral-50` |
| 顶栏 | `bg-white/80 backdrop-blur-md border-b border-neutral-200` |
| 卡片/面板 | `bg-white border border-neutral-200 rounded-lg` |
| 主文字 | `text-neutral-900` |
| 次要文字 | `text-neutral-500` |
| 边框 | `border-neutral-200` |
| 悬停行/项 | `hover:bg-neutral-100` |
| 主按钮（浅色区） | `bg-neutral-900 text-white hover:bg-neutral-800` |
| 次按钮 | `border border-neutral-200 bg-white hover:bg-neutral-50` |
| 链接 | `text-neutral-900 underline-offset-4 hover:underline` |
| 选中导航 | `bg-neutral-100 text-neutral-900 font-medium` |

### 2.3 语义色

| 语义 | 浅色工作台 |
|------|------------|
| 成功 | `text-emerald-600` / `bg-emerald-50` |
| 警告 | `text-amber-600` / `bg-amber-50` |
| 错误 | `text-red-600` / `bg-red-50 border-red-200` |
| 信息 | `text-neutral-600` / `bg-neutral-100` |

---

## 3. 字体与排版

- **字体**：沿用 `Inter`（`app/layout.tsx`），与 Vercel 接近。
- **字重**：标题 `font-semibold`；正文 `font-normal`；标签/表头 `font-medium`。
- **字距**：大标题 `tracking-tight`；全大写标签 `tracking-wide text-xs`。

| 级别 | 类名 | 场景 |
|------|------|------|
| H1 | `text-2xl font-semibold tracking-tight` | 页面主标题 |
| H2 | `text-lg font-semibold tracking-tight` | 区块标题 |
| H3 | `text-base font-medium` | 卡片标题 |
| Body | `text-sm text-neutral-900` | 正文 |
| Caption | `text-xs text-neutral-500` | 说明、时间戳 |
| Mono | `font-mono text-xs` | 路径、Method、JSON |

---

## 4. 布局与壳（Layout）

### 4.1 路由与壳对应关系

```
app/
├── page.tsx              → 营销首页（待统一深色/浅色营销风）
├── login/                → 深色认证壳（已实现）
└── (dashboard)/          → 工作台浅色壳
    ├── layout.tsx        → 登录校验 + AppShell
    ├── group/            → 分组列表 / 详情
    ├── project/[id]/     → ProjectShell（侧栏 + 内容）
    └── ...
```

### 4.2 营销 / 登录壳

- 全屏 `min-h-screen bg-black text-white`。
- 顶栏：左 Logo + 右「返回首页」链接。
- 主内容：单列居中 `max-w-[360px]`（登录）或 `max-w-5xl`（营销）。
- 背景：径向光晕 + 网格（见登录页），`pointer-events-none absolute inset-0`。

### 4.3 工作台壳（`AppShell` 目标结构）

```tsx
<div className="min-h-screen bg-[#fafafa]">
  <SiteHeader />  {/* 白底模糊顶栏，高 56px */}
  <main className="mx-auto w-full max-w-[1200px] px-6 py-8">
    {children}
  </main>
</div>
```

- **内容最大宽度**：`1200px`（Vercel Dashboard 偏窄）；列表密时可 `1400px`。
- **水平内边距**：`px-6`（移动端 `px-4`）。
- **区块间距**：页面级 `space-y-8`；卡片内 `space-y-4`。

### 4.4 项目壳（`ProjectShell` 目标结构）

```
┌─────────────────────────────────────────────┐
│ 面包屑  分组 / 项目名                        │
├──────────┬──────────────────────────────────┤
│ 侧栏导航  │  主内容区                         │
│ w-56     │  min-w-0 flex-1                  │
│ 细边框右  │                                  │
└──────────┴──────────────────────────────────┘
```

- 侧栏：`border-r border-neutral-200 bg-white`，项高度 `h-9`，图标 `h-4 w-4`。
- 当前项：`bg-neutral-100 font-medium`，非当前 `text-neutral-600 hover:bg-neutral-50`。
- 面包屑：`text-sm text-neutral-500`，分隔符 `/`，末级 `text-neutral-900`。

### 4.5 顶栏（`SiteHeader` 目标）

- 弃用 `#32363a` 深条 + 蓝色方块 Logo。
- 改为：白底、`border-b`、`h-14`、Logo 为 **三角标 + YApi**（与登录页一致）。
- 导航项：ghost 风格，`text-sm text-neutral-600 hover:text-neutral-900`。
- 搜索框：浅底 `bg-neutral-100 border-0 rounded-md`。

---

## 5. 组件规范

### 5.1 Logo

```tsx
<span className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-800 bg-neutral-950">
  <svg viewBox="0 0 76 65" className="h-3.5 w-3.5 fill-white" aria-hidden>
    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
  </svg>
</span>
```

浅色顶栏：`border-neutral-200 bg-white`，三角 `fill-neutral-900`。

### 5.2 按钮

| 类型 | 深色区 | 浅色区 |
|------|--------|--------|
| Primary | `bg-white text-black hover:bg-neutral-200 h-10 rounded-md` | `bg-neutral-900 text-white hover:bg-neutral-800` |
| Secondary | `border border-neutral-800 bg-transparent hover:bg-neutral-900` | `border border-neutral-200 bg-white hover:bg-neutral-50` |
| Ghost | `text-neutral-400 hover:text-white` | `text-neutral-600 hover:bg-neutral-100` |
| Danger | `bg-red-600 text-white hover:bg-red-500` | 同左 |

- 高度：默认 `h-10`；紧凑 `h-8 text-xs`；图标按钮 `h-9 w-9`。
- 禁用：`disabled:opacity-60 disabled:cursor-not-allowed`。

### 5.3 输入框

**深色**（登录）：

```
h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-white
placeholder:text-neutral-600 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600
```

**浅色**（工作台）：

```
h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm
focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400
```

- Label：`text-xs font-medium text-neutral-500`（浅色）/ `text-neutral-400`（深色）。

### 5.4 卡片

弃用厚重 `shadow-lg` + 蓝色强调。

```tsx
<div className="rounded-lg border border-neutral-200 bg-white p-6">
  <h3 className="text-sm font-medium text-neutral-900">标题</h3>
  <p className="mt-1 text-sm text-neutral-500">描述</p>
</div>
```

- 可点击卡片：加 `transition hover:border-neutral-300 hover:shadow-sm cursor-pointer`。

### 5.5 分段切换（Tabs / Segmented）

Vercel 式胶囊容器：

```tsx
<div className="flex rounded-lg border border-neutral-200 bg-neutral-100 p-1">
  <button className="flex-1 rounded-md py-1.5 text-sm font-medium bg-white shadow-sm">
    选中
  </button>
  <button className="flex-1 rounded-md py-1.5 text-sm text-neutral-500">
    未选
  </button>
</div>
```

shadcn `TabsList` 使用时加：`className="bg-neutral-100 p-1"`，`TabsTrigger` 选中态 `data-[state=active]:bg-white data-[state=active]:shadow-sm`。

### 5.6 表格与列表

- 表头：`text-xs font-medium text-neutral-500 uppercase tracking-wide`。
- 行：`border-b border-neutral-100 hover:bg-neutral-50`。
- 单元格：`py-3 text-sm`。
- 空状态：居中图标 + `text-sm text-neutral-500` + Primary 操作按钮。

### 5.7 反馈

| 状态 | 样式 |
|------|------|
| Loading | 黑色/白色小圆环 `h-4 w-4 animate-spin border-2 border-t-*` |
| 页面 Loading | 居中 `text-sm text-neutral-500` |
| 错误 Alert | `rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600` |
| Toast | 优先 shadcn Sonner；文案简短 |

---

## 6. 间距系统

沿用 Tailwind 4px 基准：

| Token | 值 | 用途 |
|-------|-----|------|
| `gap-2` / `p-2` | 8px | 紧凑控件组 |
| `gap-4` / `p-4` | 16px | 表单字段、卡片内 |
| `gap-6` / `py-6` | 24px | 区块之间 |
| `gap-8` / `py-8` | 32px | 页面级 Section |

---

## 7. 图标与动效

- 图标库：**lucide-react**，描边图标，默认 `h-4 w-4`，与文字并排 `mr-2`。
- 过渡：`transition-colors duration-150`（颜色）；`transition-shadow`（卡片）。
- **避免**大面积 `animate-bounce`、渐变按钮、强阴影。

---

## 8. 代码约定

1. **优先 Tailwind 工具类**；重复 ≥3 次的组合可提取为常量（见登录页 `inputClass`）或 `@apply`（慎用）。
2. **shadcn 组件**保留无障碍与键盘行为，用 `className` 覆盖视觉，不 fork 组件源码除非必要。
3. **不要**在新页面使用 `#2395f1`、`#32363a` 等旧 YApi 色块。
4. **页面文件顶部**用中文块注释说明路由职责（与现有 `page.tsx` 一致）。
5. 共享布局放 `components/layout/`；项目内导航放 `components/project/`。

### 8.1 推荐文件

| 文件 | 职责 |
|------|------|
| `components/layout/app-shell.tsx` | 工作台外壳 |
| `components/layout/site-header.tsx` | 顶栏 |
| `app/login/page.tsx` | 深色认证参考实现 |
| `lib/ui-classes.ts`（可选） | 抽取 `inputDark`、`btnPrimaryLight` 等 |

---

## 9. 迁移清单（由旧 UI → 本规范）

按优先级逐步改，不必一次 PR 全改。

- [ ] `SiteHeader`：深灰条 → 白底模糊顶栏 + 新 Logo
- [ ] `AppShell`：页脚文案、背景色统一
- [ ] `app/page.tsx` 首页：与登录页视觉语言统一
- [ ] `ProjectShell` / `GroupSidebar`：侧栏与面包屑
- [ ] 各页 `Card`：去大阴影、统一边框
- [ ] 主按钮：去 `bg-[#2395f1]`
- [ ] `globals.css`：`--primary` 可改为中性黑（可选，与 shadcn 主题一致）

---

## 10. Do / Don't

**Do**

- 保持大量留白与清晰层级
- 用边框和背景色差分区
- 表单提交按钮写 `type="submit"` + `form onSubmit`
- 深色页与浅色工作台分界清晰

**Don't**

- 不要渐变铺满整页（登录页顶部光晕除外）
- 不要多个主色竞争（蓝 + 紫 + 绿按钮）
- 不要在卡片上堆 `shadow-xl`
- 不要把敏感配置写进组件样式

---

## 11. 参考实现

| 页面 | 路径 | 状态 |
|------|------|------|
| 登录 | `client/src/app/login/page.tsx` | ✅ 已按本规范实现 |
| 登录布局 | `client/src/app/login/layout.tsx` | ✅ |
| 工作台 | `client/src/components/layout/app-shell.tsx` | ⏳ 待迁移 |
| 顶栏 | `client/src/components/layout/site-header.tsx` | ⏳ 待迁移 |

开发新页时：**登录/注册走第 2.1 + 第 4.2 节；登录后页面走第 2.2 + 第 4.3 节。**
