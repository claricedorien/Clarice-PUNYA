import React from 'react';
import { Story } from '../../data/stories';
import { ArrowLeft } from 'lucide-react';
import { cursorManager } from '../CustomCursor';
import { sound } from '../../utils/audio';

interface StoryTextOverlayProps {
  story: Story;
  storyProgress: number; // 0.0 to 1.0
  onExit: () => void;
}

interface StoryMoment {
  tag: string;
  headline: string;
  italicWord?: string;
  headlineEnd?: string;
  subtext: string;
  climax?: string;
  climaxSubtext?: string;
}

const STORY_MOMENTS: Record<string, StoryMoment[]> = {
  'story-01': [
    {
      tag: '23:47 // PLATFORM THREE',
      headline: 'A train arrived',
      italicWord: "that wasn't on the schedule.",
      subtext: 'Station Platform 3 · Midnight Fog',
    },
    {
      tag: 'STATION STATUS // TERMINATED',
      headline: 'The station',
      italicWord: 'had already closed.',
      subtext: 'No tannoy announcement. Only the cold iron shuddering.',
    },
    {
      tag: 'CARRIAGE DOOR RELEASE',
      headline: 'Nobody',
      italicWord: 'stepped out.',
      subtext: 'The pneumatic hiss settled into the quiet night air.',
    },
    {
      tag: 'THRESHOLD OF LIGHT',
      headline: 'For almost a minute,',
      italicWord: 'the doors remained open.',
      subtext: 'Golden interior lanterns spilled warm rectangles across the frosted ballast.',
    },
    {
      tag: 'DISTANT PRESENCE',
      headline: 'Then a girl appeared',
      italicWord: 'at the far end',
      headlineEnd: 'of the platform.',
      subtext: 'Her wool coat was dry despite the sleet.',
    },
    {
      tag: 'RECOGNITION',
      headline: 'She looked',
      italicWord: 'directly at me.',
      subtext: 'Across thirty yards of freezing mist.',
      climax: 'And smiled.',
      climaxSubtext: 'As if we had agreed to meet here sixty years ago.',
    },
  ],
  'story-02': [
    {
      tag: 'ACOUSTIC TAXONOMY',
      headline: 'Noah believed every rainstorm',
      italicWord: 'sounded different.',
      subtext: 'To his ears, precipitation was acoustic memory falling from the clouds.',
    },
    {
      tag: 'THE APOTHECARY VIALS',
      headline: 'So he began',
      italicWord: 'collecting them in glass.',
      subtext: 'Labeling each apothecary bottle with ink ground from chimney soot.',
    },
    {
      tag: 'SUMMER & DAWN',
      headline: 'Morning mist, August thunder,',
      italicWord: 'rain against hospital glass.',
      subtext: 'The heavy squall smelled of warm asphalt; the March drizzle of moss.',
    },
    {
      tag: 'THE UNRECORDED DAY',
      headline: 'Rain from the afternoon',
      italicWord: 'his mother forgot his name.',
      subtext: 'It had taken four hours to capture three ounces on the porch eaves.',
    },
    {
      tag: 'THE APOTHECARY FIGURE',
      headline: 'A boy standing by the eave,',
      italicWord: 'holding the sky',
      headlineEnd: 'in his hands.',
      subtext: 'The vials gently resonating with suspended rainfall.',
    },
    {
      tag: 'THE DROUGHT',
      headline: 'The village came to ask',
      italicWord: 'what clouds sounded like.',
      subtext: 'They did not ask for drinking water—only for the acoustic memory.',
      climax: 'And the rain began to rise.',
      climaxSubtext: 'Droplets ascending weightlessly into the heavens.',
    },
  ],
  'story-03': [
    {
      tag: '23:53 // GRID COLLAPSE',
      headline: 'At 11:53 PM, the entire city',
      italicWord: 'lost electricity.',
      subtext: 'Not with a siren, but like an exhale across forty square miles of concrete.',
    },
    {
      tag: 'SEVEN MINUTES',
      headline: 'Seven minutes remained',
      italicWord: 'before the new year.',
      subtext: 'Champagne glasses paused; record players ground to a slow halt.',
    },
    {
      tag: 'CASCADE OF DARKNESS',
      headline: 'One by one, the towers',
      italicWord: 'vanished into obsidian.',
      subtext: 'Skyscraper windows extinguishing block by block.',
    },
    {
      tag: 'CELESTIAL DAWN',
      headline: 'Humanity learned to look up',
      italicWord: 'at long-drowned stars.',
      subtext: 'Ten million windows went dark beneath the Milky Way.',
    },
    {
      tag: 'ROOFTOP SOLITUDE',
      headline: 'A solitary silhouette',
      italicWord: 'standing upon the spire.',
      subtext: 'Watching the metropolis yield to ancient silence.',
    },
    {
      tag: 'THE ARCHIVIST',
      headline: '“Time didn’t stop,”',
      italicWord: 'the old man wrote in ink.',
      subtext: 'In the high solitary 40th-floor tower.',
      climax: '“It simply ceased being measured.”',
      climaxSubtext: 'The final stroke of the pendulum was silence itself.',
    },
  ],
  'story-04': [
    {
      tag: 'BLUEPRINTS OF 1884',
      headline: 'The blueprints recorded twelve suites.',
      italicWord: 'The superintendent counted thirteen.',
      subtext: 'Between apartment 4B and 4C sat an ebon wood door without a number.',
    },
    {
      tag: 'THE UNLOCKED DOOR',
      headline: 'A door that was not on the map',
      italicWord: 'appeared every third Tuesday.',
      subtext: 'Polished brass knob without a keyhole.',
    },
    {
      tag: 'THE WARM INTERIOR',
      headline: 'Inside was a room filled with teacups',
      italicWord: 'that were still warm.',
      subtext: 'Dust motes floating in silent shafts of afternoon amber.',
    },
    {
      tag: 'WARMTH AT MIDNIGHT',
      headline: 'A sliver of golden light',
      italicWord: 'bled across the parquet.',
      subtext: 'A draft carrying the faint perfume of dried lavender.',
    },
    {
      tag: 'THE VELVET CURTAIN',
      headline: 'A passing shadow',
      italicWord: 'behind the curtain folds.',
      subtext: 'A velvet armchair bearing the faint indentation of someone just risen.',
    },
    {
      tag: 'TOMORROW’S CALENDAR',
      headline: 'The calendar on the wall',
      italicWord: 'always displayed tomorrow.',
      subtext: 'As if waiting for a guest who had not yet arrived.',
      climax: 'A quiet invitation to enter.',
      climaxSubtext: 'Some rooms exist only when you have forgotten what you were seeking.',
    },
  ],
  'story-05': [
    {
      tag: 'OCTOBER 14, 2086',
      headline: 'The postmark was dated',
      italicWord: 'sixty years in the future.',
      subtext: 'Delivered to my childhood mailbox at the end of the gravel lane.',
    },
    {
      tag: 'SYNTHETIC PARCHMENT',
      headline: 'Folded from synthetic cellulose',
      italicWord: 'that refused to burn.',
      subtext: 'Cool to the touch, carrying a faint scent of ozone and starlight.',
    },
    {
      tag: 'CHRONO CONDENSATION',
      headline: 'The ink was still damp',
      italicWord: 'with temporal condensation.',
      subtext: 'Thin cyan glyphs shifting slightly under direct inspection.',
    },
    {
      tag: 'THE WARNING',
      headline: '“Do not buy the house',
      italicWord: 'near the pine ridge.”',
      subtext: 'Precise coordinates marked in astronomical degrees.',
    },
    {
      tag: 'THE MESSENGER',
      headline: 'A silhouette emerging',
      italicWord: 'from the gravimetric rift.',
      subtext: 'Extending a glowing chronometer seal.',
    },
    {
      tag: 'CHRONOMETRIC SIGNATURE',
      headline: 'Written in my own distinctive,',
      italicWord: 'left-handed slant.',
      subtext: 'Signed with a flourish I have not yet learned to make.',
      climax: 'Signed by someone I have yet to become.',
      climaxSubtext: 'The future is already remembering what we are about to choose.',
    },
  ],
  'story-06': [
    {
      tag: 'SALINE MEMORY',
      headline: 'The fishermen never kept',
      italicWord: 'the conch shells.',
      subtext: 'If you held one to your ear, you did not hear the sea.',
    },
    {
      tag: 'THE DEEP TRENCHES',
      headline: 'They threw them back',
      italicWord: 'into the ocean abyss.',
      subtext: 'Afraid of what the deep trenches would whisper back.',
    },
    {
      tag: 'DROWNED VOICES',
      headline: 'You did not hear waves—',
      italicWord: 'you heard someone asking for their coat.',
      subtext: 'Voices from ships that sank two centuries ago.',
    },
    {
      tag: 'THE DISSOLVED PAST',
      headline: 'Water is the only element',
      italicWord: 'that refuses to forget.',
      subtext: 'Every memory that ever dissolved in it remains acoustic in the salt.',
    },
    {
      tag: 'THE SUBMERGED WITNESS',
      headline: 'A figure floating peacefully',
      italicWord: 'in the bioluminescent current.',
      subtext: 'Hair undulating like seagrass in the tidal swell.',
    },
    {
      tag: 'THE CONCH VITRINE',
      headline: 'Two centuries of voices',
      italicWord: 'preserved in saline glass.',
      subtext: 'Waiting for an ear gentle enough to listen.',
      climax: 'And the sea began to answer.',
      climaxSubtext: 'A single deep resonant pulse rising from the abyss.',
    },
  ],
};

export const StoryTextOverlay: React.FC<StoryTextOverlayProps> = ({
  story,
  storyProgress,
  onExit,
}) => {
  const p = Math.max(0, Math.min(1, storyProgress));

  // Retrieve moments for the selected story (or fallback to Last Train)
  const moments = STORY_MOMENTS[story.id] || STORY_MOMENTS['story-01'];

  // Helper function for smooth opacity curve
  const getRangeOpacity = (start: number, peakStart: number, peakEnd: number, end: number) => {
    if (p < start || p > end) return 0;
    if (p >= peakStart && p <= peakEnd) return 1;
    if (p < peakStart) return (p - start) / (peakStart - start);
    return (end - p) / (end - peakEnd);
  };

  // Chapter opacities based on progress brackets
  const opacities = [
    getRangeOpacity(0.00, 0.04, 0.12, 0.16),
    getRangeOpacity(0.16, 0.20, 0.28, 0.32),
    getRangeOpacity(0.32, 0.36, 0.44, 0.48),
    getRangeOpacity(0.48, 0.52, 0.60, 0.64),
    getRangeOpacity(0.64, 0.68, 0.78, 0.82),
    getRangeOpacity(0.82, 0.85, 0.94, 0.96),
  ];

  const endRecordOpacity = p >= 0.94 ? Math.min(1, (p - 0.94) / 0.04) : 0;
  const showedClimax = p >= 0.88;

  // Chapter 1 kinetic entry
  const ch1Y = p < 0.05 ? (0.05 - p) * 120 : 0;
  const ch1Scale = p > 0.10 ? Math.max(0.75, 1 - (p - 0.10) * 4) : 1;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none text-[#F1EEE8] overflow-hidden">
      {/* Top Reading Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 z-40">
        <div
          className="h-full bg-[#C9A66B] transition-all duration-75"
          style={{ width: `${p * 100}%` }}
        />
      </div>

      {/* Right Edge Scrollytelling Gauge */}
      <div className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-3 font-mono text-[10px] text-white/40 z-40">
        <span className="text-[#C9A66B]">
          {p < 0.16 ? 'ACT I' : p < 0.48 ? 'ACT II' : p < 0.82 ? 'ACT III' : 'FIN'}
        </span>
        <div className="relative w-[1px] h-28 bg-white/15">
          <div
            className="absolute top-0 left-0 w-full bg-[#C9A66B]"
            style={{ height: `${p * 100}%` }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C9A66B]"
            style={{ top: `${p * 100}%` }}
          />
        </div>
        <span>{Math.round(p * 100)}%</span>
      </div>

      {/* ================================================================
          MOMENTS 1 THROUGH 6 (DYNAMIC PER STORY)
          ================================================================ */}
      {moments.map((m, idx) => {
        const op = opacities[idx];
        if (op <= 0.01) return null;

        const isLeft = idx % 2 === 0;
        const isCenter = idx === 3 || idx === 5;

        return (
          <div
            key={idx}
            className={`absolute inset-0 flex flex-col justify-center px-8 sm:px-16 lg:px-24 transition-opacity duration-150 ${
              isCenter
                ? 'items-center text-center'
                : isLeft
                ? 'items-start text-left'
                : 'items-end text-right'
            }`}
            style={{
              opacity: op,
              transform:
                idx === 0
                  ? `translateY(${ch1Y}px) scale(${ch1Scale})`
                  : undefined,
              transformOrigin: isLeft ? 'left center' : 'right center',
            }}
          >
            <div className={`max-w-3xl space-y-4 ${isCenter ? 'mx-auto' : ''}`}>
              <div
                className="font-mono text-xs tracking-[0.35em] text-[#C9A66B] uppercase"
                style={{ color: story.accent }}
              >
                {m.tag}
              </div>

              <h2
                className="font-serif text-[#F1EEE8] font-light leading-[1.05] tracking-tight"
                style={{ fontSize: 'clamp(38px, 6vw, 96px)' }}
              >
                {m.headline} <br />
                {m.italicWord && (
                  <span className="italic" style={{ color: story.accent }}>
                    {m.italicWord}
                  </span>
                )}{' '}
                {m.headlineEnd}
              </h2>

              <p className="font-grotesk text-xs tracking-[0.2em] text-white/50 uppercase pt-2 max-w-xl">
                {m.subtext}
              </p>

              {/* Climax reveal in final moment */}
              {idx === 5 && showedClimax && m.climax && (
                <div className="animate-fadeIn pt-4 space-y-3">
                  <p
                    className="font-serif text-3xl sm:text-5xl italic"
                    style={{ color: story.accent }}
                  >
                    {m.climax}
                  </p>
                  {m.climaxSubtext && (
                    <p className="font-grotesk text-xs tracking-[0.2em] text-white/50 uppercase">
                      {m.climaxSubtext}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* ================================================================
          END OF RECORD (96% - 100%)
          ================================================================ */}
      {endRecordOpacity > 0.01 && (
        <div
          className="absolute inset-0 flex flex-col justify-between p-8 sm:p-16 lg:p-24 transition-opacity duration-150 pointer-events-none"
          style={{ opacity: endRecordOpacity }}
        >
          <div className="pt-16">
            <span
              className="font-mono text-xs tracking-[0.35em]"
              style={{ color: story.accent }}
            >
              {story.archiveId} // END OF RECORD
            </span>
          </div>

          <div className="my-auto max-w-2xl space-y-6">
            <h3 className="font-serif text-4xl sm:text-6xl text-[#F1EEE8] italic">
              “Every story leaves something behind.”
            </h3>
            <p className="font-grotesk text-xs tracking-[0.2em] text-white/60 uppercase">
              {story.title} · The Living Library
            </p>

            <div className="pt-4 pointer-events-auto">
              <button
                onPointerEnter={() => cursorManager.setMode('hover-nav')}
                onPointerLeave={() => cursorManager.setMode('default')}
                onClick={() => {
                  sound.playClick(320);
                  onExit();
                }}
                className="inline-flex items-center space-x-3 px-8 py-3.5 border border-[#C9A66B] bg-[#0B0B0B]/90 text-[#F1EEE8] hover:bg-[#C9A66B] hover:text-black transition-colors rounded-sm text-xs font-grotesk tracking-[0.25em] uppercase font-semibold"
                style={{ borderColor: story.accent }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>RETURN TO ARCHIVE</span>
              </button>
            </div>
          </div>

          <div className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase">
            THE LIVING LIBRARY // FULLSCREEN SCROLLYTELLING
          </div>
        </div>
      )}
    </div>
  );
};
