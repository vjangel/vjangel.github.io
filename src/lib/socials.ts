export type SocialPlatform = 'github' | 'x';

// 填写完整的个人主页链接；留空的平台不会出现在页面上。
export const socialProfiles: { platform: SocialPlatform; name: string; url: string }[] = [
  { platform: 'github', name: 'GitHub', url: 'https://github.com/vjangel' },
  { platform: 'x', name: 'X', url: '' },
];

export const socialLinks = socialProfiles
  .map((profile) => ({ ...profile, url: profile.url.trim() }))
  .filter(({ url }) => url.length > 0);
