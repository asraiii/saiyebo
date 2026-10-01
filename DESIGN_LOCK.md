# SAIYEBO CHANGE CONTROL — CURRENT BASELINE

## Locked Today hierarchy
Hero → 관계 기상도 → 오늘 하루 예보 → 내일의 사이예보 → 이번 주 관계 기류 → 기록 → 공유 → 하단 내비게이션.

## Locked visual direction
- Real weather-app hierarchy, not a quiz/game layout.
- Fixed white Hero typography with subtle readability shadow.
- One local 8-state weather SVG family: 맑음, 폭염, 구름 조금, 흐림, 비, 폭우, 눈, 폭설.
- Hero weather palettes change by state.
- Forecast surface: cool light `#F1F6F8`.
- Share CTA stays inside the forecast surface and follows the active Hero weather accent.
- Weather-state QA controls must not be visible in production UI.

## Weather assets
Approved production family:
`assets/weather/soft-3d/`
- clear-day.svg
- sun-hot.svg
- partly-cloudy-day.svg
- overcast.svg
- rain.svg
- extreme-rain.svg
- snow.svg
- extreme-snow.svg

Hero-specific icon redesign remains on hold. CSS may size/position these assets but must not redraw them.

## Structural lock
- `.forecast-sheet` is the real lower-page surface and owns the rounded top.
- Do not recreate the sheet radius with negative pseudo-element caps.
- Do not create page-sized decorative pseudo-elements for share/layout.
- Do not reintroduce accumulated version override blocks or `!important` patch chains.
- Keep one records section and one share section.

## Mandatory RED TEAM on every UI change
Check the requested area plus adjacent regression risk. Maintain:
- 8 weather states.
- Mobile: 360/375/390/430.
- Tablet: 768/834/1024.
- Desktop host: 1280/1440/1920.
- Hero text/icon collision.
- Forecast sheet continuity.
- Share containment and weather accent.
- Fixed navigation overlap and safe-area spacing.
- Accessibility zoom and readable controls.

## QA weather states
The visible selector is removed. During QA use:
`?weather=clear`, `heat`, `partly`, `overcast`, `rain`, `storm`, `snow`, `blizzard`.

Current status: code-level Today baseline is frozen at v17.4. Do not call the Today screen pixel-perfect or rendered-device verified until visual regression is confirmed on actual target viewports.

## Product decision — 2026-09-30
- `오늘 실제 우리 사이는 어땠나요?` feedback selector is removed from Today.
- Keep daily actual-condition input only as a future candidate for the 기록 experience; do not re-add it to Today without a new product decision.


## Today v17.4 freeze
- Main Today design structure is frozen for the next implementation phase.
- Non-Hero typography uses the two-token system: `--text-sm:12px`, `--text-md:14px`; headings and numeric displays are semantic exceptions.
- Hourly forecast has no instructional text or arrow. Horizontal affordance is provided by partial next-card reveal.
- 내일은 아이콘 + 방향성 문구만 노출하고 온도는 노출하지 않는다.
- 이번 주는 7일 개별 예보를 공개하지 않고 전체 관계 기류만 요약한다. 구체적인 미래 날짜별 날씨를 다시 노출하려면 새로운 제품 결정이 필요하다.
- Further Today visual changes should be regression fixes or explicit new product decisions, not opportunistic redesign.
