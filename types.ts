
/**
 * 项目分类枚举
 */
export type ProjectCategory = 'Web' | 'AI Tool' | 'Mobile' | 'Other';

/**
 * 项目模型 (Project Entity)
 * 对应数据库中的 projects 表
 */
export interface Project {
  // --- 基础标识 ---
  id: string;               // 唯一标识符 (Primary Key)，建议使用 UUID 或自增 ID
  title: string;            // 项目名称
  category: ProjectCategory; // 项目所属分类

  // --- 内容描述 ---
  shortDescription: string; // [卡片展示] 简短摘要，用于在首页卡片列表显示
  fullDescription: string;  // [详情展示] 核心功能详细描述
  backgroundStory: string;  // [详情展示] 开发背景与动机（你提出的“背景说明”）
  usageInstructions: string; // [详情展示] 使用步骤引导（你提出的“使用说明”）

  // --- 媒体资源 ---
  thumbnailUrl: string;     // [卡片背景图] 项目预览图缩略图地址
  bannerUrl: string;        // [详情页大图] 详情弹窗顶部的高清背景图地址

  // --- 链接与标签 ---
  externalLink: string;     // [交互] 项目真实的访问/演示地址 URL
  tags: string[];           // [展示] 标签数组，例如 ["GPT-4", "React", "Automation"]

  // --- 社交统计 ---
  likesCount: number;       // [交互] 累计点赞数
  commentsCount: number;    // [交互] 累计评论数（冗余字段，方便快速读取）

  // --- 时间戳 ---
  createdAt: string;        // [元数据] 创建时间 (ISO 8601 格式: YYYY-MM-DDTHH:mm:ssZ)
  updatedAt: string;        // [元数据] 最后一次修改项目信息的时间
}

/**
 * 评论模型 (Comment Entity)
 * 对应数据库中的 comments 表
 */
export interface Comment {
  id: string;               // 评论唯一 ID
  projectId: string;        // 关联的项目 ID (Foreign Key)，指向 Project.id

  // --- 评论者信息 ---
  authorName: string;       // 评论人昵称
  authorAvatar: string;     // 评论人头像 URL 地址

  // --- 评论内容 ---
  content: string;          // 评论纯文本内容

  // --- 时间戳 ---
  createdAt: string;        // 评论发布时间 (ISO 8601)
}

/**
 * 本地用户状态
 */
export interface UserState {
  likedProjectIds: string[]; // 记录当前用户点赞过的项目 ID
}

/**
 * 讨论分类
 */
export type DiscussionCategory = 'general' | 'tech' | 'idea' | 'help';

/**
 * 讨论帖子模型
 */
export interface Discussion {
  id: string;
  title: string;
  content: string;
  category: DiscussionCategory;
  authorName: string;
  authorAvatar: string;
  viewsCount: number;
  likesCount: number;
  repliesCount: number;
  isPinned: boolean;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
  lastReplyAt: string;
}

/**
 * 回复模型
 */
export interface Reply {
  id: string;
  discussionId: string;
  content: string;
  authorName: string;
  authorAvatar: string;
  likesCount: number;
  replyToId: string | null;
  createdAt: string;
}

/**
 * 讨论分类信息
 */
export const DISCUSSION_CATEGORIES: Record<DiscussionCategory, { label: string; icon: string; color: string }> = {
  general: { label: '综合讨论', icon: 'fa-comments', color: 'bg-blue-500' },
  tech: { label: '技术交流', icon: 'fa-code', color: 'bg-green-500' },
  idea: { label: '创意分享', icon: 'fa-lightbulb', color: 'bg-yellow-500' },
  help: { label: '求助问答', icon: 'fa-question-circle', color: 'bg-red-500' }
};

