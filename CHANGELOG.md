## [1.2.1] - 2025-07-16

### Added

- Full test coverage for `ABMasonryElement`, including image load and error handling.
- Tests for drag-scroll behavior in `ABMasonryRenderer`.
- Tests for overlay image and caption rendering in `ABMasonryOverlay`.

### Fixed

- Internal image mocks now simulate `naturalWidth` and `naturalHeight` in tests.

## [1.2.0] - 2025-07-16

### Added

- New `ABMasonryOverlay` system: clicking on an image shows a modal overlay with the image and optional caption/link.
- Full mobile support with responsive styles.
- Automatic column balancing based on content height.
- Integration tests for resize listener.
- CSS gap support dynamically based on screen size.
- Overlay z-index configurable via `overlayZIndex` option.

### Changed

- Masonry layout rebuilt with modular
  classes: `ABMasonry`, `ABMasonryColumn`, `ABMasonryElement`, `ABMasonryRenderer`, `ABMasonryOverlay`.
- Desktop layout uses proper flex column distribution with consistent gap.
- Internal image height calculation improved for consistent layout.

### Removed

- Scroll arrows for mobile layout (simplified UX).

### Fixed

- Overlay modal not closing after click — now auto-hides on overlay click.
- Style fixes for desktop layout (only one column was rendering previously).

## [1.1.4] - 2025-07-12

### Fixed

- Overlay was not being displayed due to missing `z-index` — added `overlayZIndex` option (default: `2147483647`).
- ES module export was broken when importing in external projects — now properly exposes `ABMasonry` as default.

### Changed

- `README.md` updated to clarify that styles must be imported manually via:
  ```css
  @import 'ab-masonry/dist/ab-masonry.css';
