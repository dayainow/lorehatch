# 스토어 게시 실행 안내

2026-11-02 · 표시 이름은 모아몬(Moamon), 저장소 식별자는 lorehatch. 이 문서는 게시 준비물과 절차이며 실제 게시 결과가 아니다.

## 1. 먼저 Mac에서 5분 확인

1. `release/Lorehatch-0.6.0-macOS-universal.zip`을 Finder에서 압축 해제한다.
2. 나온 `Lorehatch.app`을 응용 프로그램 폴더로 옮기거나, 우선 현재 폴더에서 두 번 클릭한다. 이미 앱이 있으면 기존 앱을 종료하고 저장 파일부터 내보낸다.
3. 앱에서 30초 성장 체험을 누른다. 첫 알 선택 → 알 부화시키기 → 정원으로 돌아가기 → 집중 시작 → 성장한 모습 보기를 진행한다.
4. 설정에서 파일 내보내기를 누르고 JSON을 저장한다. `⌘Q`로 종료한 뒤 다시 열어 같은 펫이 있는지 확인한다.
5. 창의 닫기 버튼은 종료가 아니라 숨기기다. 메뉴바 잎 아이콘 → 정원 열기로 복귀한다. 완전히 종료하려면 `⌘Q` 또는 메뉴바 → 종료를 쓴다.
6. 메뉴바 → 항상 위에 표시를 켜고 작은 창으로 작업 옆에 둔다. 창이 숨겨지거나 잠자기에 들어가면 멈춘다. 다른 앱 사용 중 적립을 무조건 보장하는 모드는 아니다.

macOS 13 이상, Apple Silicon·Intel 공용 빌드다. 로컬 빌드는 ad-hoc 서명 상태다. 다른 Mac으로 전송한 파일은 Gatekeeper로 차단될 수 있다. 보안 설정 해제나 격리 속성 강제 제거를 안내하지 않는다. 실행이 막히면 공개 브라우저 알파를 사용하고 일반 사용자용 배포는 Developer ID 서명·공증 후 진행한다.

저장 위치: `~/Library/Application Support/Lorehatch/`. 브라우저 저장은 자동으로 가져오지 않으므로 설정의 내보내기/가져오기로 옮긴다.

## 2. itch.io에 올리기 — 첫 게시 경로

[새 프로젝트 만들기](https://itch.io/game/new)를 연다. 로그인과 계정 생성은 본인 계정에서 수행한다.

1. **Title:** 한국어는 **모아몬: 책상 위 알 키우기**, 영문은 `Moamon: Hatch Pets as You Focus` 초안.
2. **Project URL:** 원하는 주소를 입력하고 실제 사용 가능 여부를 확인. 이름 변경 전에는 확정하지 않는다.
3. **Classification:** Games. **Kind of project:** HTML / HTML Game.
4. **Release status:** In development. 현재 UI 언어는 한국어임을 설명에 표시한다. 영어 소개문이 있다고 영어 UI 지원으로 표시하지 않는다.
5. **Uploads:** `release/Lorehatch-0.6.0-web.zip` 업로드 → `This file will be played in the browser` 선택. ZIP의 최상단에 index.html이 있다.
6. 임베드 시작 크기는 1180×820을 후보로 설정하고 실제 미리보기에서 조정한다. 전체화면과 클릭 후 실행을 사용해 작은 화면에서 확인한다. 모바일 친화성은 실기기 검증 후 표시한다.
7. `docs/screenshots/v06-garden.jpg`, `v06-eggs.jpg`, `v06-growth.jpg`, `v06-collection.jpg`를 스크린샷으로 사용한다. 모두 빠른 체험임을 명시한다.
8. 아래 소개문을 입력하고 **Visibility: Draft**로 저장한다. 초안은 본인 미리보기용이다. 테스터 공유에는 별도의 Restricted 접근 설정을 검토한다.
9. 같은 itch.io 미리보기에서 부화·성장·새로고침·저장 내보내기/가져오기·전체화면을 확인한다. 기존 Pages와 origin이 달라 자동 저장 이전은 없다.
10. 제목·가격·공개 범위를 결정한 뒤 Public으로 변경한다. 게시와 검색 노출은 별개이며 즉시 검색 등재를 보장하지 않는다.

가격은 아직 결정하지 않았다. 결제 설정·계정 생성 약관 동의·최종 공개는 사용자가 결정한다. macOS ZIP은 서명·공증 전에는 일반 다운로드로 함께 홍보하지 않는다.

출처: [HTML5 업로드](https://itch.io/docs/creators/html5), [첫 페이지](https://itch.io/docs/creators/getting-started), [접근 제어](https://itch.io/docs/creators/access-control).

## 복사할 소개문 초안

**Short description**

Choose an egg, hatch a fantasy pet, and watch it grow with each focus session.

**Description**

Start with one little egg. Meet a forest dragon, a pegasus, or an ember-tailed puppy, and watch your companion grow as you spend time in your garden.

- Thirty companions across five habitats, each with baby and grown forms.
- Your first egg hatches instantly. Try the quick demo to see growth in 30 seconds.
- Pick a partner, give it a nickname, and collect its story in your journal.
- Discover 30 memory cards, 15 friendship stories, and 14 milestones.
- No account required. Progress stays on your device, with save-file export and import.
- Save a picture of your garden to share. Nicknames and focus time are excluded from the picture.

This is an in-development alpha with a Korean-language interface. Progress accrues while the garden is visible and a focus session is running; hiding the page or sleeping pauses it. The quick demo and normal garden use separate saves. Normal timing: 25-minute hatching after the first egg, 75-minute growth, and a 150-minute daily growth-credit limit. These values are experimental.

## 3. Chrome 웹스토어

현재 웹 ZIP은 확장 프로그램이 아니므로 제출하지 않는다. Manifest V3 + sidePanel 제품을 구현하고 검증한 다음 [개발자 등록](https://developer.chrome.com/docs/webstore/register) → ZIP 업로드 → 설명·스크린샷·개인정보 항목 작성 → 검토 제출 순서다. 계정 등록비가 있으며 현재 금액은 등록 화면에서 확인한다. `sidePanel` 외 웹페이지 읽기·방문 기록 권한은 현 기능에 필요하지 않다.

출처: [게시 절차](https://developer.chrome.com/docs/webstore/publish), [Side Panel](https://developer.chrome.com/docs/extensions/reference/api/sidePanel).

## 4. Mac App Store와 직접 다운로드의 차이

현재 패키지는 GitHub Releases/itch.io 직접 다운로드용 출발점이다. 일반 배포 전 Developer ID 서명·공증을 수행한다. Mac App Store는 별도로 Apple Developer 계정, App Store Connect 등록, 샌드박스·권한·서명 구성, 업로드와 앱 심사가 필요하다. 현재 universal ZIP을 그대로 App Store에 올릴 수 있는 것은 아니다.

출처: [Apple Developer ID](https://developer.apple.com/developer-id/), [Mac 앱 배포 안내](https://developer.apple.com/macos/distribution/).
