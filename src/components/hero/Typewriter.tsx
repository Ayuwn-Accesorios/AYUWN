'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

interface TypewriterOptions {
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
  startDelayMs?: number;
}

function useTypewriter(words: readonly string[], options: TypewriterOptions = {}) {
  const { typeMs = 95, deleteMs = 55, holdMs = 1500, startDelayMs = 500 } = options;

  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex];
    let delay: number;
    let next: () => void;

    if (!deleting && text === word) {
      delay = holdMs;
      next = () => setDeleting(true);
    } else if (deleting && text === '') {
      delay = 250;
      next = () => {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      };
    } else if (deleting) {
      delay = deleteMs;
      next = () => setText(word.slice(0, text.length - 1));
    } else {
      delay = text === '' && wordIndex === 0 ? startDelayMs : typeMs;
      next = () => setText(word.slice(0, text.length + 1));
    }

    const id = setTimeout(next, delay);
    return () => clearTimeout(id);
  }, [text, deleting, wordIndex, words, typeMs, deleteMs, holdMs, startDelayMs]);

  return text;
}

export default function Typewriter({ words }: { words: readonly string[] }) {
  const reduceMotion = useReducedMotion();
  const typed = useTypewriter(words);

  // Con "reducir movimiento" se muestra el nombre fijo, sin animar.
  const shown = reduceMotion ? words[0] : typed;

  return (
    <span>
      {shown}
      {!reduceMotion && (
        <span className="animate-blink ml-1 inline-block h-[0.8em] w-[0.07em] translate-y-[0.06em] bg-white align-baseline" />
      )}
    </span>
  );
}