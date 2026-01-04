
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 h-10 w-10 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <i className="fas fa-rocket text-lg"></i>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              AI Dev Journey
            </span>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">主页</a>
            <a href="#projects" className="hover:text-indigo-600 transition-colors">项目广场</a>
          </div>
          <div className="flex items-center space-x-4">
             <a 
              href="mailto:329968208@qq.com"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center"
             >
              <i className="far fa-envelope mr-2"></i> 联系合作
             </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
