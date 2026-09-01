import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from 'react';
import { MatrixRain as MatrixRainCore, type MatrixRainConfig } from 'app-matrix-rain';

export interface MatrixRainProps extends Partial<MatrixRainConfig> {
  className?: string;
  style?: CSSProperties;
}

export interface MatrixRainHandle {
  scrambleText(text: string): void;
}

export const MatrixRain = forwardRef<MatrixRainHandle, MatrixRainProps>(function MatrixRain(
  {
    className,
    style,
    charset,
    direction,
    fontSize,
    speed,
    density,
    color,
    backgroundColor,
    glitchOnHover,
    fadeOpacity,
    respectReducedMotion,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<MatrixRainCore | null>(null);

  const config = omitUndefined({
    charset,
    direction,
    fontSize,
    speed,
    density,
    color,
    backgroundColor,
    glitchOnHover,
    fadeOpacity,
    respectReducedMotion,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const instance = new MatrixRainCore(containerRef.current, config);
    instanceRef.current = instance;
    instance.start();

    return () => {
      instance.destroy();
      instanceRef.current = null;
    };
    // config only applied here for the initial mount, later changes go through updateConfig below.
  }, []);

  useEffect(() => {
    instanceRef.current?.updateConfig(config);
  }, [charset, direction, fontSize, speed, density, color, backgroundColor, glitchOnHover, fadeOpacity, respectReducedMotion]);

  useImperativeHandle(
    ref,
    () => ({
      scrambleText: (text: string) => instanceRef.current?.scrambleText(text),
    }),
    [],
  );

  return <div ref={containerRef} className={className} style={style} />;
});

function omitUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as Partial<T>;
}
