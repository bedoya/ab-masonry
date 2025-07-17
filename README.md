# ABMasonry

A lightweight, dependency-free Masonry-style image gallery built with TypeScript and CSS. Automatically distributes images across columns to achieve balanced vertical spacing.

![Version](https://img.shields.io/npm/v/ab-masonry?style=flat&color=success)
![License](https://img.shields.io/github/license/bedoya/ab-masonry?style=flat&color=success)
![Tests](https://img.shields.io/github/actions/workflow/status/bedoya/ab-masonry/tests.yml?label=tests&style=flat&color=success)
![Downloads](https://img.shields.io/npm/dt/ab-masonry?style=flat&color=success)

## Features

- Responsive image layout using CSS Flexbox
- Lazy-loading support
- Dynamic column height balancing
- Full-screen overlay on image click
- Horizontal drag scroll on mobile
- Works with dynamic or external data

## Installation

```bash
npm install ab-masonry
```

## Usage

### HTML

Create a container where the gallery will be mounted:

```html
<div id="masonry"></div>
```

### JavaScript

```js
import { ABMasonry } from 'ab-masonry';

const items = [
  {
    img: 'https://picsum.photos/300/400?random=1',
    caption: 'Photo 1',
    link: 'https://example.com/photo1'
  },
  {
    img: 'https://picsum.photos/300/300?random=2',
    caption: 'Photo 2'
  }
];

const options = {
  columns: 3,
  gap: '16px',
  lazy: true,
  overlayZIndex: 2147483647
};

const masonry = await ABMasonry.create('#masonry', items, options);
// No need to call `render()`, it's handled automatically
```

### Styles

**ABMasonry does not inject styles automatically.** You must explicitly import the CSS manually:

```css
@import 'ab-masonry/dist/ab-masonry.css';
```

## Options

| Option          | Type       | Default      | Description                                  |
|-----------------|------------|--------------|----------------------------------------------|
| `columns`       | `number`   | `3`          | Number of columns                            |
| `gap`           | `string`   | `'16px'`     | Gap between items and columns                |
| `lazy`          | `boolean`  | `false`      | Enables `loading="lazy"`                     |
| `overlayZIndex` | `number`   | `2147483647` | Z-index of the full-screen overlay           |
| `title`         | `string`   | ``           | Image title (used as `alt` and overlay text) |


## Styling

All styles are scoped to `.ab-masonry`. You can override them as needed:

```css
.ab-masonry__item {
    border-radius: 4px;
    overflow: hidden;
}
```

## Development

```bash
npm install
npm run dev
```

## License

MIT © Andrés Bedoya
