# 原生 App 端集成指南

> **重要**：原生 App 必须注入名为 `NativeBridge` 的 JavaScript 对象，这是固定的命名。SDK 会自动查找 `window.NativeBridge` 对象。

## 安全建议

1. **验证消息来源** - 确保消息来自可信的 WebView
2. **参数验证** - 验证所有参数的合法性
3. **权限控制** - 敏感操作需要权限检查
4. **URL 白名单** - 只允许加载白名单内的 URL
5. **HTTPS** - 生产环境必须使用 HTTPS

## 核心概念

原生 App 需要做三件事：

1. **注入 Bridge 对象** - 在 WebView 加载前注入名为 `NativeBridge` 的 JavaScript 对象
2. **接收小程序消息** - 处理小程序调用的方法
3. **发送消息给小程序** - 推送事件和返回响应

## 通信协议

### 1. 小程序 → 原生（方法调用）

小程序会通过 `NativeBridge.postMessage()` 发送 JSON 字符串：

```json
{
  "method": "getUserInfo",
  "params": {
    "fields": ["name", "avatar"]
  },
  "requestId": "req_1234567890_1"
}
```

**字段说明：**
- `method` (string, 必需): 方法名
- `params` (object, 可选): 方法参数
- `requestId` (string, 可选): 请求 ID，如果存在则需要返回响应

### 2. 原生 → 小程序（方法响应）

对于需要返回结果的方法调用，原生需要通过 `NativeBridge.onMessage()` 返回响应：

**成功响应：**
```json
{
  "requestId": "req_1234567890_1",
  "data": {
    "id": "123",
    "name": "张三",
    "avatar": "https://..."
  }
}
```

**错误响应：**
```json
{
  "requestId": "req_1234567890_1",
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "用户拒绝授权"
  }
}
```

**字段说明：**
- `requestId` (string, 必需): 请求 ID，必须与请求中的 requestId 一致
- `data` (any, 可选): 成功时返回的数据
- `error` (object, 可选): 错误信息
  - `code` (string): 错误码
  - `message` (string): 错误描述

### 3. 原生 → 小程序（事件推送）

原生可以主动推送事件给小程序：

```json
{
  "type": "theme_changed",
  "data": {
    "theme": "dark"
  },
  "timestamp": 1234567890000
}
```

**字段说明：**
- `type` (string, 必需): 事件类型
- `data` (any, 可选): 事件数据
- `timestamp` (number, 可选): 时间戳（毫秒）

---

