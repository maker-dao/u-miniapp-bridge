/**
 * MiniApp Bridge - 核心类
 */

import type {
  MethodCall,
  MethodResponse,
  AppEvent,
  EventListener,
  CleanupFn,
  CallOptions,
  MiniAppConfig,
} from './types';

export class MiniApp {
  private config: Required<MiniAppConfig>;
  private eventListeners = new Map<string, Set<EventListener>>();
  private pendingCalls = new Map<string, {
    resolve: (data: any) => void;
    reject: (error: Error) => void;
    timeout: number;
  }>();
  private requestIdCounter = 0;
  private nativeBridge: any = null;
  private isInitialized = false;

  constructor(config: MiniAppConfig = {}) {
    this.config = {
      debug: config.debug ?? false,
      defaultTimeout: config.defaultTimeout ?? 5000,
    };
  }

  /**
   * 初始化 SDK
   */
  init(): void {
    if (this.isInitialized) {
      this.log('warn', 'SDK already initialized');
      return;
    }

    const wnd = window as any;
    this.nativeBridge = wnd.NativeBridge;

    if (!this.nativeBridge) {
      throw new Error('Native bridge "NativeBridge" not found on window. Make sure the native app has injected the bridge object.');
    }

    if (typeof this.nativeBridge.postMessage !== 'function') {
      throw new Error('Native bridge "NativeBridge" does not have postMessage method');
    }

    // 设置接收消息的回调
    this.nativeBridge.onMessage = (message: string) => {
      this.handleNativeMessage(message);
    };

    this.isInitialized = true;
    this.log('log', 'MiniApp SDK initialized');

    // 通知 App 小程序已准备好
    this.callMethod('miniapp.ready');
  }

  /**
   * 调用宿主 App 的方法（异步，等待响应）
   */
  async call<T = any>(
    method: string,
    params?: Record<string, any>,
    options?: CallOptions
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = this.generateRequestId();
      const timeout = options?.timeout ?? this.config.defaultTimeout;

      const timeoutId = window.setTimeout(() => {
        this.pendingCalls.delete(requestId);
        reject(new Error(`Method call timeout: ${method}`));
      }, timeout);

      this.pendingCalls.set(requestId, {
        resolve: (data) => {
          clearTimeout(timeoutId);
          resolve(data);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        timeout: timeoutId,
      });

      const success = this.callMethod(method, params, requestId);
      if (!success) {
        clearTimeout(timeoutId);
        this.pendingCalls.delete(requestId);
        reject(new Error(`Failed to send method call: ${method}`));
      }
    });
  }

  /**
   * 调用宿主 App 的方法（不等待响应）
   */
  callMethod(
    method: string,
    params?: Record<string, any>,
    requestId?: string
  ): boolean {
    if (!this.isInitialized) {
      this.log('error', 'SDK not initialized. Call init() first.');
      return false;
    }

    const call: MethodCall = { method, params, requestId };

    try {
      const message = JSON.stringify(call);
      this.log('log', 'Calling method:', method, params);
      this.nativeBridge.postMessage(message);
      return true;
    } catch (error) {
      this.log('error', 'Failed to call method:', error);
      return false;
    }
  }

  /**
   * 监听来自宿主 App 的事件
   */
  on<T = any>(eventType: string, listener: EventListener<T>): CleanupFn {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }

    this.eventListeners.get(eventType)!.add(listener as EventListener);
    this.log('log', 'Event listener added:', eventType);

    return () => this.off(eventType, listener);
  }

  /**
   * 取消监听事件
   */
  off<T = any>(eventType: string, listener: EventListener<T>): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener as EventListener);
      if (listeners.size === 0) {
        this.eventListeners.delete(eventType);
      }
      this.log('log', 'Event listener removed:', eventType);
    }
  }

  /**
   * 销毁 SDK
   */
  destroy(): void {
    if (!this.isInitialized) return;

    this.pendingCalls.forEach(({ timeout }) => clearTimeout(timeout));
    this.pendingCalls.clear();
    this.eventListeners.clear();

    if (this.nativeBridge) {
      this.nativeBridge.onMessage = null;
      this.nativeBridge = null;
    }

    this.isInitialized = false;
    this.log('log', 'MiniApp SDK destroyed');
  }

  private handleNativeMessage(message: string): void {
    try {
      const data = JSON.parse(message);

      if (this.isMethodResponse(data)) {
        this.handleMethodResponse(data);
      } else if (this.isAppEvent(data)) {
        this.handleAppEvent(data);
      } else {
        this.log('warn', 'Unknown message format:', data);
      }
    } catch (error) {
      this.log('error', 'Failed to parse native message:', error);
    }
  }

  private handleMethodResponse(response: MethodResponse): void {
    const pending = this.pendingCalls.get(response.requestId);
    if (!pending) {
      this.log('warn', 'Received response for unknown request:', response.requestId);
      return;
    }

    this.pendingCalls.delete(response.requestId);

    if (response.error) {
      const error = new Error(response.error.message);
      (error as any).code = response.error.code;
      pending.reject(error);
    } else {
      pending.resolve(response.data);
    }
  }

  private handleAppEvent(event: AppEvent): void {
    this.log('log', 'Received event:', event.type, event.data);

    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event.data);
        } catch (error) {
          this.log('error', 'Error in event listener:', error);
        }
      });
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestIdCounter}`;
  }

  private isMethodResponse(data: any): data is MethodResponse {
    return typeof data === 'object' && 'requestId' in data;
  }

  private isAppEvent(data: any): data is AppEvent {
    return typeof data === 'object' && 'type' in data;
  }

  private log(level: 'log' | 'warn' | 'error', ...args: any[]): void {
    if (this.config.debug || level !== 'log') {
      console[level]('[MiniApp]', ...args);
    }
  }
}

export function createMiniApp(config?: MiniAppConfig): MiniApp {
  return new MiniApp(config);
}
