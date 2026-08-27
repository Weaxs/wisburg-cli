# Wisburg CLI

智堡（Wisburg）Open API 的 Node/TypeScript 命令行封装，覆盖文档中的所有 REST 接口。

English documentation: [README_EN.md](./README_EN.md)

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

官方 API 文档入口：[智堡 Open API 文档](https://open-docs.wisburg.com/docs/getting-started/first-call)

| 资源 | 命令 | 接口 | API 文档 |
| --- | --- | --- | --- |
| 研报笔记 | `wisburg reports list` | `GET /api/reports` | [文档](https://open-docs.wisburg.com/docs/api/reports) |
| 研报笔记 | `wisburg reports get <id>` | `GET /api/reports/:id` | [文档](https://open-docs.wisburg.com/docs/api/reports) |
| 文献 | `wisburg archives list` | `GET /api/archives` | [文档](https://open-docs.wisburg.com/docs/api/archives) |
| 文献 | `wisburg archives get <id>` | `GET /api/archives/:id` | [文档](https://open-docs.wisburg.com/docs/api/archives) |
| 企业研究 | `wisburg company-reports list` | `GET /api/company-reports` | [文档](https://open-docs.wisburg.com/docs/api/company-reports) |
| 企业研究 | `wisburg company-reports get <id>` | `GET /api/company-reports/:id` | [文档](https://open-docs.wisburg.com/docs/api/company-reports) |
| 电话会纪要 | `wisburg earningscalls list` | `GET /api/earningscalls` | [文档](https://open-docs.wisburg.com/docs/api/earningscalls) |
| 电话会纪要 | `wisburg earningscalls get <id>` | `GET /api/earningscalls/:id` | [文档](https://open-docs.wisburg.com/docs/api/earningscalls) |
| 文章 | `wisburg articles list` | `GET /api/articles` | [文档](https://open-docs.wisburg.com/docs/api/articles) |
| 文章 | `wisburg articles get <id>` | `GET /api/articles/:id` | [文档](https://open-docs.wisburg.com/docs/api/articles) |
| AI 市场日报 | `wisburg market-daily list` | `GET /api/market-daily` | [文档](https://open-docs.wisburg.com/docs/api/market-daily) |
| 资讯流 | `wisburg feed list` | `GET /api/feed` | [文档](https://open-docs.wisburg.com/docs/api/feed) |
| 图片流 | `wisburg images list` | `GET /api/images` | [文档](https://open-docs.wisburg.com/docs/api/images) |
| 资管报告 | `wisburg am-reports list` | `GET /api/am-reports` | [文档](https://open-docs.wisburg.com/docs/api/am-reports) |
| 资管报告 | `wisburg am-reports get <id>` | `GET /api/am-reports/:id` | [文档](https://open-docs.wisburg.com/docs/api/am-reports) |
| Mikko 日志 | `wisburg mikko-logs list` | `GET /api/mikko-logs` | [文档](https://open-docs.wisburg.com/docs/api/mikko-logs) |
| Mikko 日志 | `wisburg mikko-logs get <id>` | `GET /api/mikko-logs/:id` | [文档](https://open-docs.wisburg.com/docs/api/mikko-logs) |

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
