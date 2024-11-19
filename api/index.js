const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

// 加载环境变量
require('dotenv').config();

// 中间件
app.use(express.json());
app.use(cookieParser());

// 配置 CORS，允许携带凭证（Cookie）
app.use(cors({
  origin: 'http://localhost:3000', // 前端应用的地址
  credentials: true,
}));

// 端口
const PORT = process.env.PORT || 3001;

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

const authRoutes = require('./routes/auth');

app.use('/api/auth', authRoutes);

const itemsRoutes = require('./routes/items');

app.use('/api/items', itemsRoutes);