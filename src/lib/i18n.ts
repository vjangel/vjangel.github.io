import { getRelativeLocaleUrl } from 'astro:i18n';

export const locales = ['zh-CN', 'en'] as const;
export type Locale = (typeof locales)[number];

export function localizedPath(locale: Locale, path: string) {
  return getRelativeLocaleUrl(locale, path.slice(1));
}

export const copy = {
  'zh-CN': {
    home: '首页', projects: '作品', blog: '文章',
    navigation: '主导航', language: '语言', skip: '跳到正文',
    title: '个人作品与技术笔记',
    intro: '收录我的 Windows 动态光标、网页项目，以及开发过程中的技术笔记。',
    featured: '精选作品', latest: '最近文章',
    allProjects: '全部作品', allPosts: '全部文章', viewProject: '查看项目',
    backgroundHint: '移动鼠标或触屏滑动，点击激起光波',
    socialAccounts: '社交账号', opensNewTab: '在新标签页打开',
    openProject: '进入展馆', projectDetails: '项目介绍',
  },
  en: {
    home: 'Home', projects: 'Projects', blog: 'Notes',
    navigation: 'Main navigation', language: 'Language', skip: 'Skip to content',
    title: 'Projects and technical notes',
    intro: 'A collection of my animated Windows cursors, web projects, and notes from building them.',
    featured: 'Featured project', latest: 'Latest notes',
    allProjects: 'All projects', allPosts: 'All notes', viewProject: 'View project',
    backgroundHint: 'Move or drag to stir the light. Tap to make a wave.',
    socialAccounts: 'Social profiles', opensNewTab: 'Opens in a new tab',
    openProject: 'Open gallery', projectDetails: 'About the project',
  },
} satisfies Record<Locale, Record<string, string>>;
