# app-matrix-rain-react

`<MatrixRain />` wrapper around [`app-matrix-rain`](../core). Same config, React lifecycle handled for you.

## Usage

```tsx
import { MatrixRain } from 'app-matrix-rain-react';

function App() {
  return <MatrixRain charset="katakana" style={{ width: '100%', height: '100vh' }} />;
}
```

Props: every field from `MatrixRainConfig` (see [core README](../core/README.md)), plus `className` and `style` on the wrapping `<div>`. Props update the running instance on change, no remount.

## Imperative API

Only `scrambleText` needs a ref, everything else is a prop:

```tsx
import { useRef } from 'react';
import { MatrixRain, type MatrixRainHandle } from 'app-matrix-rain-react';

function App() {
  const rainRef = useRef<MatrixRainHandle>(null);

  return (
    <>
      <MatrixRain ref={rainRef} charset="cyrillic" style={{ width: '100%', height: '100vh' }} />
      <button onClick={() => rainRef.current?.scrambleText('WAKE UP')}>Scramble</button>
    </>
  );
}
```
