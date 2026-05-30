# Wisburg CLI

Wisburg Open API 的 Node/TypeScript 命令行封装，覆盖文档中的所有 REST 接口。

## 安装

```bash
npm install
npm run build
npm link
```

## 鉴权

推荐使用环境变量：

```bash
export WISBURG_API_KEY="your-api-key"
```

也可以写入本机配置：

```bash
wisburg config set-api-key "your-api-key"
```

默认 Base URL 为 `https://api-omen.wisburg.com`，可通过 `WISBURG_BASE_URL` 或 `--base-url` 覆盖。

## 示例

```bash
wisburg reports list --first 10 --query "宏观"
wisburg reports get 123
wisburg articles list --start-time 2025-01-01 --end-time 2025-02-01
wisburg feed list --first 20
wisburg images list --query "美股"
wisburg request GET /api/reports --query first=5
```

开发时也可以直接运行：

```bash
npm run build
node dist/cli.js reports list --first 10
```

## 已封装接口

| 命令 | 接口 |
| --- | --- |
| `wisburg reports list` | `GET /api/reports` |
| `wisburg reports get <id>` | `GET /api/reports/:id` |
| `wisburg archives list` | `GET /api/archives` |
| `wisburg archives get <id>` | `GET /api/archives/:id` |
| `wisburg company-reports list` | `GET /api/company-reports` |
| `wisburg company-reports get <id>` | `GET /api/company-reports/:id` |
| `wisburg earningscalls list` | `GET /api/earningscalls` |
| `wisburg earningscalls get <id>` | `GET /api/earningscalls/:id` |
| `wisburg articles list` | `GET /api/articles` |
| `wisburg articles get <id>` | `GET /api/articles/:id` |
| `wisburg market-daily list` | `GET /api/market-daily` |
| `wisburg feed list` | `GET /api/feed` |
| `wisburg images list` | `GET /api/images` |
| `wisburg am-reports list` | `GET /api/am-reports` |
| `wisburg am-reports get <id>` | `GET /api/am-reports/:id` |

所有列表接口都支持：

```text
--first
--after
--query
--start-time
--end-time
```

## 输出

默认输出格式化 JSON。使用 `--raw` 可以输出接口原始响应文本。

## 开发

```bash
npm test
```

## CI/CD

GitHub Actions 会在 push、pull request 和手动触发时运行：

```bash
npm ci
npm test
```

如果仓库 Secrets 中配置了 `WISBURG_API_KEY`，CI 还会运行真实线上接口测试：

```bash
npm run test:integration
```

本地也可以手动跑真实接口测试：

```bash
export WISBURG_API_KEY="your-api-key"
npm run test:integration
```
