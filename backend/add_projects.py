"""
添加新项目到数据库
"""

from database import SessionLocal
from models import Project

def add_new_projects():
    """添加小说阅读器和西双版纳旅游助手"""
    db = SessionLocal()
    
    try:
        # 检查项目是否已存在
        existing_project_2 = db.query(Project).filter(Project.id == "2").first()
        existing_project_3 = db.query(Project).filter(Project.id == "3").first()
        
        if not existing_project_2:
            print("添加项目: 小说阅读器")
            project_2 = Project(
                id="2",
                title="小说阅读器",
                category="Web App",
                short_description="现代化的在线小说阅读平台，提供流畅的阅读体验。",
                full_description="小说阅读器是一个功能完善的在线阅读应用，为小说爱好者提供舒适的阅读环境。它支持多种阅读模式、字体调节、进度管理等功能，让用户可以随时随地沉浸在故事的世界中。界面设计简洁优雅，注重用户体验，让阅读成为一种享受。",
                background_story="作为一个热爱阅读的开发者，我发现很多在线阅读平台的体验并不理想 - 广告太多、排版混乱、功能繁杂。我希望打造一个纯粹、专注于阅读本身的应用，让读者能够专心享受文字带来的乐趣，不被其他因素干扰。",
                usage_instructions="1. 打开应用访问小说阅读器\n2. 浏览或搜索感兴趣的小说\n3. 点击开始阅读\n4. 使用阅读设置调整字体大小、背景色等\n5. 系统会自动保存阅读进度",
                thumbnail_url="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
                banner_url="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1200",
                external_link="http://223.109.142.31:8081/",
                tags=["阅读", "小说", "Web App", "用户体验"],
                likes_count=0,
                comments_count=0
            )
            db.add(project_2)
        else:
            print("项目 '小说阅读器' 已存在")
        
        if not existing_project_3:
            print("添加项目: 西双版纳旅游助手")
            project_3 = Project(
                id="3",
                title="西双版纳旅游助手",
                category="AI Tool",
                short_description="AI 驱动的智能旅游规划助手，专注西双版纳深度游。",
                full_description="西双版纳旅游助手是一款结合了 AI 智能推荐与本地深度旅游信息的应用。它不仅能根据你的兴趣、时间和预算智能规划行程，还能提供景点介绍、美食推荐、交通指南等全方位的旅游服务。通过 AI 对话的方式，让旅游规划变得简单又有趣。",
                background_story="西双版纳是一个充满热带风情和民族文化的地方，但很多游客因为不了解而错过了许多精彩。我希望通过 AI 技术，让每一位游客都能像本地人一样深度体验西双版纳的魅力，发现那些隐藏的美景和独特的文化体验。",
                usage_instructions="1. 打开应用，告诉 AI 你的旅游需求（时间、预算、兴趣等）\n2. AI 会为你生成个性化的行程规划\n3. 浏览景点详情、查看美食推荐\n4. 获取实用的交通和住宿建议\n5. 随时与 AI 对话调整行程",
                thumbnail_url="https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&q=80&w=800",
                banner_url="https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&q=80&w=1200",
                external_link="http://223.109.142.31:8088/",
                tags=["AI", "旅游", "西双版纳", "智能推荐"],
                likes_count=0,
                comments_count=0
            )
            db.add(project_3)
        else:
            print("项目 '西双版纳旅游助手' 已存在")
        
        db.commit()
        print("✅ 项目添加完成！")
        
        # 显示当前所有项目
        all_projects = db.query(Project).all()
        print(f"\n当前数据库中共有 {len(all_projects)} 个项目:")
        for p in all_projects:
            print(f"  - {p.id}: {p.title} ({p.category})")
    
    except Exception as e:
        print(f"❌ 添加项目失败: {e}")
        db.rollback()
        raise
    
    finally:
        db.close()


if __name__ == "__main__":
    add_new_projects()
