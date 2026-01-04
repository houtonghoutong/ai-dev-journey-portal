"""
数据库初始化脚本
导入初始项目数据（与前端 constants.tsx 保持一致）
"""

from database import SessionLocal, init_db
from models import Project, Comment


# 初始项目数据（对应前端 INITIAL_PROJECTS）
INITIAL_PROJECTS = [
    {
        "id": "1",
        "title": "周易占卜",
        "category": "AI Tool",
        "short_description": "融合千年易学智慧与现代 AI 技术的智能占卜应用。",
        "full_description": "周易占卜是一款将中国传统易学文化与人工智能深度结合的创新应用。它基于《周易》六十四卦的古老智慧，通过现代化的交互界面，为用户提供卦象解读、运势分析和人生指引。AI 不仅能够精准地完成起卦、解卦的过程，还能结合用户的具体问题，给出个性化的解读建议。",
        "background_story": "作为一个对传统文化和现代技术都充满热情的开发者，我一直想找到一种方式将古老的智慧与 AI 技术相结合。周易作为中华文化的瑰宝，蕴含着深邃的哲学思想。通过 AI 的辅助，我希望让更多人能够接触、理解和体验这份传承千年的智慧，同时也是我探索 AI 驱动应用开发的一次有趣尝试。",
        "usage_instructions": "1. 打开应用，静心冥想你想要咨询的问题\n2. 点击\"开始占卜\"按钮进行摇卦\n3. 系统将自动生成卦象并呈现详细解读\n4. 阅读 AI 给出的卦辞解释和行动建议",
        "thumbnail_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
        "banner_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200",
        "external_link": "http://223.109.142.31:8866",
        "tags": ["AI", "周易", "传统文化", "Web App"],
        "likes_count": 88,
        "comments_count": 0
    },
    {
        "id": "2",
        "title": "小说阅读器",
        "category": "Web App",
        "short_description": "现代化的在线小说阅读平台，提供流畅的阅读体验。",
        "full_description": "小说阅读器是一个功能完善的在线阅读应用，为小说爱好者提供舒适的阅读环境。它支持多种阅读模式、字体调节、进度管理等功能，让用户可以随时随地沉浸在故事的世界中。界面设计简洁优雅，注重用户体验，让阅读成为一种享受。",
        "background_story": "作为一个热爱阅读的开发者，我发现很多在线阅读平台的体验并不理想 - 广告太多、排版混乱、功能繁杂。我希望打造一个纯粹、专注于阅读本身的应用，让读者能够专心享受文字带来的乐趣，不被其他因素干扰。",
        "usage_instructions": "1. 打开应用访问小说阅读器\n2. 浏览或搜索感兴趣的小说\n3. 点击开始阅读\n4. 使用阅读设置调整字体大小、背景色等\n5. 系统会自动保存阅读进度",
        "thumbnail_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
        "banner_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1200",
        "external_link": "http://223.109.142.31:8081/",
        "tags": ["阅读", "小说", "Web App", "用户体验"],
        "likes_count": 0,
        "comments_count": 0
    },
    {
        "id": "3",
        "title": "西双版纳旅游助手",
        "category": "AI Tool",
        "short_description": "AI 驱动的智能旅游规划助手，专注西双版纳深度游。",
        "full_description": "西双版纳旅游助手是一款结合了 AI 智能推荐与本地深度旅游信息的应用。它不仅能根据你的兴趣、时间和预算智能规划行程，还能提供景点介绍、美食推荐、交通指南等全方位的旅游服务。通过 AI 对话的方式，让旅游规划变得简单又有趣。",
        "background_story": "西双版纳是一个充满热带风情和民族文化的地方，但很多游客因为不了解而错过了许多精彩。我希望通过 AI 技术，让每一位游客都能像本地人一样深度体验西双版纳的魅力，发现那些隐藏的美景和独特的文化体验。",
        "usage_instructions": "1. 打开应用，告诉 AI 你的旅游需求（时间、预算、兴趣等）\n2. AI 会为你生成个性化的行程规划\n3. 浏览景点详情、查看美食推荐\n4. 获取实用的交通和住宿建议\n5. 随时与 AI 对话调整行程",
        "thumbnail_url": "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&q=80&w=800",
        "banner_url": "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&q=80&w=1200",
        "external_link": "http://223.109.142.31:8088/",
        "tags": ["AI", "旅游", "西双版纳", "智能推荐"],
        "likes_count": 0,
        "comments_count": 0
    }
]

# 初始评论数据
INITIAL_COMMENTS = []


def seed_database():
    """初始化数据库并导入种子数据"""
    print("初始化数据库表...")
    init_db()
    
    db = SessionLocal()
    
    try:
        # 检查是否已有数据
        existing_count = db.query(Project).count()
        if existing_count > 0:
            print(f"数据库已存在 {existing_count} 个项目，跳过初始化")
            return
        
        print("导入项目数据...")
        for project_data in INITIAL_PROJECTS:
            project = Project(**project_data)
            db.add(project)
        
        print("导入评论数据...")
        for comment_data in INITIAL_COMMENTS:
            comment = Comment(**comment_data)
            db.add(comment)
        
        db.commit()
        print(f"✅ 成功导入 {len(INITIAL_PROJECTS)} 个项目和 {len(INITIAL_COMMENTS)} 条评论")
    
    except Exception as e:
        print(f"❌ 数据导入失败: {e}")
        db.rollback()
        raise
    
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
