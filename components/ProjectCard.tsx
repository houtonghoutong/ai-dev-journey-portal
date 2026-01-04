
import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  onLike: (id: string) => void;
  isLiked: boolean;
  commentsCount: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onLike, isLiked, commentsCount }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100 card-hover flex flex-col h-full">
      {/* 使用明确定义的 thumbnailUrl 作为卡片背景图 */}
      <div 
        className="relative h-48 overflow-hidden cursor-pointer"
        onClick={() => onClick(project)}
      >
        <img 
          src={project.thumbnailUrl} 
          alt={project.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-semibold bg-white/90 backdrop-blur rounded-full text-indigo-600 shadow-sm">
            {project.category}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow text-left">
        <h3 
          className="text-lg font-bold text-slate-800 mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
          onClick={() => onClick(project)}
        >
          {project.title}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-grow">
          {project.shortDescription}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
        
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={(e) => { e.stopPropagation(); onLike(project.id); }}
              className={`flex items-center space-x-1.5 transition-colors ${isLiked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'}`}
            >
              <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
              <span className="text-sm font-medium">{project.likesCount}</span>
            </button>
            <div className="flex items-center space-x-1.5 text-slate-400">
              <i className="far fa-comment"></i>
              <span className="text-sm font-medium">{commentsCount}</span>
            </div>
          </div>
          <button 
            onClick={() => onClick(project)}
            className="text-indigo-600 text-sm font-semibold hover:underline"
          >
            详情 <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
