
import React, { useState, useEffect } from 'react';
import { Project, Comment } from '../types';
import { getProjectInsights } from '../services/geminiService';

interface ProjectModalProps {
  project: Project;
  comments: Comment[];
  onClose: () => void;
  onAddComment: (projectId: string, content: string, author: string) => Promise<void>;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, comments, onClose, onAddComment }) => {
  const [aiInsight, setAiInsight] = useState<string>('正在获取 AI 灵感点评...');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'instructions' | 'comments'>('info');

  useEffect(() => {
    const fetchInsight = async () => {
      const insight = await getProjectInsights(project);
      setAiInsight(insight);
    };
    fetchInsight();
  }, [project]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onAddComment(project.id, newComment, '匿名访客');
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header - 使用 bannerUrl */}
        <div className="relative h-64 flex-shrink-0">
          <img src={project.bannerUrl} className="w-full h-full object-cover" alt={project.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur text-white rounded-full flex items-center justify-center transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
          <div className="absolute bottom-6 left-8">
            <h2 className="text-3xl font-bold text-white mb-2">{project.title}</h2>
            <div className="flex flex-wrap gap-2">
              {project.tags.map(t => (
                <span key={t} className="px-3 py-1 bg-white/20 backdrop-blur text-white text-xs rounded-full border border-white/30">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-8 flex-shrink-0 bg-white overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('info')}
            className={`py-4 px-4 text-sm font-semibold border-b-2 transition-all flex-shrink-0 ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            项目介绍
          </button>
          <button 
            onClick={() => setActiveTab('instructions')}
            className={`py-4 px-4 text-sm font-semibold border-b-2 transition-all flex-shrink-0 ${activeTab === 'instructions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            使用指南
          </button>
          <button 
            onClick={() => setActiveTab('comments')}
            className={`py-4 px-4 text-sm font-semibold border-b-2 transition-all flex-shrink-0 ${activeTab === 'comments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            社区讨论 ({comments.length})
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-grow overflow-y-auto p-8 bg-slate-50/50">
          {activeTab === 'info' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300 text-left">
              <section>
                <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">背景说明</h4>
                <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-line">{project.backgroundStory}</p>
              </section>
              <section>
                <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">核心功能</h4>
                <p className="text-slate-700 leading-relaxed">{project.fullDescription}</p>
              </section>
              <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <i className="fas fa-brain text-xl"></i>
                </div>
                <div>
                  <h5 className="font-bold text-indigo-900 mb-1">AI 视角点评</h5>
                  <p className="text-indigo-800/80 text-sm italic leading-relaxed">{aiInsight}</p>
                </div>
              </div>
              <div className="pt-4">
                <a 
                  href={project.externalLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  访问项目在线演示 <i className="fas fa-external-link-alt ml-2"></i>
                </a>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="animate-in slide-in-from-bottom-2 duration-300 text-left">
               <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-4">使用说明</h4>
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                 <p className="text-slate-700 leading-relaxed whitespace-pre-line">{project.usageInstructions}</p>
               </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300 text-left">
              <div className="flex flex-col gap-4">
                <form onSubmit={handleSubmitComment} className="relative">
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="分享你的看法..."
                    className="w-full p-4 pr-20 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none min-h-[100px] resize-none text-slate-800"
                  />
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="absolute bottom-4 right-4 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? '提交中...' : '发布'}
                  </button>
                </form>
                
                <div className="space-y-4 pt-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <i className="far fa-comment-dots text-4xl mb-2"></i>
                      <p>还没有人评论，快来抢沙发吧！</p>
                    </div>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <img src={comment.authorAvatar} className="w-10 h-10 rounded-full flex-shrink-0" alt={comment.authorName} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-800 text-sm">{comment.authorName}</span>
                            <span className="text-[10px] text-slate-400">{comment.createdAt.split('T')[0]}</span>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
