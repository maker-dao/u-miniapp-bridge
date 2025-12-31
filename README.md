# MiniApp Bridge

一个轻量级、零依赖的小程序通信 SDK，用于 WebView 与原生 App 之间的双向通信。

[![npm version](https://img.shields.io/npm/v/u-miniapp-bridge.svg)](https://www.npmjs.com/package/u-miniapp-bridge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 特性

- 🚀 **简单易用** - 几行代码即可集成
- 💪 **类型安全** - 完整的 TypeScript 支持
- 🔄 **双向通信** - 支持方法调用和事件监听
- ⚡ **Promise-based** - 现代化的异步 API
- 🪶 **零依赖** - 体积小巧（< 5KB gzipped）
- 📦 **多种引入方式** - 支持 npm、CDN、ES Module、UMD

---

## 安装

### 方式一：npm 安装（推荐）

```bash
npm install u-miniapp-bridge
```

### 方式二：CDN 引入

```html
<!-- UMD 版本（全局变量 MiniApp） -->
<script src="https://unpkg.com/u-miniapp-bridge@latest/dist/u-miniapp-bridge.umd.js"></script>

<!-- 或使用 jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/u-miniapp-bridge@latest/dist/u-miniapp-bridge.umd.js"></script>
```

---

## 使用方式

### 1. Vue 3 / React / 现代框架

#### 安装

```bash
npm install u-miniapp-bridge
```

#### Vue 3 示例

```vue
<template>
  <div>
    <button @click="getUserInfo">获取用户信息</button>
    <p>{{ user }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { MiniApp } from 'u-miniapp-bridge';

const user = ref(null);
const miniApp = new MiniApp({ debug: true });

onMounted(() => {
  // 初始化
  miniApp.init();

  // 监听主题变化
  const unsubscribe = miniApp.on('theme_changed', (theme) => {
    console.log('主题变化:', theme);
  });

  // 组件卸载时清理
  onUnmounted(() => {
    unsubscribe();
    miniApp.destroy();
  });
});

const getUserInfo = async () => {
  try {
    user.value = await miniApp.call('getUserInfo');
  } catch (error) {
    console.error('获取失败:', error);
  }
};
</script>
```

#### React 示例

```jsx
import { useEffect, useState } from 'react';
import { MiniApp } from 'u-miniapp-bridge';

// 创建全局实例（推荐）
const miniApp = new MiniApp({ debug: true });

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 初始化
    miniApp.init();

    // 监听主题变化
    const unsubscribe = miniApp.on('theme_changed', (theme) => {
      console.log('主题变化:', theme);
    });

    // 清理
    return () => {
      unsubscribe();
      miniApp.destroy();
    };
  }, []);

  const getUserInfo = async () => {
    try {
      const userData = await miniApp.call('getUserInfo');
      setUser(userData);
    } catch (error) {
      console.error('获取失败:', error);
    }
  };

  return (
    <div>
      <button onClick={getUserInfo}>获取用户信息</button>
      {user && <p>{user.name}</p>}
    </div>
  );
}

export default App;
```

---

### 2. 原生 JavaScript（通过 npm）

```javascript
import { MiniApp } from 'u-miniapp-bridge';

const miniApp = new MiniApp({ debug: true });
miniApp.init();

// 调用方法
async function init() {
  const user = await miniApp.call('getUserInfo');
  console.log('用户信息:', user);
}

// 监听事件
miniApp.on('theme_changed', (theme) => {
  document.body.className = theme.theme;
});

init();
```

---

### 3. CDN 引入（原生 HTML）

```html
<!DOCTYPE html>
<html>
<head>
  <title>MiniApp Demo</title>
</head>
<body>
  <button id="getUserBtn">获取用户信息</button>
  <div id="result"></div>

  <!-- 引入 SDK -->
  <script src="https://unpkg.com/u-miniapp-bridge@latest/dist/u-miniapp-bridge.umd.js"></script>

  <script>
    // 通过全局变量 MiniApp 使用
    const { MiniApp } = window.MiniApp;

    const miniApp = new MiniApp({ debug: true });
    miniApp.init();

    // 获取用户信息
    document.getElementById('getUserBtn').addEventListener('click', async () => {
      try {
        const user = await miniApp.call('getUserInfo');
        document.getElementById('result').textContent = JSON.stringify(user, null, 2);
      } catch (error) {
        console.error('获取失败:', error);
      }
    });

    // 监听主题变化
    miniApp.on('theme_changed', (theme) => {
      console.log('主题变化:', theme);
    });
  </script>
</body>
</html>
```

---

### 4. TypeScript 项目

```typescript
import { MiniApp, type MiniAppConfig } from 'u-miniapp-bridge';

const config: MiniAppConfig = {
  debug: true,
  defaultTimeout: 5000,
};

const miniApp = new MiniApp(config);
miniApp.init();

// 类型安全的方法调用
interface UserInfo {
  id: string;
  name: string;
  avatar: string;
}

const user = await miniApp.call<UserInfo>('getUserInfo');
console.log(user.name); // 类型安全
```

---

## API 文档

### 创建实例

```typescript
const miniApp = new MiniApp(config?: MiniAppConfig);
```

**配置选项：**
```typescript
interface MiniAppConfig {
  debug?: boolean;           // 是否开启调试日志，默认 false
  defaultTimeout?: number;   // 默认超时时间（毫秒），默认 5000
}
```

### 初始化

```typescript
miniApp.init(): void
```

初始化 SDK，连接到原生 App 的 `NativeBridge` 对象。

**注意**：原生 App 必须在 WebView 中注入名为 `NativeBridge` 的对象。

### 调用原生方法（异步）

```typescript
miniApp.call<T>(
  method: string,
  params?: Record<string, any>,
  options?: CallOptions
): Promise<T>
```

**示例：**
```javascript
// 获取用户信息
const user = await miniApp.call('getUserInfo');

// 带参数
const result = await miniApp.call('showToast', {
  message: '操作成功',
  duration: 2000
});

// 自定义超时
const location = await miniApp.call('getLocation', {}, {
  timeout: 30000  // 30 秒超时
});
```

### 调用原生方法（不等待响应）

```typescript
miniApp.callMethod(
  method: string,
  params?: Record<string, any>
): boolean
```

**示例：**
```javascript
// 埋点统计（不需要等待响应）
miniApp.callMethod('analytics.track', {
  event: 'page_view',
  page: 'home'
});
```

### 监听原生事件

```typescript
miniApp.on<T>(
  eventType: string,
  listener: (data: T) => void
): () => void  // 返回取消监听函数
```

**示例：**
```javascript
// 监听主题变化
const unsubscribe = miniApp.on('theme_changed', (theme) => {
  console.log('主题:', theme);
});

// 取消监听
unsubscribe();
```

### 取消监听事件

```typescript
miniApp.off(eventType: string, listener: Function): void
```

### 销毁实例

```typescript
miniApp.destroy(): void
```

清理所有资源，取消所有监听。

---

## 通信协议

### 小程序 → 原生（方法调用）

```json
{
  "method": "getUserInfo",
  "params": { "fields": ["name", "avatar"] },
  "requestId": "req_1234567890_1"
}
```

### 原生 → 小程序（响应）

**成功：**
```json
{
  "requestId": "req_1234567890_1",
  "data": { "name": "张三", "avatar": "..." }
}
```

**失败：**
```json
{
  "requestId": "req_1234567890_1",
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "用户拒绝授权"
  }
}
```

### 原生 → 小程序（事件）

```json
{
  "type": "theme_changed",
  "data": { "theme": "dark" },
  "timestamp": 1234567890000
}
```

---

## 原生 App 集成

详细的原生端集成指南请查看：
- [iOS/Android 集成文档](./NATIVE_INTEGRATION.md)
- [异步操作和权限请求处理](./ASYNC_OPERATIONS.md)

### 快速示例

#### iOS (Swift)

```swift
// 注入 Bridge
let script = """
window.NativeBridge = {
    postMessage: function(msg) {
        window.webkit.messageHandlers.miniapp.postMessage(msg);
    },
    onMessage: null
};
"""

// 处理方法调用
func handleMethod(method: String, params: Any?, requestId: String?) {
    switch method {
    case "getUserInfo":
        let user = ["id": "123", "name": "张三"]
        sendResponse(requestId: requestId, data: user)
    default:
        break
    }
}

// 发送事件
func sendEvent(type: String, data: Any?) {
    let event = ["type": type, "data": data]
    let js = "window.NativeBridge.onMessage('\(jsonString)')"
    webView.evaluateJavaScript(js)
}
```

#### Android (Kotlin)

```kotlin
// 注入 Bridge
webView.addJavascriptInterface(this, "AndroidBridge")
val script = """
window.NativeBridge = {
    postMessage: function(msg) { AndroidBridge.postMessage(msg); },
    onMessage: null
};
"""

// 处理方法调用
@JavascriptInterface
fun postMessage(message: String) {
    val json = JSONObject(message)
    val method = json.getString("method")
    // 处理...
}

// 发送事件
fun sendEvent(type: String, data: JSONObject?) {
    val js = "window.NativeBridge.onMessage('$event')"
    webView.evaluateJavaScript(js, null)
}
```

---

## 高级用法

### 单例模式（推荐）

```javascript
// miniapp-instance.js
import { MiniApp } from 'u-miniapp-bridge';

let instance = null;

export function getMiniApp() {
  if (!instance) {
    instance = new MiniApp({ debug: true });
    instance.init();
  }
  return instance;
}

// 使用
import { getMiniApp } from './miniapp-instance';

const miniApp = getMiniApp();
const user = await miniApp.call('getUserInfo');
```

### 权限管理工具类

```javascript
class PermissionManager {
  constructor(miniApp) {
    this.miniApp = miniApp;
    this.pendingRequests = new Map();

    this.miniApp.on('permission_result', (data) => {
      const callback = this.pendingRequests.get(data.permission);
      if (callback) {
        callback(data.granted);
        this.pendingRequests.delete(data.permission);
      }
    });
  }

  async request(permission, timeout = 60000) {
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(permission, resolve);

      this.miniApp.call('requestPermission', { permission }, { timeout })
        .then(result => {
          if (result.status !== 'pending') {
            this.pendingRequests.delete(permission);
            resolve(result.granted);
          }
        })
        .catch(error => {
          this.pendingRequests.delete(permission);
          reject(error);
        });
    });
  }
}

// 使用
const pm = new PermissionManager(miniApp);
const granted = await pm.request('camera');
```

---

## 示例项目

查看 `examples/demo.html` 获取完整的演示示例（可直接在浏览器打开）。

---

## 常见问题

### Q: Bridge 对象名称可以自定义吗？
A: 不可以，SDK 要求原生 App 必须注入名为 `NativeBridge` 的对象。这是固定的命名，确保了统一性和简单性。

### Q: 如何处理超时？
A: 可以在调用时设置超时时间，或使用事件监听模式：
```javascript
// 方式一：设置超时
const result = await miniApp.call('method', {}, { timeout: 10000 });

// 方式二：事件监听（推荐用于权限等耗时操作）
miniApp.on('permission_result', handler);
```

### Q: 支持多个实例吗？
A: 支持，但推荐使用单例模式，避免不必要的资源消耗。

### Q: 如何调试？
A: 开启调试模式查看详细日志：
```javascript
const miniApp = new MiniApp({ debug: true });
```

---

## 浏览器兼容性

- Chrome/Edge: ✅
- Safari/iOS: ✅
- Firefox: ✅
- Android WebView: ✅

---

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 类型检查
npm run typecheck
```

---

## 相关文档

- [原生端集成指南](./NATIVE_INTEGRATION.md)
- [异步操作处理](./ASYNC_OPERATIONS.md)

---

## 贡献

欢迎提交 Issue 和 Pull Request！

