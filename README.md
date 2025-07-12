# ABMasonry

A lightweight, dependency-free Masonry-style image gallery built with TypeScript and CSS. Automatically distributes
images across columns to achieve balanced vertical spacing.

## Features

- Responsive image layout using CSS Flexbox
- Lazy-loading support
- Dynamic column height balancing
- Click to view full-size overlay
- Style via `.ab-masonry` container

## Installation

```bash
npm install ab-masonry
```

## Usage

```html
<div id="gallery"></div>
```

```js
import { ABMasonry } from 'ab-masonry';

const images = [
  { url: 'https://picsum.photos/300/400?random=1', description: 'Photo 1' },
  { url: 'https://picsum.photos/300/300?random=2', description: 'Photo 2' },
  // ...
];

const options = {
  cols: 3,
  gap: '12px',
  lazy: true
};

new ABMasonry('#gallery', images, options);
```

## Options

| Option | Type      | Default | Description                   |
| ------ | --------- | ------- | ----------------------------- |
| `cols` | `number`  | `3`     | Number of columns             |
| `gap`  | `string`  | `'8px'` | Gap between items and columns |
| `lazy` | `boolean` | `false` | Enables `loading="lazy"`      |


## Styling

All styles are scoped to `.ab-masonry`. You can override defaults as needed.

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
