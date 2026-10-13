import React, { useEffect, useState, useCallback } from 'react';
import { JapaneseTowerLandscape } from '../shaders/japanese-tower/JapaneseTowerLandscape';
import { Chapter01Experience } from './Chapter01Experience';
import { Chapter02Experience } from './Chapter02Experience';
import { Chapter03Experience } from './Chapter03Experience';
import '../shaders/threeui.css';

export type ChapterId =
  | 'before-the-armor'
  | 'the-summons'
  | 'borrowed-armor'
  | 'the-mountain'
  | 'honor-without-disguise';

export interface ChapterMeta {
  id: ChapterId;
  number: string;
  title: string;
  hanzi: string;
  theme: string;
  duration: string;
  image: string;
  synopsis: string;
  leadQuote: string;
  bodyParagraphs: string[];
  details: { label: string; value: string }[];
}

export const CHAPTERS_DATA: Record<ChapterId, ChapterMeta> = {
  'before-the-armor': {
    id: 'before-the-armor',
    number: '01',
    title: 'Before the Armor',
    hanzi: '盔甲之前',
    theme: 'Family · Home · Tradition · Identity',
    duration: '14 min',
    image: '/landing-pages/secret-pathways-assets/mulan-01-before-armor.jpg',
    synopsis:
      'In the House of Fa, Mulan struggles between duty, tradition, and the quiet feeling that she was meant for more.',
    leadQuote: 'Quiet filial walls and the weight of tradition before the summons arrived.',
    bodyParagraphs: [
      'Beneath the carved eaves of the ancestral estate, the loom clattered with the steady cadence of generations before her. Every fold of silk was an expectation woven into fabric, every tea bowl served a ritual of daughterly devotion.',
      'Yet in the garden pavilion at dusk, reflecting upon the lotus pool, Mulan saw a horizon stretching far beyond the compound walls. Her honor was not a passive inheritance, but a flame waiting for its true trial.'
    ],
    details: [
      { label: 'Realm', value: 'The House of Fa' },
      { label: 'Artifact', value: 'The Weaving Shuttle & Comb' },
      { label: 'Virtue', value: '孝 · Filial Devotion' },
      { label: 'Next Chapter', value: '02 — The Summons' }
    ]
  },
  'the-summons': {
    id: 'the-summons',
    number: '02',
    title: 'The Summons',
    hanzi: '征召令',
    theme: 'Imperial Authority · Tradition · Ancient China · The Departure',
    duration: '18 min',
    image: '/landing-pages/secret-pathways-assets/mulan-02-summons.jpg',
    synopsis:
      'An imperial decree arrives: one man from every family must go to war, and Mulan watches her wounded father answer the call.',
    leadQuote: 'Imperial horns pierce the morning fog. One son from every household must march.',
    bodyParagraphs: [
      'The imperial herald’s steed tore through the quiet gate, scattering yellow dust and parchment proclamations bearing the dragon seal of the Emperor.',
      'When her elderly father unbuckled his rusted breastplate with shaking fingers, kneeling in obedience despite his crippled leg, Mulan understood that duty without sacrifice was only a word.'
    ],
    details: [
      { label: 'Imperial Court', value: 'Capital Decrees & Watchtowers' },
      { label: 'Architecture', value: 'ThreeUI Procedural Pagoda · China' },
      { label: 'Virtue', value: '忠 · Imperial Fealty & Sacrifice' },
      { label: 'Next Chapter', value: '03 — Borrowed Armor' }
    ]
  },
  'borrowed-armor': {
    id: 'borrowed-armor',
    number: '03',
    title: 'Borrowed Armor',
    hanzi: '借来的盔甲',
    theme: 'Night Departure · Armor · Identity · Disguise',
    duration: '21 min',
    image: '/landing-pages/secret-pathways-assets/mulan-03-borrowed-armor.jpg',
    synopsis:
      'Before sunrise, Mulan cuts her hair, takes her father’s armor, and rides into the unknown under a borrowed name.',
    leadQuote: 'With a single swordstroke, her hair fell to the stone floor. She rode into the rain alone.',
    bodyParagraphs: [
      'The night rain masked the creak of the stable latch. Dressed in laminated iron plates cut for a veteran twice her breadth, she cinched the leather cords tight enough to bruise her ribs.',
      'Taking up her father’s horse, she galloped toward the Yellow River camp. No longer Fa Mulan, she entered the muster ranks as Hua Ping—a soldier born of necessity and quiet steel.'
    ],
    details: [
      { label: 'Muster Point', value: 'Yellow River Encampment' },
      { label: 'Relic', value: 'The Ancestral Jian Sword' },
      { label: 'Virtue', value: '勇 · Dauntless Courage' },
      { label: 'Next Chapter', value: '04 — The Mountain' }
    ]
  },
  'the-mountain': {
    id: 'the-mountain',
    number: '04',
    title: 'The Mountain',
    hanzi: '雪山之战',
    theme: 'Snow · Battle · Strategy · Courage',
    duration: '17 min',
    image: '/landing-pages/secret-pathways-assets/mulan-04-mountain.jpg',
    synopsis:
      'At war, Mulan learns that courage is not only strength—sometimes survival belongs to the one who sees differently.',
    leadQuote: 'Between the jagged crags of the northern ridge, blizzard winds carry the roar of war.',
    bodyParagraphs: [
      'The mountain pass stood entombed in ice and suffocating wind. Outnumbered by the invading khaganate forces charging across the valley floor, brute force was certain extinction.',
      'Perceiving the snow cornice hanging fragile above the gorge, Mulan ignited the final fire-lance. The resulting avalanche buried the vanguard, proving that true martial wisdom lies in reading the landscape.'
    ],
    details: [
      { label: 'Battlefield', value: 'The High Northern Snow Pass' },
      { label: 'Weapon', value: 'The Fire Lance & Recurve Bow' },
      { label: 'Virtue', value: '智 · Tactical Wisdom' },
      { label: 'Next Chapter', value: '05 — Honor Without Disguise' }
    ]
  },
  'honor-without-disguise': {
    id: 'honor-without-disguise',
    number: '05',
    title: 'Honor Without Disguise',
    hanzi: '无伪之荣',
    theme: 'Capital · Lanterns · Truth · Identity · Return',
    duration: '22 min',
    image: '/landing-pages/secret-pathways-assets/mulan-05-honor.jpg',
    synopsis:
      'Her secret is revealed, yet Mulan returns to save the capital and prove that honor belongs to the truth, not the disguise.',
    leadQuote: 'Behind the armor is not another soldier, but a woman choosing her own name.',
    bodyParagraphs: [
      'Standing before the Vermilion Palace as fireworks split the imperial sky, the Emperor bowed his head before the daughter of Fa. The entire imperial guard sank to one knee.',
      'Refusing the chancellery and jewels of the court, she asked only for a swift steed to return home. The armor remained behind in the palace treasury; the honor was hers forever.'
    ],
    details: [
      { label: 'Imperial Palace', value: 'The Grand Vermilion Throne Room' },
      { label: 'Crown Gift', value: 'The Crest of the Emperor' },
      { label: 'Virtue', value: '诚 · Absolute Integrity & Truth' },
      { label: 'Next Chapter', value: 'Return to the Sanctuary' }
    ]
  }
};

export const CHAPTER_ORDER: ChapterId[] = [
  'before-the-armor',
  'the-summons',
  'borrowed-armor',
  'the-mountain',
  'honor-without-disguise'
];

interface ChapterExperienceModalProps {
  chapterId: ChapterId | null;
  onClose: () => void;
  onContinue: (nextChapterId: ChapterId | null) => void;
}

export function ChapterExperienceModal({
  chapterId,
  onClose,
  onContinue
}: ChapterExperienceModalProps) {
  const [stage, setStage] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (chapterId) {
      setIsClosing(false);
      setStage(1);
      const t1 = setTimeout(() => setStage(2), 150);
      const t2 = setTimeout(() => setStage(3), 350);
      const t3 = setTimeout(() => setStage(4), 550);

      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        document.body.style.overflow = origOverflow;
      };
    } else {
      setStage(0);
    }
  }, [chapterId]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400);
  }, [onClose]);

  const handleContinue = useCallback(() => {
    if (!chapterId) return;
    const currentIndex = CHAPTER_ORDER.indexOf(chapterId);
    const nextChapter =
      currentIndex >= 0 && currentIndex < CHAPTER_ORDER.length - 1
        ? CHAPTER_ORDER[currentIndex + 1]
        : null;

    setIsClosing(true);
    setTimeout(() => {
      onContinue(nextChapter);
      setIsClosing(false);
    }, 400);
  }, [chapterId, onContinue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  if (!chapterId && stage === 0) return null;

  // Chapter 01: Fullscreen cinematic story experience (not inside a modal card)
  if (chapterId === 'before-the-armor') {
    return (
      <Chapter01Experience
        isOpen={Boolean(chapterId === 'before-the-armor')}
        onClose={onClose}
        onContinue={() => onContinue('the-summons')}
      />
    );
  }

  // Chapter 02: Fullscreen ThreeUI Chinese pagoda landscape experience (not inside a modal card)
  if (chapterId === 'the-summons') {
    return (
      <Chapter02Experience
        isOpen={Boolean(chapterId === 'the-summons')}
        onClose={onClose}
        onContinue={() => onContinue('borrowed-armor')}
      />
    );
  }

  // Chapter 03: Fullscreen cinematic story experience (not inside a modal card)
  if (chapterId === 'borrowed-armor') {
    return (
      <Chapter03Experience
        isOpen={Boolean(chapterId === 'borrowed-armor')}
        onClose={onClose}
        onContinue={() => onContinue('the-mountain')}
      />
    );
  }

  const data = chapterId ? CHAPTERS_DATA[chapterId] : null;
  if (!data) return null;

  const currentIndex = CHAPTER_ORDER.indexOf(chapterId as ChapterId);
  const nextChapterId =
    currentIndex >= 0 && currentIndex < CHAPTER_ORDER.length - 1
      ? CHAPTER_ORDER[currentIndex + 1]
      : null;
  const nextChapterData = nextChapterId ? CHAPTERS_DATA[nextChapterId as ChapterId] : null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isClosing
          ? 'opacity-0 pointer-events-none'
          : stage >= 1
          ? 'opacity-100'
          : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={`Chapter ${data.number}: ${data.title}`}
    >
      {/* 1. Backdrop scrim - smooth dimming */}
      <div
        className={`absolute inset-0 bg-[#05070a]/94 backdrop-blur-md transition-opacity duration-700 ${
          stage >= 2 && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* 2. Top-Right Minimal Close Control (44px min touch target, accessible) */}
      <div
        className={`absolute top-5 right-5 sm:top-7 sm:right-7 z-50 transition-all duration-500 delay-200 ${
          stage >= 3 && !isClosing
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2'
        }`}
      >
        <button
          onClick={handleClose}
          className="group flex items-center gap-2 px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-full border border-[#dfe7e0]/25 bg-[#090d14]/85 backdrop-blur-md text-[#dfe7e0] text-xs font-mono uppercase tracking-widest hover:border-[#dfe7e0] hover:text-white hover:bg-[#121924] active:scale-95 transition-all cursor-pointer shadow-2xl"
          aria-label="Close chapter experience"
        >
          <span className="text-base leading-none text-[#ff826e] group-hover:rotate-90 transition-transform">
            ×
          </span>
          <span>CLOSE</span>
        </button>
      </div>

      {/* 3. Main Experience Window */}
      <div
        className={`relative z-40 w-full h-full flex flex-col items-center justify-between p-4 sm:p-8 md:p-12 overflow-y-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          stage >= 4 && !isClosing
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-[0.96] opacity-0 translate-y-4'
        }`}
      >
        {/* CHAPTERS 03 / 04 / 05: Reusable cinematic chapter transition shell */}
        <div className="relative w-full max-w-5xl my-auto rounded-2xl overflow-hidden border border-[#dfe7e0]/15 bg-[#080b10]/95 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.9)] flex flex-col">
          {/* Top Chapter Meta Bar */}
          <div className="px-6 sm:px-10 py-5 border-b border-[#dfe7e0]/10 flex flex-wrap items-center justify-between gap-4 bg-[#05070a]/80">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-[#e0231c]/20 border border-[#e0231c]/40 text-[#ff7360] font-mono text-xs font-bold tracking-widest">
                CHAPTER {data.number}
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-[#c9a24a]">
                {data.theme}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-[#dfe7e0]/60">
              <span>{data.duration}</span>
              <span>·</span>
              <span>{data.number} / 05</span>
            </div>
          </div>

          {/* Split Content: Hero Image + Story Narrative */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden">
              {/* Left Column: Visual Artwork */}
              <div className="md:col-span-5 relative min-h-[280px] md:min-h-[480px] overflow-hidden bg-[#040609]">
                <img
                  src={data.image}
                  alt={data.title}
                  className="w-full h-full object-cover object-center filter brightness-90 contrast-105 hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080b10] via-transparent to-transparent opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#080b10] opacity-40 hidden md:block" />

                <div className="absolute bottom-6 left-6 right-6 z-10">
                  <span className="text-3xl font-serif text-[#dfe7e0]/30 tracking-widest block mb-1">
                    {data.hanzi}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#f1eee8] uppercase">
                    {data.title}
                  </h2>
                </div>
              </div>

              {/* Right Column: Literary Passage & Field Notes */}
              <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between gap-6 bg-[#080b10]/95">
                <div>
                  <div className="mb-6 pb-4 border-b border-[#dfe7e0]/10">
                    <p className="text-sm sm:text-base font-serif italic text-[#c9a24a] leading-relaxed">
                      “{data.leadQuote}”
                    </p>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm text-[#c8d1ca] font-light leading-relaxed">
                    {data.bodyParagraphs.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>

                {/* Relic & Virtue Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#dfe7e0]/10">
                  {data.details.map((item, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#dfe7e0]/45">
                        {item.label}
                      </span>
                      <span className="text-xs text-[#f1eee8] font-medium tracking-wide">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Continue / Navigation Actions */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2.5 min-h-[44px] text-xs font-mono tracking-widest uppercase text-[#dfe7e0]/60 hover:text-white transition-colors cursor-pointer"
                  >
                    ← Return to Grid
                  </button>

                  <button
                    onClick={handleContinue}
                    className="group flex items-center gap-3 px-6 py-3 min-h-[44px] rounded-full border border-[#c9a24a]/60 bg-[#0c121b] text-[#f7df94] text-xs font-medium uppercase tracking-[0.2em] hover:border-[#f7df94] hover:bg-[#151f2e] hover:shadow-[0_0_24px_rgba(201,162,74,0.35)] active:scale-95 transition-all cursor-pointer"
                  >
                    <span>
                      {nextChapterData
                        ? `Continue: ${nextChapterData.number} ${nextChapterData.title}`
                        : 'Complete Chapter Journey →'}
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
