# API 使用说明

## 概述

前端聊天应用现在使用简化的 API 结构，只支持 DeepSeek 模型，统一调用 `/chatMessage` 端点。

## API 配置

- **API 地址**: Configured via `VITE_API_BASE_URL` environment variable (default: `http://localhost:3000`)
- **端点**: `POST /chatMessage`
- **模型**: DeepSeek (唯一支持)

## 请求格式

```javascript
POST http://localhost:3000/chatMessage
Content-Type: application/json

{
  "chatMessage": [
    {
      "role": "user",
      "content": "用户发送的最新消息"
    }
  ]
}
```

## 使用方法

### 发送聊天消息

```javascript
import { sendChatMessage } from "./api/chatService";

// 发送用户的最新消息
const result = await sendChatMessage("你好，请帮我规划新西兰旅行");

if (result.success) {
  console.log("AI回复:", result.data.reply);
} else {
  console.error("发送失败:", result.error);
}
```

### 测试 API 连接

```javascript
import { testApiConnection } from "./api/chatService";

const isConnected = await testApiConnection();
console.log("API连接状态:", isConnected);
```

### 调试 API 端点

```javascript
import { debugApiEndpoint } from "./api/chatService";

const debugResult = await debugApiEndpoint("/chatMessage");
console.log("调试信息:", debugResult.details);
```

## 响应格式

### 成功响应

```javascript
{
  success: true,
  data: {
    reply: "AI的回复内容",
    originalData: { /* 原始响应数据 */ }
  }
}
```

### 错误响应

```javascript
{
  success: false,
  error: "错误信息"
}
```

## 功能特性

- ✅ 简化的 API 调用
- ✅ 统一的 DeepSeek 模型
- ✅ 支持多轮对话历史
- ✅ 完整的错误处理
- ✅ 流式响应支持
- ✅ 自动重试机制
- ✅ 调试工具

## 注意事项

1. 确保后端服务运行在 `http://localhost:3000`
2. 后端需要提供 `/chatMessage` 端点
3. 后端应该返回 JSON 格式的响应
4. 支持流式和非流式两种响应模式
