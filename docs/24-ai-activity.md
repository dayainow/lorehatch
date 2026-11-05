# AI activity alpha — Claude Code

This experimental Mac integration credits **one minute of growth per minute bucket containing a completion signal**. It is an activity reward, not measured work duration or a token meter. It makes no model/API calls.

## Connect once

1. Build/install the current Moamon Mac app, launch it, and hatch your first egg in the normal garden.
2. Open garden settings and enable **작업 완료 신호 반영** under **AI와 함께 자라기**.
3. In Claude Code's `/hooks` configuration, add a **Stop** command hook pointing at your installed app executable. For an app installed in your user Applications folder:

```sh
"$HOME/Applications/Moamon.app/Contents/MacOS/Lorehatch" --activity-signal
```

If the app is installed elsewhere, change that path. Keep existing hooks intact. Moamon does not edit Claude configuration automatically. The checkbox alone does not install the hook.

Claude Code's official [hook reference](https://code.claude.com/docs/en/hooks) defines Stop as completion of a response. The command ignores stdin entirely, even if the hook payload contains private content. Only the current timestamp is written to the app's `activity-signal` file. It never reads the conversation, transcript, token counts, keys or clipboard. Failures do not block the AI tool.

## Behavior and limits

- Mac app must be running, but the normal garden window can be closed. A native five-second timer delivers signals to the game. System sleep, application termination, or stalled web content can delay delivery; signals older than 60 seconds are discarded. No offline backfill.
- The minute in which you enable the integration is the baseline; credit starts in a later minute. Existing signals are not rewarded.
- Multiple completions in one minute count once. The saved cursor prevents duplicate rewards after restart.
- The ordinary daily 150-minute cap remains. AI activity is disabled in the fast demo and does not add credit alongside a running manual session.
- Disconnect by turning the setting off, then removing the specific Stop hook. Disabling the setting stops rewards; removing the hook stops timestamp writes.
- This is a first Claude Code hook adapter. Codex, token usage tracking, cost estimates and automatic configuration are not supported.
- The hook adapter and game logic are tested with synthetic signals. Live Claude Code completion and long-running background behavior still need end-to-end validation.

## 한국어

Claude Code에서 응답이 끝난 1분 구간마다 성장 시간 1분을 주는 실험 기능입니다. 실제 작업 시간 측정은 아닙니다. 정상 정원에서 첫 알을 부화한 뒤 설정에서 켜고, Claude Code의 `/hooks`에서 Stop 명령으로 위 경로를 등록하세요. 설정을 켠 분은 기준점이며 다음 분부터 반영합니다. 앱을 실행해 두어야 하며 1분 넘게 지난 신호는 버립니다. 대화 내용과 토큰은 읽지 않고 완료 시각만 저장합니다.
