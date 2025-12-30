# 发布指南

本文档说明如何将 u-miniapp-bridge 发布到 npm。

## 准备工作

### 1. 注册 npm 账号

如果还没有 npm 账号，前往 [npmjs.com](https://www.npmjs.com/) 注册。

### 2. 登录 npm

```bash
npm login
```

输入用户名、密码和邮箱。

### 3. 检查包名是否可用

```bash
npm view u-miniapp-bridge
```

如果显示 404，说明包名可用。如果已被占用，需要在 `package.json` 中修改包名。

## 发布流程

### 1. 更新版本号

修改 `package.json` 中的 `version` 字段，或使用 npm 命令：

```bash
# 补丁版本（1.0.0 -> 1.0.1）
npm version patch

# 次要版本（1.0.0 -> 1.1.0）
npm version minor

# 主要版本（1.0.0 -> 2.0.0）
npm version major
```

### 2. 构建项目

```bash
npm run build
```

检查 `dist/` 目录，确保生成了以下文件：
- `u-miniapp-bridge.es.js` - ES Module 版本
- `u-miniapp-bridge.umd.js` - UMD 版本
- `index.d.ts` - TypeScript 类型定义
- `*.map` - Source Map 文件

### 3. 测试构建产物

```bash
# 本地测试安装
npm pack

# 会生成 u-miniapp-bridge-1.0.0.tgz 文件
# 在其他项目中测试：
npm install /path/to/u-miniapp-bridge-1.0.0.tgz
```

### 4. 发布到 npm

```bash
npm publish
```

如果是第一次发布，可能需要验证邮箱。

### 5. 验证发布

```bash
# 查看包信息
npm view u-miniapp-bridge

# 安装测试
npm install u-miniapp-bridge
```

## 发布检查清单

- [ ] 更新了版本号
- [ ] 运行了 `npm run build`
- [ ] 检查了 `dist/` 目录的文件
- [ ] 更新了 README.md（如有必要）
- [ ] 更新了 CHANGELOG（如有必要）
- [ ] 测试了构建产物
- [ ] 已登录 npm 账号
- [ ] 执行 `npm publish`

## 版本管理建议

遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **主版本号（Major）**：不兼容的 API 修改
- **次版本号（Minor）**：向下兼容的功能性新增
- **修订号（Patch）**：向下兼容的问题修正

示例：
- `1.0.0` → `1.0.1`：修复 bug
- `1.0.1` → `1.1.0`：新增功能
- `1.1.0` → `2.0.0`：不兼容的改动

## 更新已发布的包

```bash
# 1. 修改代码
# 2. 更新版本号
npm version patch

# 3. 构建
npm run build

# 4. 发布
npm publish
```

## 撤销发布

⚠️ **注意：只能撤销发布 72 小时内的包！**

```bash
npm unpublish u-miniapp-bridge@1.0.0
```

## CDN 链接

发布后，包会自动同步到 CDN：

### unpkg
```
https://unpkg.com/u-miniapp-bridge@latest/dist/u-miniapp-bridge.umd.js
https://unpkg.com/u-miniapp-bridge@1.0.0/dist/u-miniapp-bridge.umd.js
```

### jsdelivr
```
https://cdn.jsdelivr.net/npm/u-miniapp-bridge@latest/dist/u-miniapp-bridge.umd.js
https://cdn.jsdelivr.net/npm/u-miniapp-bridge@1.0.0/dist/u-miniapp-bridge.umd.js
```

## 常见问题

### Q: 包名已被占用怎么办？
A: 修改 `package.json` 中的 `name` 字段，例如：
- `@yourusername/u-miniapp-bridge`（使用 scope）
- `u-miniapp-bridge-sdk`

### Q: 如何发布 beta 版本？
A:
```bash
# 版本号设置为 1.0.0-beta.1
npm publish --tag beta

# 安装 beta 版本
npm install u-miniapp-bridge@beta
```

### Q: 如何更新文档？
A: 直接更新 README.md 后重新发布即可，npm 会自动更新包页面的文档。

### Q: 发布失败怎么办？
A: 检查：
1. 是否已登录 npm（`npm whoami`）
2. 包名是否可用
3. 版本号是否已存在
4. 网络连接是否正常

## 自动化发布（可选）

可以使用 GitHub Actions 自动发布：

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

在 GitHub 仓库的 Settings → Secrets 中添加 `NPM_TOKEN`。
