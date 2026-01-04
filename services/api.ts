/**
 * API 服务层
 * 与后端 FastAPI 进行通信
 */

import { Project, Comment } from '../types';

// 后端 API 地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// 生成用户标识（用于点赞去重）
const getUserIdentifier = (): string => {
  let identifier = localStorage.getItem('user_identifier');
  if (!identifier) {
    identifier = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('user_identifier', identifier);
  }
  return identifier;
};

export const ProjectAPI = {
  /** 获取所有项目列表 */
  async getAllProjects(category?: string): Promise<Project[]> {
    const url = category && category !== 'All'
      ? `${API_BASE_URL}/projects?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/projects`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /** 获取单个项目详情 */
  async getProjectById(id: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /** 获取项目评论列表 */
  async getComments(projectId: string): Promise<Comment[]> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/comments`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /** 提交点赞 (Toggle Like) */
  async toggleLike(projectId: string, isLiking: boolean): Promise<{ newLikesCount: number; isLiked: boolean }> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Identifier': getUserIdentifier(),
      },
      body: JSON.stringify({ isLiking }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /** 发表评论 */
  async postComment(projectId: string, content: string, author: string): Promise<Comment> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, author }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
};


import { Discussion, Reply, DiscussionCategory } from '../types';

export const DiscussionAPI = {
  /** 获取讨论列表 */
  async getDiscussions(options?: {
    category?: DiscussionCategory;
    sort?: 'latest' | 'popular' | 'active';
    limit?: number;
    offset?: number;
  }): Promise<Discussion[]> {
    const params = new URLSearchParams();
    if (options?.category) params.append('category', options.category);
    if (options?.sort) params.append('sort', options.sort);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const url = `${API_BASE_URL}/discussions${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /** 获取单个讨论详情 */
  async getDiscussion(id: string): Promise<Discussion> {
    const response = await fetch(`${API_BASE_URL}/discussions/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /** 创建讨论 */
  async createDiscussion(data: {
    title: string;
    content: string;
    category: DiscussionCategory;
    authorName: string;
  }): Promise<Discussion> {
    const response = await fetch(`${API_BASE_URL}/discussions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /** 点赞讨论 */
  async likeDiscussion(id: string): Promise<{ likesCount: number }> {
    const response = await fetch(`${API_BASE_URL}/discussions/${id}/like`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /** 获取回复列表 */
  async getReplies(discussionId: string): Promise<Reply[]> {
    const response = await fetch(`${API_BASE_URL}/discussions/${discussionId}/replies`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /** 创建回复 */
  async createReply(discussionId: string, data: {
    content: string;
    authorName: string;
    replyToId?: string;
  }): Promise<Reply> {
    const response = await fetch(`${API_BASE_URL}/discussions/${discussionId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /** 点赞回复 */
  async likeReply(discussionId: string, replyId: string): Promise<{ likesCount: number }> {
    const response = await fetch(`${API_BASE_URL}/discussions/${discussionId}/replies/${replyId}/like`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /** 获取讨论区统计 */
  async getStats(): Promise<{
    totalDiscussions: number;
    totalReplies: number;
    categories: Record<string, number>;
  }> {
    const response = await fetch(`${API_BASE_URL}/discussions/stats/overview`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
};

