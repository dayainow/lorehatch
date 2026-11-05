# v0.6 분석과 다음 작업 · 배포 경로

2026-11-02 · 현재 작업 트리 분석. 기존 미커밋 PWA/macOS 구현을 포함한다.

## 판단

이미 3종 선택·부화·성장·도감·로컬 저장이 있는 웹 게임이다. React 프로젝트가 아니라 의존성 없는 JavaScript ES 모듈과 HTML/CSS, macOS Swift 호스트로 구성된다. 사용자 표현의 ‘rea’가 특정 제품을 뜻하는지는 확정하지 않았다.

강점은 30초 체험, 전승과 창작 설정 분리, 저장 파일 이전, 추적 없는 가벼운 구조다. 가장 큰 제품 제약은 ‘집중 동반자’이면서 다른 탭으로 가면 멈춘다는 점이다. 설치 형태를 추가해도 이 규칙이 자동으로 해결되지는 않는다. 10종 확장보다 실제 작업 중 사용성과 안전한 저장을 먼저 검증한다.

## 배포 우선순위

### 1. GitHub Pages + PWA

기존 공개 URL로 체험 진입을 유지하고 검증한 빌드를 수동 배포한다. PWA는 웹사이트에서 설치하는 방식이다. 공개 버전과 로컬 버전은 구분해야 한다. 기존 공개 사이트의 배포를 이번 작업에서 실행하지 않았다.

### 2. itch.io HTML5 — 우선 추천

HTML/CSS/JS 게임을 ZIP으로 올리고 브라우저에서 실행하는 배포 경로다. 현재 구조를 가장 적게 바꿔 게임 소개·스크린샷·피드백 페이지를 만들 수 있다.

- `npm run package:web` → `release/Lorehatch-0.6.0-web.zip` 및 SHA-256 파일 생성.
- ZIP 최상단에 `index.html`이 있으며 앱·폰트·이미지가 포함된다.
- itch.io 새 프로젝트에서 HTML Game을 선택해 ZIP을 업로드한다. 우선 비공개 초안으로 검증한다.
- 임베드 크기·전체화면·모바일 시작 동작을 확인한다. 저장, 새로고침, 파일 내보내기/가져오기, 공유를 실제 itch.io origin에서 검증한다.
- iframe에서는 설치 메뉴·저장·공유 API 동작이 달라질 수 있다. PWA 설치를 임베드의 보장 기능으로 홍보하지 않는다.
- 모든 확인 후 공개 여부와 가격을 사용자가 결정한다. 이번 작업은 업로드·등록·가격 결정을 하지 않는다.

출처: [itch.io HTML5 업로드 안내](https://itch.io/docs/creators/html5).

### 3. Chrome 웹스토어 — 별도 확장 프로그램 제품

현재 `manifest.webmanifest`는 PWA용이고 확장 프로그램의 `manifest.json`이 아니다. 현 ZIP을 그대로 웹스토어에 제출하는 경로는 아니다. 브라우저 옆에서 펫을 키우는 목적이라면 Manifest V3 + Side Panel 형태가 적합한 후보다.

다음 개발 범위는 별도 확장 manifest, 패널 레이아웃, 최소 `sidePanel` 권한, 확장 origin 저장 이전, 패널 닫힘·창 전환 시 타이머 규칙, 확장 CSP 검증이다. 웹페이지 내용이나 방문 기록을 읽을 필요는 없다. 계정 등록과 스토어 설명·개인정보 항목·검토 절차가 남으며 심사 승인을 보장하지 않는다.

출처: [Chrome 게시 절차](https://developer.chrome.com/docs/webstore/publish), [Side Panel API](https://developer.chrome.com/docs/extensions/reference/api/sidePanel).

### 4. macOS 다운로드

GitHub Releases 또는 itch.io 다운로드로 제공할 후보다. 현재 Swift 호스트와 universal ZIP 스크립트는 존재하지만 공개 릴리스는 없다. 원자적 저장·손상 복구·앱 재시작·잠자기·다중 실행을 확인하고 Developer ID 서명 및 공증을 준비한 뒤 일반 사용자 배포를 검토한다. Mac App Store 입점은 별도 심사·패키징 과제다.

출처: [Apple 공증 안내](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution).

## 실행 순서와 완료 기준

1. **이번 작업:** README를 실제 플레이 중심으로 정리, 최신 화면 촬영, 설치 안내 보완, 웹 ZIP 생성과 무결성 검증.
2. **다음 P0:** 정식 빌드의 오프라인 재실행·업데이트·이전 버전 저장 복구를 브라우저에서 확인. 정상/체험 저장이 섞이지 않고 업데이트 후 펫이 유지되어야 완료.
3. **다음 P0:** macOS 저장과 잠자기 복귀 E2E. 다른 앱 작업 중 적립을 지원할지 먼저 규칙을 결정하고 입력/클립보드 수집 없이 구현. 현재 지원으로 홍보하지 않는다.
4. **다음 P1:** itch.io 비공개 초안 업로드 후 임베드 E2E, 공개 소개 페이지 검토. 실제 등록은 별도 지시 시 실행.
5. **다음 P1:** 5명 사용성 검증. [기존 검증안](16-alpha-playtest.md)의 첫 부화·성장 성공 및 저장 유실 없음 기준 적용.
6. **다음 P2:** 불꽃용·구미호 등 콘텐츠 확장 또는 Chrome Side Panel 중 검증 결과에 맞는 하나를 선택. 기존 source ID 유지, 3종을 6종으로 세지 않음.

## README 레퍼런스

- [VS Code Pets](https://github.com/tonybaloney/vscode-pets): 짧은 제품 설명, 바로 사용할 수 있는 설치 경로, 사용법과 크레딧의 분리.
- [Desktop Pet / eSheep](https://github.com/Adrianotiger/desktopPet): 캐릭터 소개와 플랫폼별 제공 상태를 구분하는 방식.

구성과 정보 순서만 참고했다. 제3자 이미지·스프라이트·문구를 복사하지 않았다.
