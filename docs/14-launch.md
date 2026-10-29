# 브라우저 알파 공개 준비 · v0.5

## 공개 범위

3종의 알 선택 → 부화 → 성장 → 도감 흐름을 제공하는 브라우저 알파다. 화면이 보이는 동안만 적립한다. 메뉴바 앱·다른 앱 작업 중 적립·수면 복귀·서명/공증은 미검증이다. 타이밍과 이름은 후보이며 재미나 생산성 향상 효과를 검증한 것은 아니다.

공유 이미지는 현재 모은 펫과 성장 수만 담고 별명·집중 시간은 제외한다. 링크 공유는 쿼리와 해시를 제거한다. 공유 버튼을 눌렀을 때만 OS 공유 또는 클립보드 쓰기를 요청한다. 자동 게시나 서버 전송은 없다.

## GitHub와 배포

2026-10-29 사용자 승인 후 dayainow/lorehatch 전체를 공개로 전환하고 PR #1을 main에 병합했다. 기획 문서와 과거 커밋도 공개된다. GitHub Pages 배포가 완료되어 https://dayainow.github.io/lorehatch/ 에서 제공한다. 라이선스는 미선정이다. 공개 소스의 열람과 자유 재배포 권한은 별개다.

1. 공개 전에 README, 과거 커밋, 출처·권리 문서를 검토한다. 비공개 자료가 없는지 확인한다.
2. 사용자 결정 후 저장소 공개 여부를 변경한다. 외부 방문자의 Star·이슈 접근을 로그아웃 상태로 확인한다.
3. Settings → Pages → Source를 GitHub Actions로 설정한다.
4. Actions → Publish browser alpha → Run workflow를 실행한다. 자동 push 배포는 하지 않는다.
5. Actions가 반환한 실제 URL에서 첫 부화, 체험 성장, 새로고침, 이미지 저장, 하위 경로의 에셋을 확인한다. 배포 URL 확인 전에는 온라인 체험 가능으로 홍보하지 않는다.
6. 공개 URL로 옮기면 로컬 origin의 저장은 자동 이전되지 않는다. 로컬 설정에서 내보낸 뒤 같은 모드에 가져온다.

## 게시용 문구 초안

### 한국어

작은 도트 펫을 키우는 ‘환수정원’을 만들고 있어요 🌱

알을 고르고, 집중 시간을 쌓고, 세 친구의 아기·성장 모습을 도감에 모으는 브라우저 알파입니다. 첫 알은 바로 부화하고 빠른 체험에서는 30초에 첫 성장을 볼 수 있어요.

설치·로그인 없이 체험할 수 있고, 진행은 브라우저에 저장됩니다. 현재는 정원 화면이 보일 때만 시간이 쌓여요.

https://dayainow.github.io/lorehatch/?mode=demo
GitHub: https://github.com/dayainow/lorehatch

마음에 드시면 GitHub Star로 응원해 주세요. 첫 알을 고르거나 집중을 시작할 때 헷갈린 점도 듣고 싶어요.

### English

I'm building Lorehatch, a tiny pixel-pet garden 🌱

Choose an egg, start a focus session, and collect three companions with baby and grown forms. Your first egg hatches instantly; the quick demo reaches its first growth in 30 seconds.

This browser alpha keeps progress locally, with no account or analytics SDK. Time accrues while the garden tab is visible.

https://dayainow.github.io/lorehatch/?mode=demo
GitHub: https://github.com/dayainow/lorehatch

If you enjoy it, a GitHub star would mean a lot. I'd love to hear where the first hatch or focus flow felt confusing.

## 첫 홍보 실행 기준

실제 첫 화면 캡처와 15~30초 영상 한 개를 준비한다. 영상은 빠른 체험임을 표시한다. 사용자 채널에 게시할 때 위 초안의 URL을 실제 주소로 바꾼다. 외부 커뮤니티 게시와 메시지 발송은 사용자가 실행하거나 별도 지시한 경우에만 진행한다.

첫 반응은 Star 수만으로 판단하지 않는다. 첫 부화 성공 여부, 다음 알을 키울 의향, 실제 방해 지점에 관한 자발적 피드백을 기록한다. 추적 도구나 개인정보 수집 폼은 추가하지 않는다.
