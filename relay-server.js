const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 4256;

let taskQueue = null;
let resultSet = {};

// 1. 外部网页提交问题
app.post('/api/ask', (req, res) => {
    const taskId = `task_${Date.now()}`;
    taskQueue = { taskId, prompt: req.body.prompt };
    console.log(`[中转站] 收到新任务: ${taskId}`);
    res.json({ taskId });
});

// 2. Canvas打工仔来领活
app.get('/api/worker/poll', (req, res) => {
    if (taskQueue) {
        const t = taskQueue;
        taskQueue = null;
        res.json(t);
    } else {
        res.status(204).send();
    }
});

// 3. Canvas打工仔把答案传回来
app.post('/api/worker/callback', (req, res) => {
    const { taskId, reply } = req.body;
    resultSet[taskId] = reply;
    console.log(`[中转站] 任务 ${taskId} 已完成`);
    res.json({ status: 'ok' });
});

// 4. 外部网页拿走答案
app.get('/api/result/:id', (req, res) => {
    const reply = resultSet[req.params.id];
    if (reply) {
        res.json({ reply });
        delete resultSet[req.params.id];
    } else {
        res.status(404).send();
    }
});

app.listen(PORT, () => console.log(`✅ 中转站已启动: http://localhost:${PORT}`));
