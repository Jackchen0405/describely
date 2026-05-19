# Describely — 跨境商品AI智能文案助手

## 项目概述

为跨境电商卖家打造的 AI 文案生成工具。三步流程：填写基本信息 → AI 智能追问 → 一键生成目标市场全套电商文案。

**当前状态：** 原型阶段，功能完整，本地开发中，未部署上线。

## 技术栈

- **框架：** Next.js 16.2.6 (App Router, Turbopack)
- **语言：** TypeScript
- **样式：** Tailwind CSS v4（自定义暖色调主题）
- **AI 模型：** DeepSeek Chat（文案生成），GPT-4o-mini（图片分析，需 OPENAI_API_KEY）
- **运行环境：** Windows 10/11, Node.js

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 首页落地页（产品介绍）
│   ├── layout.tsx            # 根布局
│   ├── globals.css           # 全局样式 + Tailwind 暖色调主题
│   ├── tool/
│   │   └── page.tsx          # 工具页（三步流程）
│   ├── feedback/
│   │   └── page.tsx          # 公开反馈/评论区
│   └── api/
│       ├── analyze/route.ts  # Step1→2: 生成AI追问 + 图片分析
│       ├── generate/route.ts # Step2→3: 生成全套文案
│       ├── revise/route.ts   # 单字段AI修改
│       └── feedback/route.ts # 反馈提交/读取（存本地JSON）
├── components/
│   ├── ProductForm.tsx       # Step1: 基本信息表单（市场选择、多图上传、成本输入）
│   ├── FollowUpQuestions.tsx # Step2: AI追问 + 竞品差评输入
│   └── GeneratedResults.tsx  # Step3: 结果展示（标题、五点、长描述、A+、SEO、后台词、定价）
├── lib/
│   ├── ai.ts                 # AI调用逻辑（DeepSeek + OpenAI）
│   └── markets.ts            # 10国市场配置（语言、币种、字数限制）
└── types/
    └── index.ts              # 全部TypeScript类型定义
data/
└── feedback.json             # 用户反馈存储
.env.local                    # API Keys（gitignore）
```

## 功能清单

### 三步核心流程
1. **基本信息：** 产品名、品类、目标市场、成本（拿货价+物流费）、利润率、多图上传
2. **AI 追问：** 根据品类生成4-5个关键问题，用户补充细节。含"其他补充"+"竞品差评"可选输入
3. **生成结果：** 查看全部文案，可逐字段AI修改

### 生成的文案类型
- 产品标题（SEO友好，含字数统计）
- 短描述（一句话勾住买家）
- 五点描述（亚马逊核心转化模块，5条差异化卖点）
- 长描述（产品故事+购买理由）
- 后台搜索词（隐藏搜索词，逗号分隔，标签展示）
- A+内容 / EBC（品牌故事 + 3个图文模块）
- 竞品差评分析（基于用户输入的竞品差评提炼痛点）
- SEO 套件（焦点关键词、SEO标题、别名、元描述）
- 定价建议（基于成本+目标市场）
- 产品 URL / Slug

### 交互功能
- **单字段AI修改：** 标题/短描述/五点/长描述旁有"修改"按钮，输入修改要求，AI单独重写该字段
- **多图上传：** 最多4张产品图，综合分析（需OpenAI Key）
- **三步骤自由导航：** 前进/后退均保留已填数据
- **全部字段一键复制**

### 10个目标市场
美国、英国、德国、法国、日本、韩国、西班牙、意大利、巴西、墨西哥
自动适配语言、币种、SEO语言、字数限制（CJK vs Latin两套标准）

### 其他
- 暖色调UI主题（自定义CSS变量）
- Token消耗统计（仅localhost可见）
- 公开反馈页面（/feedback）

## 数据流

```
ProductForm → /api/analyze → DeepSeek生成追问 + GPT-4o分析图片
    ↓
FollowUpQuestions → 用户填写答案 + 可选竞品差评
    ↓
/api/generate → DeepSeek生成全套文案JSON
    ↓
GeneratedResults → 展示 + /api/revise逐字段修改
```

## API 路由

| 路由 | 方法 | 功能 |
|------|------|------|
| /api/analyze | POST | 接收基本信息+图片，返回追问列表+图片分析 |
| /api/generate | POST | 接收基本信息+答案，返回全套文案JSON |
| /api/revise | POST | 接收字段类型+原文+修改指令，返回改写文本 |
| /api/feedback | GET/POST | 读取/提交公开反馈 |

## 环境变量

```
DEEPSEEK_API_KEY=sk-xxx    # 必需，文案生成
OPENAI_API_KEY=sk-xxx      # 可选，图片分析（GPT-4o-mini），未配则静默跳过
```

## 启动方式

```bash
npm install
npm run dev
# 或双击 启动开发服务器.bat
```

访问 http://localhost:3000 看首页，http://localhost:3000/tool 直接用工具。

## 已知限制

- 图片分析依赖OpenAI Key，未配置时上传图片无效（有界面提示）
- DeepSeek 纯文本模型，不支持识图
- 反馈存储为本地JSON文件（data/feedback.json），仅单机可见
- 拉丁语系文案偶有超字数限制（AI倾向写长）
- 未做账户系统、支付系统（原型阶段暂不需要）
