# SAIYEBO CHANGE CONTROL — CURRENT BASELINE

## Locked Today hierarchy
Hero → 관계 기상도 → 오늘 하루 예보 → 내일 → 7일 → 기록 → 실제 관계 입력 → 공유 → 하단 내비게이션.

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

Do not call the Today screen fully locked until rendered visual regression is confirmed after deployment.
