/**
 * 社区讨论区组件
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Discussion, Reply, DiscussionCategory, DISCUSSION_CATEGORIES } from '../types';
import { DiscussionAPI } from '../services/api';

interface CommunityProps {
    onClose: () => void;
}

const Community: React.FC<CommunityProps> = ({ onClose }) => {
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<DiscussionCategory | 'all'>('all');
    const [sort, setSort] = useState<'latest' | 'popular' | 'active'>('latest');
    const [showNewPostForm, setShowNewPostForm] = useState(false);

    // 新帖表单
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState<DiscussionCategory>('general');
    const [authorName, setAuthorName] = useState(() =>
        localStorage.getItem('community_author_name') || ''
    );

    // 回复表单
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // 加载讨论列表
    const loadDiscussions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await DiscussionAPI.getDiscussions({
                category: filter === 'all' ? undefined : filter,
                sort
            });
            setDiscussions(data);
        } catch (error) {
            console.error('加载讨论列表失败:', error);
        } finally {
            setLoading(false);
        }
    }, [filter, sort]);

    // 加载回复
    const loadReplies = useCallback(async (discussionId: string) => {
        try {
            const data = await DiscussionAPI.getReplies(discussionId);
            setReplies(data);
        } catch (error) {
            console.error('加载回复失败:', error);
        }
    }, []);

    useEffect(() => {
        loadDiscussions();
    }, [loadDiscussions]);

    useEffect(() => {
        if (selectedDiscussion) {
            loadReplies(selectedDiscussion.id);
        }
    }, [selectedDiscussion, loadReplies]);

    // 创建新帖子
    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim() || !authorName.trim()) return;

        setSubmitting(true);
        try {
            localStorage.setItem('community_author_name', authorName);
            const newDiscussion = await DiscussionAPI.createDiscussion({
                title: newTitle,
                content: newContent,
                category: newCategory,
                authorName
            });
            setDiscussions(prev => [newDiscussion, ...prev]);
            setNewTitle('');
            setNewContent('');
            setShowNewPostForm(false);
        } catch (error) {
            console.error('创建帖子失败:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // 发表回复
    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !authorName.trim() || !selectedDiscussion) return;

        setSubmitting(true);
        try {
            localStorage.setItem('community_author_name', authorName);
            const newReply = await DiscussionAPI.createReply(selectedDiscussion.id, {
                content: replyContent,
                authorName
            });
            setReplies(prev => [...prev, newReply]);
            setReplyContent('');
            // 更新讨论的回复数
            setSelectedDiscussion(prev => prev ? { ...prev, repliesCount: prev.repliesCount + 1 } : null);
            setDiscussions(prev => prev.map(d =>
                d.id === selectedDiscussion.id ? { ...d, repliesCount: d.repliesCount + 1 } : d
            ));
        } catch (error) {
            console.error('发表回复失败:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // 点赞讨论
    const handleLikeDiscussion = async (id: string) => {
        try {
            const result = await DiscussionAPI.likeDiscussion(id);
            setDiscussions(prev => prev.map(d =>
                d.id === id ? { ...d, likesCount: result.likesCount } : d
            ));
            if (selectedDiscussion?.id === id) {
                setSelectedDiscussion(prev => prev ? { ...prev, likesCount: result.likesCount } : null);
            }
        } catch (error) {
            console.error('点赞失败:', error);
        }
    };

    // 格式化时间
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes} 分钟前`;
        if (hours < 24) return `${hours} 小时前`;
        if (days < 30) return `${days} 天前`;
        return date.toLocaleDateString('zh-CN');
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* 背景遮罩 */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* 主面板 */}
            <div className="absolute inset-4 md:inset-8 lg:inset-16 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                {/* 顶部标题栏 */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                                <i className="fas fa-users text-white text-xl" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">社区讨论</h2>
                                <p className="text-white/80 text-sm">分享经验，交流想法</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                        >
                            <i className="fas fa-times text-white text-lg" />
                        </button>
                    </div>
                </div>

                {/* 内容区 */}
                <div className="flex-1 flex overflow-hidden">
                    {/* 左侧列表 */}
                    <div className={`${selectedDiscussion ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 lg:w-[420px] border-r border-slate-200`}>
                        {/* 筛选和发帖 */}
                        <div className="p-4 border-b border-slate-100 space-y-3">
                            {/* 分类筛选 */}
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-3 py-1.5 text-sm rounded-lg font-medium whitespace-nowrap transition-all ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    全部
                                </button>
                                {(Object.keys(DISCUSSION_CATEGORIES) as DiscussionCategory[]).map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilter(cat)}
                                        className={`px-3 py-1.5 text-sm rounded-lg font-medium whitespace-nowrap transition-all ${filter === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {DISCUSSION_CATEGORIES[cat].label}
                                    </button>
                                ))}
                            </div>

                            {/* 排序和发帖按钮 */}
                            <div className="flex items-center justify-between">
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value as typeof sort)}
                                    className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="latest">最新发布</option>
                                    <option value="popular">最多点赞</option>
                                    <option value="active">最近活跃</option>
                                </select>
                                <button
                                    onClick={() => setShowNewPostForm(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
                                >
                                    <i className="fas fa-pen mr-2" />
                                    发起讨论
                                </button>
                            </div>
                        </div>

                        {/* 讨论列表 */}
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center h-40">
                                    <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
                                </div>
                            ) : discussions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                    <i className="fas fa-comments text-4xl mb-3" />
                                    <p>暂无讨论，来发起第一个话题吧！</p>
                                </div>
                            ) : (
                                discussions.map(discussion => (
                                    <div
                                        key={discussion.id}
                                        onClick={() => setSelectedDiscussion(discussion)}
                                        className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all ${selectedDiscussion?.id === discussion.id ? 'bg-indigo-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={discussion.authorAvatar}
                                                alt={discussion.authorName}
                                                className="w-10 h-10 rounded-full bg-slate-200"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {discussion.isPinned && (
                                                        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded font-medium">
                                                            <i className="fas fa-thumbtack mr-1" />置顶
                                                        </span>
                                                    )}
                                                    <span className={`px-1.5 py-0.5 text-white text-xs rounded ${DISCUSSION_CATEGORIES[discussion.category].color}`}>
                                                        {DISCUSSION_CATEGORIES[discussion.category].label}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-slate-800 truncate">{discussion.title}</h3>
                                                <p className="text-slate-500 text-sm mt-1 line-clamp-2">{discussion.content}</p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                                    <span>{discussion.authorName}</span>
                                                    <span>{formatTime(discussion.createdAt)}</span>
                                                    <span><i className="far fa-eye mr-1" />{discussion.viewsCount}</span>
                                                    <span><i className="far fa-heart mr-1" />{discussion.likesCount}</span>
                                                    <span><i className="far fa-comment mr-1" />{discussion.repliesCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 右侧详情 */}
                    <div className={`${selectedDiscussion ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-slate-50`}>
                        {selectedDiscussion ? (
                            <>
                                {/* 返回按钮 (移动端) */}
                                <button
                                    onClick={() => setSelectedDiscussion(null)}
                                    className="md:hidden flex items-center gap-2 p-4 text-slate-600 hover:text-slate-800"
                                >
                                    <i className="fas fa-arrow-left" />
                                    返回列表
                                </button>

                                {/* 帖子详情 */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                                        <div className="flex items-start gap-4 mb-4">
                                            <img
                                                src={selectedDiscussion.authorAvatar}
                                                alt={selectedDiscussion.authorName}
                                                className="w-12 h-12 rounded-full bg-slate-200"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 text-white text-xs rounded ${DISCUSSION_CATEGORIES[selectedDiscussion.category].color}`}>
                                                        {DISCUSSION_CATEGORIES[selectedDiscussion.category].label}
                                                    </span>
                                                </div>
                                                <h2 className="text-xl font-bold text-slate-800">{selectedDiscussion.title}</h2>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                                    <span className="font-medium text-slate-700">{selectedDiscussion.authorName}</span>
                                                    <span>{formatTime(selectedDiscussion.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedDiscussion.content}</p>
                                        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-100">
                                            <button
                                                onClick={() => handleLikeDiscussion(selectedDiscussion.id)}
                                                className="flex items-center gap-2 text-slate-500 hover:text-pink-500 transition-colors"
                                            >
                                                <i className="far fa-heart" />
                                                <span>{selectedDiscussion.likesCount} 点赞</span>
                                            </button>
                                            <span className="text-slate-400">
                                                <i className="far fa-eye mr-1" /> {selectedDiscussion.viewsCount} 浏览
                                            </span>
                                        </div>
                                    </div>

                                    {/* 回复列表 */}
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-slate-700">
                                            <i className="fas fa-comments mr-2" />
                                            {replies.length} 条回复
                                        </h3>
                                        {replies.map(reply => (
                                            <div key={reply.id} className="bg-white rounded-xl p-4 shadow-sm">
                                                <div className="flex items-start gap-3">
                                                    <img
                                                        src={reply.authorAvatar}
                                                        alt={reply.authorName}
                                                        className="w-10 h-10 rounded-full bg-slate-200"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-slate-800">{reply.authorName}</span>
                                                            <span className="text-xs text-slate-400">{formatTime(reply.createdAt)}</span>
                                                        </div>
                                                        <p className="text-slate-600 whitespace-pre-wrap">{reply.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 回复输入框 */}
                                {!selectedDiscussion.isClosed && (
                                    <form onSubmit={handleReply} className="p-4 bg-white border-t border-slate-200">
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                placeholder="你的昵称"
                                                value={authorName}
                                                onChange={(e) => setAuthorName(e.target.value)}
                                                className="w-32 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                required
                                            />
                                            <input
                                                type="text"
                                                placeholder="发表你的看法..."
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                required
                                            />
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                            >
                                                {submitting ? '发送中...' : '发送'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <i className="fas fa-hand-pointer text-6xl mb-4" />
                                <p className="text-lg">选择一个讨论查看详情</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 发帖弹窗 */}
                {showNewPostForm && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">发起新讨论</h3>
                                <form onSubmit={handleCreatePost} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">你的昵称</label>
                                        <input
                                            type="text"
                                            value={authorName}
                                            onChange={(e) => setAuthorName(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="请输入昵称"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
                                        <select
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value as DiscussionCategory)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {(Object.keys(DISCUSSION_CATEGORIES) as DiscussionCategory[]).map(cat => (
                                                <option key={cat} value={cat}>{DISCUSSION_CATEGORIES[cat].label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">标题</label>
                                        <input
                                            type="text"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="请输入讨论标题"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">内容</label>
                                        <textarea
                                            value={newContent}
                                            onChange={(e) => setNewContent(e.target.value)}
                                            rows={5}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                            placeholder="详细描述你想讨论的内容..."
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPostForm(false)}
                                            className="px-5 py-2 text-slate-600 hover:text-slate-800 font-medium"
                                        >
                                            取消
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                                        >
                                            {submitting ? '发布中...' : '发布讨论'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
