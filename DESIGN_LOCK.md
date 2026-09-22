# SAIYEBO CHANGE CONTROL — LOCKED BASELINE

This file is an operational guardrail for future edits.

## LOCKED
- Current deployed Today-screen layout after rollback.
- Existing production hero position and production forecast icons.
- Pretendard typography direction.
- Weather taxonomy: 맑음, 폭염, 구름 조금, 흐림, 비, 폭우, 눈, 폭설.

## Mandatory pre-edit check
1. State internally exactly what the user asked to change.
2. Treat everything else as protected.
3. Never redraw/reinterpret an approved visual and call it identical.
4. A reference image is NOT a production asset.
5. Do not replace a locked icon/asset until the exact production asset itself has been separately approved.
6. For icon work: preview actual candidate assets outside production first. Only after approval may the same exact files be referenced by Hero/hourly/tomorrow/7-day at different sizes.
7. CSS may size/position approved assets; CSS must not redraw approved icons.
8. Before commit, compare changed files against this baseline. If an unrelated locked area changed, do not deploy.
9. Failed experiments must not be reused as design references or production assets.

## Current icon status
No new 8-weather master asset set is approved for production.
The previously created assets/weather-icons.svg was a failed reinterpretation and must not be reused.

## Deployment rule
User approval of a visual concept does not equal approval of a newly recreated CSS/SVG implementation. Exact asset approval is required before production replacement.
