## [1.1.4] - 2025-07-12

### Fixed
- Overlay was not being displayed due to missing `z-index` — added `overlayZIndex` option (default: `2147483647`).
- ES module export was broken when importing in external projects — now properly exposes `ABMasonry` as default.

### Changed
- `README.md` updated to clarify that styles must be imported manually via:
  ```css
  @import 'ab-masonry/dist/ab-masonry.css';
