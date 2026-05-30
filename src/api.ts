export const DEFAULT_BASE_URL = "https://api-omen.wisburg.com";

export type Resource = {
  name: string;
  path: string;
  description: string;
  hasDetail: boolean;
};

export const listQueryOptions = ["first", "after", "query", "startTime", "endTime"] as const;

export type ListQueryOption = (typeof listQueryOptions)[number];

export const resources: Resource[] = [
  { name: "reports", path: "/api/reports", description: "研报笔记", hasDetail: true },
  { name: "archives", path: "/api/archives", description: "文献", hasDetail: true },
  { name: "company-reports", path: "/api/company-reports", description: "企业研究", hasDetail: true },
  { name: "earningscalls", path: "/api/earningscalls", description: "电话会纪要", hasDetail: true },
  { name: "articles", path: "/api/articles", description: "文章", hasDetail: true },
  { name: "market-daily", path: "/api/market-daily", description: "AI市场日报", hasDetail: false },
  { name: "feed", path: "/api/feed", description: "资讯流", hasDetail: false },
  { name: "images", path: "/api/images", description: "图片流", hasDetail: false },
  { name: "am-reports", path: "/api/am-reports", description: "资管报告", hasDetail: true },
];
