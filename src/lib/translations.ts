export type Language = 'en' | 'zh';

export interface Translations {
  [key: string]: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Sidebar
    'sidebar.newChat': 'New chat',
    'sidebar.admittedData': 'Admitted Data',
    'sidebar.myBlueprint': 'My Blueprint',
    'sidebar.about': 'About',
    'sidebar.unlocks': 'Unlocks',
    'sidebar.purchasedContent': 'Purchased Content',
    'sidebar.recent': 'Recent',
    'sidebar.deleteChat': 'Delete chat',
    'language.toggle': '中文',
    
    // Home page
    'home.provideProfileContext': 'Provide Profile Context',
    'home.understandTechnology': 'Understand our Technology',
    'home.sending': 'Sending...',
    'home.send': 'Send',
    
    // Chat placeholders
    'chat.placeholder.psychology': 'Help me find opportunities in the Bay Area for a Psychology major.',
    'chat.placeholder.neuroscience': 'Suggest summer research or internships for a junior into neuroscience.',
    'chat.placeholder.climate': 'Find community service roles for a student passionate about climate policy.',
    'chat.placeholder.robotics': 'Draft a cohesive story linking robotics, entrepreneurship, and leadership.',
    'chat.placeholder.cs': 'Recommend clubs and projects to build a compelling CS transfer story.',
    
    // Authentication
    'auth.signIn': 'Sign in',
    'auth.signUp': 'Sign up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.displayName': 'Display Name',
    'auth.signInFailed': 'Sign in failed',
    'auth.signUpFailed': 'Sign up failed',
    'auth.welcomeBack': 'Welcome back!',
    'auth.accountCreated': 'Account created!',
    'auth.verifyEmail': 'Please check your email to verify your account.',
    'auth.logIn': 'Log in',
    'auth.sending': 'Signing in...',
    'auth.saving': 'Creating account...',
    
    // Profile Context
    'profile.applicationContext': 'Application Context',
    'profile.addContext': 'Add any context you want the AI to consider for your profile...',
    'profile.saving': 'Saving…',
    'profile.save': 'Save',
    'profile.graduationYear': 'Graduation Year',
    'profile.demographic': 'Demographic (Race)',
    'profile.school': 'School You Attend',
    'profile.gpa': 'GPA',
    'profile.sat': 'SAT',
    'profile.activities': 'Activities',
    'profile.apScores': 'AP Scores',
    'profile.add': 'Add',
    'profile.remove': 'Remove',
    'profile.description': 'Description',
    'profile.hours': 'Hours',
    'profile.score': 'Score',
    'profile.subject': 'Subject',
    'profile.awards': 'Awards',
    
    // Personal Blueprint
    'blueprint.title': 'Personal Blueprint',
    'blueprint.comingSoon': 'This feature is coming soon. Enter password to preview.',
    'blueprint.enterPassword': 'Enter password',
    'blueprint.incorrectPassword': 'Incorrect password. Please try again.',
    
    // Password Gate
    'password.tagline': 'Using data & AI to change the college consulting landscape.',
    'password.betaMessage': 'In beta test mode. Email royli@usc.edu to request for beta access.',
    'password.enterPassword': 'Enter password',
    'password.incorrectPassword': 'Incorrect password. Please try again.',
    
    // Page Titles
    'pages.home.title': 'Dashboard',
    'pages.blueprint.title': 'My Blueprint',
    'pages.admittedData.title': 'Admitted Data',
    'pages.technology.title': 'Technology',
    'pages.profile.title': 'Profile',
    'pages.unlocks.title': 'Unlocks',
    'pages.purchasedContent.title': 'Purchased Content',
  },
  zh: {
    // Sidebar
    'sidebar.newChat': '新聊天',
    'sidebar.admittedData': '录取数据',
    'sidebar.myBlueprint': '我的蓝图',
    'sidebar.about': '关于',
    'sidebar.unlocks': '解锁内容',
    'sidebar.purchasedContent': '已购买内容',
    'sidebar.recent': '最近',
    'sidebar.deleteChat': '删除聊天',
    'language.toggle': 'English',
    
    // Home page
    'home.provideProfileContext': '提供个人档案信息',
    'home.understandTechnology': '了解我们的技术',
    'home.sending': '发送中...',
    'home.send': '发送',
    
    // Chat placeholders
    'chat.placeholder.psychology': '帮我为心理学专业在湾区寻找机会。',
    'chat.placeholder.neuroscience': '为对神经科学感兴趣的大三学生推荐暑期研究或实习。',
    'chat.placeholder.climate': '为对气候政策充满热情的学生寻找社区服务角色。',
    'chat.placeholder.robotics': '起草一个连接机器人技术、创业和领导力的连贯故事。',
    'chat.placeholder.cs': '推荐俱乐部和项目来构建引人注目的计算机科学转学故事。',
    
    // Authentication
    'auth.signIn': '登录',
    'auth.signUp': '注册',
    'auth.email': '邮箱',
    'auth.password': '密码',
    'auth.displayName': '显示名称',
    'auth.signInFailed': '登录失败',
    'auth.signUpFailed': '注册失败',
    'auth.welcomeBack': '欢迎回来！',
    'auth.accountCreated': '账户已创建！',
    'auth.verifyEmail': '请检查您的邮箱以验证账户。',
    'auth.logIn': '登录',
    'auth.sending': '登录中...',
    'auth.saving': '创建账户中...',
    
    // Profile Context
    'profile.applicationContext': '申请背景',
    'profile.addContext': '添加您希望AI考虑的任何个人背景信息...',
    'profile.saving': '保存中…',
    'profile.save': '保存',
    'profile.graduationYear': '毕业年份',
    'profile.demographic': '人口统计（种族）',
    'profile.school': '您就读的学校',
    'profile.gpa': 'GPA',
    'profile.sat': 'SAT',
    'profile.activities': '活动',
    'profile.apScores': 'AP成绩',
    'profile.add': '添加',
    'profile.remove': '删除',
    'profile.description': '描述',
    'profile.hours': '小时',
    'profile.score': '分数',
    'profile.subject': '科目',
    'profile.awards': '奖项',
    
    // Personal Blueprint
    'blueprint.title': '个人蓝图',
    'blueprint.comingSoon': '此功能即将推出。输入密码预览。',
    'blueprint.enterPassword': '输入密码',
    'blueprint.incorrectPassword': '密码错误，请重试。',
    
    // Password Gate
    'password.tagline': '使用数据和人工智能改变大学咨询格局。',
    'password.betaMessage': '测试模式。发送邮件至 royli@usc.edu 申请测试访问权限。',
    'password.enterPassword': '输入密码',
    'password.incorrectPassword': '密码错误，请重试。',
    
    // Page Titles
    'pages.home.title': '主页',
    'pages.blueprint.title': '我的蓝图',
    'pages.admittedData.title': '录取数据',
    'pages.technology.title': '技术',
    'pages.profile.title': '个人资料',
    'pages.unlocks.title': '解锁内容',
    'pages.purchasedContent.title': '已购买内容',
  }
};
