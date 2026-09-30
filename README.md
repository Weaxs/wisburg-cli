# Wisburg CLI

智堡（Wisburg）Open API 的 Node/TypeScript 命令行封装，覆盖文档中的所有 REST 接口。

English documentation: [README_EN.md](./README_EN.md)

## 安装

```bash
npm install -g wisburg-cli
npx clawhub@0.23.3 install @weaxs/wisburg-research
```

CLI 从 npm 安装，研究 skill 从 ClawHub 安装；也可以在 OpenClaw 的 skill 设置中使用声明的 npm 安装器安装 CLI。

从源码开发：

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

推送 `v*` 标签或手动运行 `Release` 时，先发布 CLI 到 npm，再发布 `wisburg-research` 到 ClawHub。skill 版本由 ClawHub 自动管理：首次发布 `1.0.0`，内容变化自动升级 patch，内容不变则跳过。CLI 仍使用 `package.json` 版本，标签版本应与其一致。标签发布完成后创建 GitHub Release。

ClawHub 发布使用仓库 Secret `CLAWHUB_TOKEN`（在 ClawHub 的 Settings → API tokens 创建，需有 `weaxs` 的发布权限）。npm 沿用现有 trusted publishing 配置。

单独运行 `Publish skill to ClawHub` 时，version 留空即可自动管理版本，也可指定版本和 owner，或勾选 `dry_run` 预览而不发布。手动指定版本时不能覆盖已有版本。上传仅包含 `SKILL.md`，不含评测数据。ClawHub 上的 skill 按 MIT-0 发布，CLI 保持 MIT。

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
