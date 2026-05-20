export type ProductKind = "plan" | "traffic";

export interface CheckoutProduct {
  id: string;
  kind: ProductKind;
  name: string;
  priceCny: number;
  credits: number;
  desc: string;
  highlight?: boolean;
}

export const freePlan = {
  name: "免费试用",
  price: "¥0",
  desc: "新账号赠送 5 次体验机会，先判断流程和结果方向",
  badge: "DeepSeek 体验",
  points: ["DeepSeek 基础生成", "平台模板与目标国家", "AI 追问和基础字段", "生成历史可查看"],
};

export const paidBenefits = [
  "充值后使用 Claude / ChatGPT / Gemini 强模型池",
  "Claude 精写标题、五点、长描述和 SEO 字段",
  "文案风格强度、平台模板、目标国家本地化",
  "历史记录、复制字段、后续导出能力优先支持",
];

export const checkoutProducts: CheckoutProduct[] = [
  {
    id: "starter",
    kind: "plan",
    name: "入门包",
    priceCny: 25,
    credits: 50,
    desc: "适合先小额体验 Claude 精写效果",
  },
  {
    id: "standard",
    kind: "plan",
    name: "标准包",
    priceCny: 45,
    credits: 100,
    desc: "适合每周稳定上新，单次额度更划算",
    highlight: true,
  },
  {
    id: "pro",
    kind: "plan",
    name: "进阶包",
    priceCny: 68,
    credits: 160,
    desc: "适合批量铺货或连续优化多个商品",
  },
  {
    id: "traffic-small",
    kind: "traffic",
    name: "小流量包",
    priceCny: 9,
    credits: 15,
    desc: "已充值用户临时补充少量额度",
  },
  {
    id: "traffic-plus",
    kind: "traffic",
    name: "加量包",
    priceCny: 19,
    credits: 40,
    desc: "已充值用户补充常用额度",
  },
  {
    id: "traffic-sprint",
    kind: "traffic",
    name: "冲刺包",
    priceCny: 39,
    credits: 90,
    desc: "适合短期集中生成时加量",
  },
];

export const creditRules = [
  ["免费体验", "DeepSeek", "新账号 5 次免费体验，用来判断工具流程、平台模板和基础结果方向。"],
  ["付费精写", "2 额度起", "充值后使用 Claude / ChatGPT / Gemini 强模型池，正式商品优先走 Claude 精写。"],
  ["深度生成", "3 额度起", "资料更长、图片更多、输出更复杂时会消耗更多额度。"],
];

export const costNotes = [
  "DeepSeek 免费体验单次成本很低，但新账号 5 次体验仍会计入获客成本。",
  "Claude 精写按输入、输出和图片理解成本核算，复杂商品会消耗更多额度。",
  "当前额度数量采用保守口径，先保证不因强模型调用导致亏损。",
];

export function getCheckoutProduct(id?: string | null, kind?: string | null) {
  const product = checkoutProducts.find((item) => item.id === id);
  if (!product) return checkoutProducts[0];
  if (kind && product.kind !== kind) return checkoutProducts[0];
  return product;
}

export function formatPrice(priceCny: number) {
  return `¥${priceCny}`;
}

export function formatCredits(credits: number, kind: ProductKind) {
  return kind === "traffic" ? `补充约 ${credits} 额度` : `约 ${credits} 额度`;
}
