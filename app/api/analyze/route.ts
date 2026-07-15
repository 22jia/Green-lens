import { NextResponse } from 'next/server';
import { tavily } from '@tavily/core';
import OpenAI from 'openai';

// 1. 初始化 Tavily
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// 2. 初始化 DeepSeek (使用 OpenAI SDK)
const openai = new OpenAI({ 
  apiKey: process.env.DEEPSEEK_API_KEY, 
  baseURL: "https://api.deepseek.com", 
});

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    console.log(`[DeepSeek Server] 正在搜索: ${query}...`);

    // --- 第一步：Tavily 搜索新闻 ---
    const searchResult = await tvly.search(`${query} ESG environment social governance controversy`, {
      topic: "news",
      max_results: 5,
      include_domains: [] 
    });

    // 给每篇新闻加上序号 [1], [2]... 
    const newsContext = searchResult.results.map((r: any, index: number) => 
      `[${index + 1}] 标题：${r.title}\n链接：${r.url}\n内容：${r.content}`
    ).join('\n\n');

    console.log("[DeepSeek Server] 搜索完成，正在请求分析...");

    // --- 第二步：DeepSeek 分析 ---
    // 【关键修改】：加强 Prompt，强制要求返回 sourceIndex
    const prompt = `
      你是一个专业的 ESG 分析师。请根据以下关于品牌 "${query}" 的新闻摘要，生成一份 ESG 评估报告。
      
      新闻摘要 (注意每条新闻前的编号 [1], [2]...):
      ${newsContext}

      请严格返回符合以下结构的 JSON 数据（不要返回 Markdown 格式）。
      
      【重要指令】：在 keyFacts 数组中，每一个事实都必须包含 "sourceIndex" 字段，其值为该事实来源对应的新闻编号（整数，如 1, 2, 3）。这是必须项。

      JSON 格式模板：
      {
        "id": "${query.toLowerCase()}",
        "name": "${query}",
        "dimensions": {
          "environment": { "score": <0-100>, "tags": ["<中文tag>"] },
          "social": { "score": <0-100>, "tags": ["<中文tag>"] },
          "governance": { "score": <0-100>, "tags": ["<中文tag>"] }
        },
        "keyFacts": [
          { 
            "summary": "<简短中文事实描述>", 
            "type": "<positive|negative>",
            "sourceIndex": 1 
          }
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-chat",
      response_format: { type: "json_object" },
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");

    // --- 第三步：后端逻辑算分 (不依赖 AI 算总分) ---
    // 设定权重：环境 30%, 社会 40%, 治理 30%
    const eScore = aiResponse.dimensions?.environment?.score || 50;
    const sScore = aiResponse.dimensions?.social?.score || 50;
    const gScore = aiResponse.dimensions?.governance?.score || 50;

    // 严谨计算
    const calculatedTotal = Math.round((eScore * 0.3) + (sScore * 0.4) + (gScore * 0.3));

    // 计算评级
    let calculatedRating = "Meh";
    if (calculatedTotal >= 80) calculatedRating = "Slay";
    else if (calculatedTotal < 60) calculatedRating = "Sus";

    // --- 第四步：拼接最终数据 ---
    const finalData = {
      ...aiResponse,
      totalScore: calculatedTotal, 
      rating: calculatedRating,    
      sources: searchResult.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        date: r.published_date || new Date().toISOString()
      }))
    };

    return NextResponse.json(finalData);

  } catch (error) {
    console.error('DeepSeek Analysis failed:', error);
    return NextResponse.json({ error: 'Failed to analyze brand' }, { status: 500 });
  }
}