
import React, { useState, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import ProjectCard from './components/ProjectCard';
import ProjectModal from './components/ProjectModal';
import Community from './components/Community';
import { Project, Comment, UserState } from './types';
import { INITIAL_PROJECTS } from './constants';
import { ProjectAPI } from './services/api';

const App: React.FC = () => {
  // 在真实环境中，这里的数据应通过 useEffect 从 ProjectAPI.getAllProjects() 加载
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  // 为了模拟评论，我们维护一个本地评论存储
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [userState, setUserState] = useState<UserState>({ likedProjectIds: [] });
  const [filter, setFilter] = useState<'All' | 'Web' | 'AI Tool'>('All');
  const [showCommunity, setShowCommunity] = useState(false);

  const filteredProjects = useMemo(() => {
    if (filter === 'All') return projects;
    return projects.filter(p => p.category === filter);
  }, [projects, filter]);

  const handleLike = useCallback(async (id: string) => {
    const isAlreadyLiked = userState.likedProjectIds.includes(id);

    // 调用 API 更新后端数据 (此处为模拟)
    await ProjectAPI.toggleLike(id, !isAlreadyLiked);

    setUserState(prev => {
      const newLiked = isAlreadyLiked
        ? prev.likedProjectIds.filter(pid => pid !== id)
        : [...prev.likedProjectIds, id];

      setProjects(currentProjects => currentProjects.map(p => {
        if (p.id === id) {
          return { ...p, likesCount: isAlreadyLiked ? p.likesCount - 1 : p.likesCount + 1 };
        }
        return p;
      }));

      return { ...prev, likedProjectIds: newLiked };
    });
  }, [userState.likedProjectIds]);

  const handleAddComment = useCallback(async (projectId: string, content: string, author: string) => {
    // 调用真实 API 接口
    const newComment = await ProjectAPI.postComment(projectId, content, author);

    setCommentsMap(prev => ({
      ...prev,
      [projectId]: [newComment, ...(prev[projectId] || [])]
    }));

    // 同时更新 Project 对象中的聚合计数
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, commentsCount: p.commentsCount + 1 } : p
    ));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-white">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-50 rounded-full blur-3xl opacity-50"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center md:text-left">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                探索 <span className="text-indigo-600">AI 原生开发</span> 的无限可能
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                这是我的个人项目门户。这里展示的所有项目均由 AI 辅助完成。作为一名非代码开发者，我利用大语言模型和提示词工程，将创意转化为可运行的现实。
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <a href="#projects" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                  浏览所有项目
                </a>
                <button
                  onClick={() => setShowCommunity(true)}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-2xl hover:shadow-xl hover:scale-105 transition-all"
                >
                  <i className="fas fa-users mr-2" />
                  社区讨论
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Project Section */}
        <section id="projects" className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">项目广场</h2>
                <p className="text-slate-500">不断追加中，点击查看项目详情与使用说明</p>
              </div>

              <div className="flex p-1 bg-white border border-slate-200 rounded-xl self-start md:self-auto">
                {(['All', 'Web', 'AI Tool'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${filter === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {cat === 'All' ? '全部' : cat === 'Web' ? '网页应用' : 'AI 工具'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={setSelectedProject}
                  onLike={handleLike}
                  isLiked={userState.likedProjectIds.includes(project.id)}
                  commentsCount={commentsMap[project.id]?.length || 0}
                />
              ))}

              {/* Coming Soon Card */}
              <div className="bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center h-full min-h-[400px]">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-sm">
                  <i className="fas fa-plus text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-400 mb-2">更多惊喜</h3>
                <p className="text-slate-400 text-sm">正在全力开发中，敬请期待...</p>
              </div>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-16 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-white mb-4">加入社区讨论</h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                与其他开发者交流经验，分享你的 AI 开发心得，或者寻求帮助解决疑问
              </p>
              <div className="flex flex-wrap gap-6 justify-center mb-10">
                <div className="bg-white/10 backdrop-blur rounded-2xl px-6 py-4 text-center">
                  <i className="fas fa-comments text-3xl text-indigo-300 mb-2" />
                  <div className="text-2xl font-bold text-white">综合讨论</div>
                  <div className="text-white/60 text-sm">自由交流</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl px-6 py-4 text-center">
                  <i className="fas fa-code text-3xl text-green-300 mb-2" />
                  <div className="text-2xl font-bold text-white">技术交流</div>
                  <div className="text-white/60 text-sm">深度探讨</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl px-6 py-4 text-center">
                  <i className="fas fa-lightbulb text-3xl text-yellow-300 mb-2" />
                  <div className="text-2xl font-bold text-white">创意分享</div>
                  <div className="text-white/60 text-sm">灵感碰撞</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl px-6 py-4 text-center">
                  <i className="fas fa-question-circle text-3xl text-red-300 mb-2" />
                  <div className="text-2xl font-bold text-white">求助问答</div>
                  <div className="text-white/60 text-sm">互助解答</div>
                </div>
              </div>
              <button
                onClick={() => setShowCommunity(true)}
                className="px-10 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 hover:scale-105 transition-all shadow-2xl"
              >
                <i className="fas fa-arrow-right mr-2" />
                进入社区
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-3 opacity-60 grayscale">
              <div className="bg-slate-800 h-8 w-8 rounded flex items-center justify-center text-white">
                <i className="fas fa-rocket"></i>
              </div>
              <span className="text-lg font-bold text-slate-800">AI Dev Journey</span>
            </div>
            <p className="text-slate-400 text-sm text-center md:text-left">
              &copy; 2024 AI Dev Journey. Created with <i className="fas fa-heart text-pink-500 mx-1"></i> entirely through AI prompts.
            </p>
            <div className="text-slate-500 font-medium">
              <i className="far fa-envelope mr-2"></i> 329968208@qq.com
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          comments={commentsMap[selectedProject.id] || []}
          onClose={() => setSelectedProject(null)}
          onAddComment={handleAddComment}
        />
      )}

      {/* Community Modal */}
      {showCommunity && (
        <Community onClose={() => setShowCommunity(false)} />
      )}
    </div>
  );
};

export default App;

