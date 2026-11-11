// A share URL carries no nickname, progress, mode, or imported query parameters.
export function publicURL(href) {
  const url = new URL(href);
  url.search = ''; url.hash = '';
  return url.href;
}
export function shareText(href,locale='ko') {
  if(locale==='en')return `Hatch a little pixel friend in Moamon 🌱\nPlay in your browser — no installation needed.\n${publicURL(href)}`;
  return `알을 부화시키고 작은 도트 펫을 키우는 모아몬 🌱\n설치 없이 브라우저에서 시작해 보세요.\n${publicURL(href)}`;
}
