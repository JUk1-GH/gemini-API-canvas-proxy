# Canvas 打工仔 App — 召唤提示词

## 使用方法

1. 打开 [Google Gemini](https://gemini.google.com/)
2. 将下方提示词**完整复制**并发送给 Gemini
3. Gemini 会生成一个 Canvas 应用（右侧会出现代码编辑器）
4. 点击右上角的 **「预览」** 按钮
5. 看到 **「监听中...」** 状态即表示打工仔已上线，等待中转站分配任务

> 注意：必须保持该浏览器标签页处于打开状态，关闭后接力将中断。

---

## 提示词

```
请使用 React 为我开发一个名为"Relay Worker V2"的 Canvas 应用，作为本地服务器与 Gemini API 之间的身份桥接工具。

核心逻辑要求：

1. 单一文件：所有 React 组件、逻辑和样式必须集成在一个 .jsx 文件中。

2. 免密调用：使用 const apiKey = ""; 并调用
   https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}
   利用 Canvas 环境的自动鉴权特性。

3. 中转接力逻辑：
   - 轮询 (Poll)：使用 useEffect 开启死循环（间隔 2-3 秒），向本地接口
     http://localhost:4256/api/worker/poll 请求任务。
   - 执行 (Execute)：一旦获取到 { taskId, prompt }，立即调用 Gemini API 生成回答。
   - 回传 (Callback)：拿到结果后，将 { taskId, reply } 通过 POST 请求发回
     http://localhost:4256/api/worker/callback。

4. 状态管理：需追踪 standby（监听中）、processing（AI计算中）、sending（回传中）
   和 error（连接中断）四种状态。

UI 视觉需求：

1. 暗黑工业风：背景为深蓝色/黑色（#0f172a），具备玻璃拟物化质感。

2. 监控面板：
   - 顶部显示总完成任务计数。
   - 中间显示当前运行状态指示灯（带呼吸动画或旋转图标）。
   - 下方是一个类似"系统终端 (Terminal)"的滚动日志面板，记录每一步的操作时间戳和结果。

3. 图标使用：使用 lucide-react 中的 HardDrive, Activity, CheckCircle, Terminal 等图标。

关键提醒：
在代码注释中明确提醒用户：必须保持此 Canvas 窗口处于"预览"模式，且本地 4256 端口的中转服务器必须已启动。
```
