import { useEffect, useRef } from 'react';
import katex from 'katex';

export function K({ l }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      katex.render(l, ref.current, { throwOnError: false, displayMode: false });
    }
  }, [l]);
  return <span ref={ref} />;
}

export function KB({ l }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      katex.render(l, ref.current, { throwOnError: false, displayMode: true });
    }
  }, [l]);
  return <div ref={ref} style={{ overflowX: 'auto', margin: '0.8rem 0' }} />;
}
