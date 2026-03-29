# Canvas Relay Protocol (CRP) — 灵感接力协议

> 利用 Google Gemini Canvas 预览环境的自动鉴权特性，通过中转接力的方式，让任何外部应用免费调用 Gemini 全系列模型（Flash、Pro 等）。

## 演示视频

https://github.com/user-attachments/assets/demo.mp4

> 以上为使用聊天客户端通过 CRP 调用 Gemini 的案例演示。这只是一个最简实现——基于同样的反向代理思路，你可以将其扩展为 API 网关、多模型路由、批量任务处理等更多场景。

## 架构拓扑

```
┌─────────────┐         ┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   External  │  HTTP   │                 │  HTTP   │  Canvas Worker   │  HTTPS  │             │
│   Client    │◄───────►│  Relay Server   │◄───────►│  (打工仔 App)     │────────►│  Gemini API │
│  index.html │         │  localhost:4256  │         │  Gemini 预览环境   │  自动鉴权 │  googleapis │
└─────────────┘         └─────────────────┘         └────���─────────────┘         └─────────────┘
     你的浏览器              Node.js 中转站             Canvas 自动注入令牌            Google AI
```

## 核心原理

Google Gemini 的 Canvas 预览环境中，系统会通过 Service Worker 自动在发往 `generativelanguage.googleapis.com` 的请求 Header 中注入当前用户的 OAuth2 临时令牌。

由于鉴权令牌是用户级别的 OAuth2 Token，不绑定特定模型，因此可以调用所有 Gemini 模型（Flash、Pro 等），只需修改请求中的模型名称即可。

CRP 利用这一特性，将 Canvas 预览环境作为一个**受控执行���点（Worker）**：

1. **外部客户端**提交问题到中转站
2. **Canvas 打工仔**轮询中转站领取任务，调用 Gemini API（自动鉴权，无需 API Key）
3. 打工仔将结果回传中转站
4. 外部客户端从中转站取回答案

## 三个角色

| 角色 | 位置 | 职责 |
|------|------|------|
| **Relay Server（中转站）** | 本地 Node.js 服务 | 维护任务队列，作为 Worker 和 Client 的交汇点 |
| **Canvas Worker（打工仔）** | Gemini Canvas 预览标签页 | 轮询任务 → 调用 Gemini API → 回传结果 |
| **External Client（外部客户端）** | 任意浏览器页面 | 提交问题，轮询获取答案 |

## 快速开始

### 第 1 步：启动中转站

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/canvas-relay-protocol.git
cd canvas-relay-protocol

# 安装依赖并启动
npm install
node relay-server.js
```

看到 `✅ 中转站已启动: http://localhost:4256` 即表示成功。

### 第 2 步：召唤 Canvas 打工仔

1. 打开 [Google Gemini](https://gemini.google.com/)
2. 将 [`docs/canvas-worker-prompt.md`](docs/canvas-worker-prompt.md) 中的提示词复制并发送给 Gemini
3. Gemini 会生成一个 Canvas 应用，点击右上角的 **「预览」** 按钮
4. 看到界面显示 **「监听中...」** 即表示打工仔已上线

### 第 3 步：开始聊天

1. 用浏览器打开 `index.html`
2. 输入问题，点击「发送」
3. 流程：你的网页 → 中转站 → Canvas 打工仔调用 Gemini API → 结果回传 → 网页显示答案

> 只要不关闭 Canvas 预览标签页，就可以持续使用。

## 项目结构

```
├── relay-server.js              # 中转站服务器
├── index.html                   # 聊天客户端页面
├── package.json                 # 项目依赖
└── docs/
    └── canvas-worker-prompt.md  # Canvas 打工仔 App 的生成提示词
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/ask` | 外部客户端提交问题 `{ prompt }` |
| GET | `/api/worker/poll` | Canvas 打工仔轮询领取任务 |
| POST | `/api/worker/callback` | Canvas 打工仔回传结果 `{ taskId, reply }` |
| GET | `/api/result/:id` | 外部客户端获取答案 |

## 注意事项

- **令牌有效期**：Canvas 注入的鉴权令牌通常约 1 小时有效，过期后刷新预览页面即可。
- **延迟**：由于双向轮询和二次中转，响应时间通常在 5-10 秒。
- **合规性**：本项目仅用于技术研究和学习目的。大规模商业化调用请使用官方 API Key。

## License

[MIT](LICENSE)
