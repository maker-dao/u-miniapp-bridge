# 处理耗时操作和权限请求

## 问题
某些方法需要用户授权或耗时较长（如定位、相机权限），可能超过默认 5 秒超时时间。

### 方案：立即响应 + 事件通知（推荐用于需要用户交互）

**适用场景：** 需要用户手动授权，时间不可控（如相机权限、照片选择）

#### 小程序端

```javascript
// 1. 发起请求（立即返回）
const result = await miniApp.call('requestCameraPermission');

if (result.status === 'pending') {
  console.log('等待用户授权...');

  // 2. 监听授权结果事件
  const unsubscribe = miniApp.on('permission_result', (data) => {
    if (data.permission === 'camera') {
      if (data.granted) {
        console.log('用户授权成功');
        // 继续后续操作
      } else {
        console.log('用户拒绝授权');
        // 显示提示
      }
      unsubscribe(); // 取消监听
    }
  });
}
```

#### iOS 原生端

```swift
case "requestCameraPermission":
    // 立即返回 pending 状态
    sendResponse(requestId: requestId, data: [
        "status": "pending",
        "permission": "camera"
    ])

    // 异步请求权限
    AVCaptureDevice.requestAccess(for: .video) { granted in
        // 通过事件通知结果
        self.sendEvent(type: "permission_result", data: [
            "permission": "camera",
            "granted": granted
        ])
    }
```

#### Android 原生端

```kotlin
case "requestCameraPermission" -> {
    // 立即返回 pending 状态
    sendResponse(requestId, JSONObject().apply {
        put("status", "pending")
        put("permission", "camera")
    })

    // 异步请求权限
    requestCameraPermission { granted ->
        // 通过事件通知结果
        sendEvent("permission_result", JSONObject().apply {
            put("permission", "camera")
            put("granted", granted)
        })
    }
}
```

