'use client';
import { useRef } from 'react';

export function useKeyboardAware() {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  function onFocus() {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }
  return { ref, onFocus };
}
