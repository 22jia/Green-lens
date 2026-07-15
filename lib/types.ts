export interface BrandESGData {
  id: string;
  name: string;
  totalScore: number;
  rating: 'Slay' | 'Meh' | 'Sus';
  dimensions: {
    environment: { score: number; tags: string[] };
    social: { score: number; tags: string[] };
    governance: { score: number; tags: string[] };
  };
  keyFacts: {
    summary: string;
    type: 'positive' | 'negative';
    sourceIndex?: number; // <--- 必须加上这个可选属性
  }[];
  // 必须加上 sources 数组定义
  sources?: {
    title: string;
    url: string;
    date: string;
  }[];
}