# 모아몬 맥 배포 절차

첫 맥 알파는 GitHub Releases에서 ZIP으로 직접 배포한다. 압축을 풀고 `Moamon.app`을 응용 프로그램 폴더로 옮겨 실행하는 방식이다. 현재 빌드 대상은 macOS 13 이상, 애플 실리콘과 인텔이다.

## 계정 소유자가 준비할 것

1. [Apple Developer Program 계정](https://developer.apple.com/account/)에서 가입 상태를 확인한다.
2. [Developer ID Application 인증서](https://developer.apple.com/help/account/certificates/create-developer-id-certificates)를 발급하고 개인 키가 있는 이 맥의 키체인에 설치한다. `security find-identity -v -p codesigning`에서 확인한다.
3. [Apple 공증 도구 안내](https://developer.apple.com/documentation/security/customizing-the-notarization-workflow)에 따라 키체인 프로필을 등록한다. 아래 명령으로 대화형 등록을 시작할 수 있다. 인증 정보는 로컬 프롬프트에 입력한다.

```sh
xcrun notarytool store-credentials moamon-notary
```

## 서명, 공증, 검증

프로젝트 폴더에서 실행한다. 서명 값은 키체인에 표시된 인증서 이름 또는 해시다.

```sh
MOAMON_SIGN_IDENTITY='Developer ID Application: 이름 (TEAMID)' \
MOAMON_NOTARY_PROFILE=moamon-notary npm run package:mac:release
```

범용 앱 빌드 후 강화된 런타임과 타임스탬프로 서명한다. Apple 공증이 수락되면 티켓을 앱에 첨부한다. 최종 ZIP을 다시 풀어 서명, 공증 티켓, Gatekeeper 평가를 확인한 뒤 `release/Moamon-<버전>-macOS-universal.zip`과 SHA-256 파일을 생성한다. 공증 처리 시간이 초과되면 출력된 제출 ID로 `xcrun notarytool info`를 확인한다.

## 게시 전 확인

1. 최종 ZIP으로 설치 후 첫 부화, 성장, 영문·국문 전환, 메뉴바, 바탕화면 친구와 종료 후 저장 복원을 확인한다. 가능하면 다른 맥에서도 설치하고 실행한다.
2. GitHub Releases에 공증된 ZIP과 해당 SHA-256을 첨부한다. 릴리스 태그를 실제 빌드의 소스 커밋에 연결한다. `npm run package:mac`의 `Lorehatch-…` ZIP은 개발 빌드다.
3. 두 언어 README의 다운로드 링크를 갱신하고 공개 파일의 이름, 크기, 해시를 확인한다.
