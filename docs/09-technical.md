# 기술 설계 초안

> 2026-10-29: 브라우저 시제품의 실제 구현/한계는 [v0.4 구현 문서](12-prototype.md)를 우선한다. 아래는 네이티브 제품 목표 구조다.

## 구조

React+TypeScript UI, 순수 상태 전환을 담당하는 도메인 로직, 정적 도감 콘텐츠, 로컬 저장 어댑터, macOS 호스트 어댑터로 분리. Tauri는 후보이며 현재 설치·구현·호환성 검증 없음. 실제 API 선택 전 공식 문서와 목표 버전 확인.

UI/호스트는 시간 이벤트를 전달하지만 보상 계산은 한 도메인 경로만 수행한다. 별도의 도감/정원 창에서 각각 시간을 적립하지 않는다. 단일 인스턴스를 기본으로 검토.

## 상태

idle → incubating → hatch_ready → raising → growth_ready → collection_complete 또는 다음 incubating.
사용자가 확인할 때 hatch_ready/growth_ready 연출을 재생한다. 도감 등록과 지급은 한 트랜잭션으로 처리. 개체 ID와 완료 이벤트 ID로 재생과 지급을 분리한다.

콘텐츠: `data/creatures.json`의 ID/출처/창작 설명. 현재 schema v2는 기획 데이터이며 앱 저장 규격과 다름.
세이브 제안: schemaVersion, contentVersion, instances[{id,speciesId,stage,progressSeconds,hatchedAt,grownAt,nickname}], activeEgg, raisingInstanceId, displayedInstanceId, savedProgressSeconds, dailyEarnedSeconds, dailyBucket, tutorialClaimed, processedCompletionIds, settings.

## 시간 처리

앱 실행 중 사용자 시작 세션의 단조 증가 시간으로 적립. 일시정지·수면 이벤트에서 중지. 긴 heartbeat 공백은 백그라운드 타이머 지연과 수면을 구분해 검증하고 무조건 실제 경과 전체를 적립하지 않는다. 벽시계는 표시 날짜와 일일 버킷에만 사용. 종료/재시작 후 오프라인 시간은 적립하지 않는다.

60초마다 체크포인트, 단계 전환/중지/종료 시 즉시 저장. 새 파일 기록→검증→원자적 교체, 마지막 정상 백업 보관을 설계. 목표 유실 상한은 1분, OS 강제 종료와 저장 실패에서 검증 필요.

시간대 변경으로 날짜 버킷을 여러 번 초기화하지 않도록 이미 정산된 버킷과 마지막 리셋 시각을 보관하는 정책을 구현 전 확정. 앱은 치팅 방지 DRM보다 오작동 방지에 집중하며 사용자의 시스템 시각을 바꾸지 않는다.

## 로컬 개인정보

콘텐츠·진행·설정만 저장. 키 입력/창 제목/문서/클립보드/브라우징/AI 인증 정보 없음. 별명은 로컬. 분석 SDK와 계정 서버는 MVP 없음. 동의한 알파 조사 항목만 별도로 수집한다.

가져오기 시 JSON 크기/스키마/ID/수치 범위 검사, 실패 시 기존 저장 유지. 구버전은 복사본에서 마이그레이션. 로컬 세이브는 사용자 조작을 완벽히 방지하지 못하며 이를 서버 개발 근거로 삼지 않는다.

## 성능·배포

동료 창은 숨김/최소화 시 불필요한 애니메이션 중지, 데이터 읽기 폴링 최소화. CPU/메모리/전력은 목표 macOS 기기에서 측정 후 예산 확정. 메뉴바·드래그·접근성·전체화면 호환성 우선.

공개 배포 전에 서명·공증·설치·업데이트·제거 경로를 별도 검증. Chrome 버전은 새 탭/사이드패널 방향의 후속 제품이며 macOS 로컬 파일을 자동으로 읽을 수 있다고 가정하지 않는다.
