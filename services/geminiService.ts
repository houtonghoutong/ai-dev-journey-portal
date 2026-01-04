/**
 * AI 服务 - 通过后端 API 调用 DeepSeek
 * 已从 Gemini 直接调用迁移为后端代理模式
 */

import { Project } from "../types";

// 后端 API 地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const getProjectInsights = async (project: Project): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: project.title,
        backgroundStory: project.backgroundStory,
        shortDescription: project.shortDescription,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.insight || "暂无 AI 点评。";
  } catch (error) {
    console.error("AI Insight API Error:", error);
    return "AI 暂时无法提供点评。";
  }
};
