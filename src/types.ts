/**
 * MiniApp Bridge - 核心类型定义
 */

/**
 * 小程序调用宿主 App 的方法
 */
export interface MethodCall {
  method: string;
  params?: Record<string, any>;
  requestId?: string;
}

/**
 * 宿主 App 返回的响应
 */
export interface MethodResponse {
  requestId: string;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 宿主 App 发送给小程序的事件
 */
export interface AppEvent {
  type: string;
  data?: any;
  timestamp?: number;
}

/**
 * 事件监听器
 */
export type EventListener<T = any> = (data: T) => void;

/**
 * 清理函数
 */
export type CleanupFn = () => void;

/**
 * 方法调用选项
 */
export interface CallOptions {
  timeout?: number;
}

/**
 * SDK 配置选项
 */
export interface MiniAppConfig {
  debug?: boolean;
  defaultTimeout?: number;
}
