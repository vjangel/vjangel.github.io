(() => {
  const downloads = window.CURSOR_DOWNLOADS || {};
  for (const theme of window.CURSOR_CATALOG?.themes || []) {
    theme.download = { ...theme.download, zip: downloads[theme.id] || '' };
  }
  // Keep the selected gallery language through collection and theme links.
  const originalHref = window.GalleryCore.galleryHref;
  const routeLanguage = () => document.getElementById('language')?.value || document.documentElement.lang;
  window.GalleryCore.galleryHref = (view, options) => {
    const url = new URL(originalHref(view, options), location.href);
    url.searchParams.set('lang', routeLanguage());
    return './index.html' + url.search;
  };
  function sync() {
    const lang = document.documentElement.lang;
    const chinese = lang.startsWith('zh');
    const currentUrl = new URL(location.href);
    if (currentUrl.searchParams.get('lang') !== routeLanguage()) {
      currentUrl.searchParams.set('lang', routeLanguage());
      history.replaceState(null, '', currentUrl);
    }
    for (const link of document.querySelectorAll('[data-site-back]')) {
      link.href = chinese ? '/' : '/en/';
      link.title = link.ariaLabel = chinese ? '返回 VeiJay' : 'Back to VeiJay';
    }
    for (const link of document.querySelectorAll('a[href^="./index.html"]')) {
      const url = new URL(link.href);
      url.searchParams.set('lang', routeLanguage());
      link.href = './index.html' + url.search + url.hash;
    }
    for (const notice of document.querySelectorAll('[data-download-notice]')) {
      notice.hidden = Object.keys(downloads).length > 0;
      notice.textContent = chinese ? '主题预览已开放，安装包暂未开放在线下载。' : 'Previews are available. Installation packages are not available online yet.';
    }
  }
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  document.addEventListener('DOMContentLoaded', sync, { once: true });
})();
