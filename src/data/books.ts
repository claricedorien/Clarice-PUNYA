export interface StoryChapter {
  id: string;
  title: string;
  subtitle: string;
  content: string[];
  interactiveType?: 'ember-spark' | 'clock-midnight' | 'vine-retract' | 'prism-light';
  interactivePrompt?: string;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  year: string;
  category: 'Fairy Tales' | 'Cosmic Odyssey' | 'Dark Fantasy' | 'Alchemical' | 'Mythology & Lore';
  readingTime: string;
  coverImage: string;
  accentColor: string;
  glowColor: string;
  synopsis: string;
  epigraph: string;
  position: [number, number, number]; // 3D coordinates in floating space
  rotation: [number, number, number]; // 3D resting orientation
  scale?: number;
  particlesType: 'gold-embers' | 'emerald-spores' | 'cyan-prism' | 'violet-stardust' | 'molten-basalt' | 'liquid-gold' | 'magenta-aurora';
  chapters: StoryChapter[];
}

export const BOOKS: Book[] = [
  {
    id: 'cinderella-midnight-echoes',
    slug: 'cinderella-midnight-echoes',
    title: 'Cinderella',
    subtitle: 'Midnight Echoes & The Cinders',
    author: 'Archivist of Sol',
    year: 'Anno 1697 · Resonant Edition',
    category: 'Fairy Tales',
    readingTime: '7 min read',
    coverImage: '/src/assets/images/cover_cinderella_midnight_1791264681027.jpg',
    accentColor: '#e2b45e',
    glowColor: '#ffd166',
    particlesType: 'gold-embers',
    position: [-1.8, 0.1, 0.6],
    rotation: [0.15, 0.35, -0.08],
    epigraph: '"Glass does not break when it remembers the heat that made it."',
    synopsis: 'Beneath chimney soot and fractured grandfather clocks, Cinderella whispers forgotten alchemical words to the hearth. At the twelfth stroke, her glass slippers will not merely fit—they will resonate with time itself, shattering the illusions of the royal court.',
    chapters: [
      {
        id: 'c1',
        title: 'Prologue: The Ashes & The Hearth',
        subtitle: 'Where soot conceals ancient gold',
        interactiveType: 'ember-spark',
        interactivePrompt: 'Click and drag across the hearth to awaken the slumbering embers',
        content: [
          'They called her Cinderella because she slept beside the hearth, where the dying embers coated her wrists in silver-grey ash. But what her sisters mistook for servitude was, in truth, an initiation.',
          'Fire leaves behind the purest essence of what was consumed. Every night, while the house slept beneath cold northern winds, she gathered the charred carbon and drew geometric circles on the flagstones.',
          'The cinders whispered in frequencies too low for human ears—the sound of molten glass settling, the rhythm of a clock whose pendulum swung between dimensions. When she pressed her palm to the chimney brick, the hearth replied with a warm, steady heartbeat.'
        ]
      },
      {
        id: 'c2',
        title: 'Chapter I: The Chrysalis of Midnight',
        subtitle: 'The alchemical coach and golden filament',
        interactiveType: 'clock-midnight',
        interactivePrompt: 'Drag the dial toward 12:00 to advance the clock and witness the midnight shift',
        content: [
          'No pumpkin was carved that night; rather, an organic spherical seed was placed in the soil of the courtyard and fed with starlight distilled in copper vats. In seconds, glowing golden vines coiled upward, weaving a carriage of hardened resin and spun glass.',
          'The Fairy Godmother was not a gentle maiden with a wand, but an ancient chronomancer wrapped in celestial silk. "Remember," she warned, her eyes reflecting constellations, "the enchantment is bound to planetary resonance. At the twelfth stroke, the harmonics collapse."',
          'Cinderella stepped into the crystalline chamber. The wheels did not turn on iron axles; they floated above cobblestones, leaving trails of bioluminescent dust in the midnight air.'
        ]
      },
      {
        id: 'c3',
        title: 'Chapter II: The Glass Resonance',
        subtitle: 'The slipper that never broke',
        interactiveType: 'prism-light',
        interactivePrompt: 'Calibrate the harmonic resonance frequency of the crystalline slipper',
        content: [
          'The grand ballroom fell utterly silent when she entered. The crystal chandeliers vibrated in sympathetic resonance with her footwear. They were not glass slippers forged in a mundane furnace, but crystallized hyper-silica, humming at precisely 432 Hertz.',
          'The Prince bowed, but Cinderella looked past him toward the colossal clock tower outside the stained-glass arches. The pendulum was slowing down. The twelfth stroke was not an expiration of magic, but its catalyst.',
          'When the bell struck midnight, she did not run out of fear. She left one slipper behind as an acoustic beacon—an invitation for anyone brave enough to tune their ears to the frequency of truth.'
        ]
      }
    ]
  },
  {
    id: 'sleeping-beauty-briar-slumber',
    slug: 'sleeping-beauty-briar-slumber',
    title: 'Sleeping Beauty',
    subtitle: 'The Briar Slumber & 100 Spores',
    author: 'The Chronicler of Brambles',
    year: 'Anno 1330 · Botanical Codex',
    category: 'Fairy Tales',
    readingTime: '8 min read',
    coverImage: '/src/assets/images/cover_briar_slumber_1791264695905.jpg',
    accentColor: '#34d399',
    glowColor: '#10b981',
    particlesType: 'emerald-spores',
    position: [1.9, 0.45, -0.1],
    rotation: [-0.12, -0.4, 0.05],
    epigraph: '"A century of silence is merely one deep breath for the roots."',
    synopsis: 'The spindle did not deliver death, but an ancient vegetative trance. As briars swallow the citadel walls in bioluminescent moss, a waking prince discovers the princess was never asleep—she was dreaming the entire kingdom into being.',
    chapters: [
      {
        id: 'b1',
        title: 'Prologue: The Needle & The Spore',
        subtitle: 'The puncture of eternal slumber',
        interactiveType: 'vine-retract',
        interactivePrompt: 'Hover and drag to part the century-old emerald thorns',
        content: [
          'The tower smelled of old cedar and dried rosemary. In the highest turret, where dust danced in shafts of twilight, sat the ancient spindle made of petrified black wood.',
          'Aurora did not prick her finger out of clumsy curiosity. She touched the spindle because it called her name in the voice of the primeval forest that existed before castles were carved from stone.',
          'The prick was instantaneous—a single crimson bead of blood blooming on her fingertip. But instead of fainting into darkness, her consciousness expanded outward into the soil, joining the root network of every oak in the realm.'
        ]
      },
      {
        id: 'b2',
        title: 'Chapter I: The Century of Vines',
        subtitle: 'How the castle was reclaimed by emerald silence',
        content: [
          'For one hundred years, the castle slept beneath an emerald canopy of thorns. Guard dogs paused mid-bark; guards frozen mid-stride; the banquet roast never spoiled upon its silver platter.',
          'Only the thorns moved. They grew with deliberate grace, interlacing across stone parapets, blooming with translucent night roses that emitted a pale phosphorescent glow.',
          'To the kingdom outside, the bramble forest was an impenetrable nightmare. But inside, it was a sanctuary of perfect preservation, suspended in timeless vegetative reverie.'
        ]
      }
    ]
  },
  {
    id: 'the-glass-rose',
    slug: 'the-glass-rose',
    title: 'The Glass Rose',
    subtitle: 'Echoes of Crystalline Petals',
    author: 'Vitreous Guild of Murano',
    year: 'Anno 1542 · Rare Folio',
    category: 'Mythology & Lore',
    readingTime: '6 min read',
    coverImage: '/src/assets/images/cover_glass_rose_1791264710243.jpg',
    accentColor: '#38bdf8',
    glowColor: '#0ea5e9',
    particlesType: 'cyan-prism',
    position: [-0.1, 1.45, -0.6],
    rotation: [0.25, 0.05, 0.12],
    epigraph: '"Fragility is an illusion; glass survives when iron turns to rust."',
    synopsis: 'Forged in the heart of an extinct silica crater, the Glass Rose blooms once every three celestial alignments. Each translucent petal traps a memory of those who dared gaze into its refracted prism depths.',
    chapters: [
      {
        id: 'gr1',
        title: 'Prologue: The Silica Bloom',
        subtitle: 'Born from lightning striking desert sand',
        interactiveType: 'prism-light',
        interactivePrompt: 'Adjust the prism angle to reveal hidden spectral spectrums',
        content: [
          'In the great white dunes where lightning strikes the quartz beds, there are fulgurites that take the shape of flowering stems. Over centuries, master glassblowers tried to replicate this impossible geometry.',
          'The Glass Rose was the only one that survived unbroken. Its petals were wafer-thin sheets of borosilicate crystal that could cut diamonds yet rang like silver bells in the desert wind.',
          'He who holds the stem can see backwards in time through the refractive index of its center core, watching ancient seas retreat from where sand now rolls.'
        ]
      }
    ]
  },
  {
    id: 'the-astral-voyager',
    slug: 'the-astral-voyager',
    title: 'The Astral Voyager',
    subtitle: 'Codex of the Stargate Pilgrims',
    author: 'Commander Vane of Horizon 9',
    year: 'Epoch 2840 · Deep Signal',
    category: 'Cosmic Odyssey',
    readingTime: '9 min read',
    coverImage: '/src/assets/images/cover_astral_voyager_1791264722803.jpg',
    accentColor: '#a855f7',
    glowColor: '#c084fc',
    particlesType: 'violet-stardust',
    position: [-2.6, -1.2, -0.9],
    rotation: [-0.2, 0.45, -0.15],
    epigraph: '"We did not leave Earth to escape our shadows, but to find where light begins."',
    synopsis: 'Beyond the Oort cloud lies the Ring of Silence. Drifting across dead planetary orbits, the lone pilot of Horizon 9 listens to radio telemetry broadcasts echoing backwards through warped spacetime.',
    chapters: [
      {
        id: 'av1',
        title: 'Log Entry 01: The Event Horizon Whispers',
        subtitle: 'Sub-light drift through the obsidian perimeter',
        content: [
          'Day 1,420 outside the heliosphere. The sun is now no larger than a brilliant diamond set into velvet.',
          'The vessel Horizon 9 glides without engine thrust. We are caught in the gravitational eddy of a dead neutron star. The hull creaks occasionally, like an old wooden galleon sailing uncharted waters.',
          'Telemetry tells me that signals received here were transmitted before the pyramids rose. Space is not an empty vacuum; it is an infinite tape recorder playing back every sigh of the universe.'
        ]
      }
    ]
  },
  {
    id: 'the-obsidian-chronicles',
    slug: 'the-obsidian-chronicles',
    title: 'The Obsidian Chronicles',
    subtitle: 'Monoliths of the Basalt Empire',
    author: 'Elder Scribe Malakor',
    year: 'The Fourth Ruin · Basalt Cycle',
    category: 'Dark Fantasy',
    readingTime: '8 min read',
    coverImage: '/src/assets/images/activetheory_cyberpunk_nightcity_1791206648033.jpg',
    accentColor: '#f97316',
    glowColor: '#fb923c',
    particlesType: 'molten-basalt',
    position: [2.3, -1.1, 0.3],
    rotation: [0.18, -0.3, -0.1],
    epigraph: '"What was carved in volcanic glass cannot be eroded by sorrow."',
    synopsis: 'Towering monolithic spires risen from tectonic rifts inscribed with glyphs of elder architects. An exploration of ancient subterranean libraries forged beneath rivers of molten stone.',
    chapters: [
      {
        id: 'oc1',
        title: 'Tome I: The Spires of Ebon',
        subtitle: 'When the mantle split open',
        content: [
          'Under the ash clouds of Mount Caelus, the obsidian spires stood impervious to weather. Carved from solid volcanic glass, their edges retained the razor sharpness of the hour they cooled.',
          'The scholars who entered the deep vaults wore gloves of woven dragon-hair so as not to slice their fingertips on the walls. Every corridor was an archive; every ceiling a ledger of lost stars.'
        ]
      }
    ]
  },
  {
    id: 'the-alchemists-mirror',
    slug: 'the-alchemists-mirror',
    title: 'The Alchemist’s Mirror',
    subtitle: 'Reflections of Quicksilver & Sol',
    author: 'Hermes Trismegistus Tertius',
    year: 'Anno 1494 · Quicksilver Folio',
    category: 'Alchemical',
    readingTime: '7 min read',
    coverImage: '/src/assets/images/activetheory_a24_green_knight_1791206617288.jpg',
    accentColor: '#eab308',
    glowColor: '#fde047',
    particlesType: 'liquid-gold',
    position: [-2.4, 1.35, -1.3],
    rotation: [0.3, 0.22, 0.18],
    epigraph: '"Look not for your face in quicksilver, but for the one who watches you gaze."',
    synopsis: 'Look not for your face in mercury, but for the unseen twin who breathes your mirrored air. The sacred manuscript detailing Master Flamel’s final experiments in metaphysical optical transmutations.',
    chapters: [
      {
        id: 'am1',
        title: 'Treatise I: The Silver Membrane',
        subtitle: 'The pool that does not wet the hand',
        content: [
          'Fill the shallow basalt basin with pure purified hydrargyrum. Do not stir it with iron; stir it only with a wand of cedar cut at the vernal equinox.',
          'When the surface is as flat as ice, lean over until your breath disturbs the metallic meniscus. The reflection you will see is not your current form, but the soul that inhabited you seven lifetimes prior.'
        ]
      }
    ]
  },
  {
    id: 'chronicles-of-nebula',
    slug: 'chronicles-of-nebula',
    title: 'Chronicles of Nebula',
    subtitle: 'Symphonies of the Stellar Tapestry',
    author: 'The Harmonic Guild of Orion',
    year: 'Solar Stanza 42',
    category: 'Cosmic Odyssey',
    readingTime: '10 min read',
    coverImage: '/src/assets/images/activetheory_spotify_trackid_1791206589464.jpg',
    accentColor: '#ec4899',
    glowColor: '#f472b6',
    particlesType: 'magenta-aurora',
    position: [2.7, 1.4, -1.2],
    rotation: [-0.15, -0.45, 0.2],
    epigraph: '"Stars do not die in silence; they sing in gamma rays across eternity."',
    synopsis: 'A sensory chronicle of deep-space acoustic frequencies, harmonic solar sails, and sentient star clusters that communicate across light years through ultraviolet polyphonic chords.',
    chapters: [
      {
        id: 'cn1',
        title: 'Canticle I: The Pulsar Choir',
        subtitle: 'When magnetars strike the cosmic drum',
        content: [
          'If the human ear could hear radio wavelengths, the night sky would not be quiet. It would roar like an orchestra of thunderous pipe organs playing in simultaneous counterpoint.',
          'The Vela pulsar beats eleven times per second—a cosmic metronome carved from the core of a collapsed giant. We built our starships to resonate in harmony with this rhythm, letting the galaxy itself propel our hulls.'
        ]
      }
    ]
  }
];

export const CATEGORIES = [
  'All Codices',
  'Fairy Tales',
  'Cosmic Odyssey',
  'Dark Fantasy',
  'Alchemical',
  'Mythology & Lore'
] as const;

export type CategoryFilter = (typeof CATEGORIES)[number];
