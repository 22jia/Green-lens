export type BrandESGData = {
  id: string;
  name: string;
  totalScore: number; // 0-100
  rating: 'Slay' | 'Meh' | 'Sus';
  dimensions: {
    environment: {
      score: number;
      tags: string[];
    };
    social: {
      score: number;
      tags: string[];
    };
    governance: {
      score: number;
      tags: string[];
    };
  };
  keyFacts: {
    summary: string;
    type: 'positive' | 'negative';
  }[];
  sources: {
    title: string;
    url: string;
    date: string;
  }[];
};