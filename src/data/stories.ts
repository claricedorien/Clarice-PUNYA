export interface StorySceneCue {
  text: string;
  subtext?: string;
  visualShift?: string;
  atmosphere?: string;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  archiveId: string;
  genre: string;
  readingTime: string;
  description: string;
  excerpt: string;
  accent: string;
  coverImage: string;
  visualTheme: 'train-mist' | 'rain-glass' | 'city-clock' | 'room-shadow' | 'chrono-parchment' | 'saline-sea';
  featured: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  sections: {
    number: string;
    heading: string;
    cues: StorySceneCue[];
  }[];
}

export const STORIES: Story[] = [
  {
    id: 'story-01',
    slug: 'the-last-train',
    archiveId: 'ARCHIVE_004',
    title: 'The Last Train',
    genre: 'Mystery',
    readingTime: '7 min',
    accent: '#C9A66B',
    coverImage: '/src/assets/images/artifact_last_train_1791291514107.jpg',
    visualTheme: 'train-mist',
    featured: true,
    position: [0.6, 0.0, 2.2],
    rotation: [0, -0.15, 0],
    description: 'A train arrives after midnight, even though the station has already closed.',
    excerpt: '23:47. A train arrived that wasn’t on the schedule. Nobody stepped out.',
    sections: [
      {
        number: '01',
        heading: 'The Unscheduled Arrival',
        cues: [
          {
            text: '23:47',
            subtext: 'Station Platform 3 — Cold iron rails shudder beneath the ballast.',
            visualShift: 'Deep silver mist thickens along the railway tracks.',
            atmosphere: 'Distantly, the low mechanical thrum of an idling diesel engine echoes.',
          },
          {
            text: 'A train arrived that wasn’t on the schedule.',
            subtext: 'No whistle. No announcement over the copper tannoy speakers.',
            visualShift: 'Fluorescent overhead lanterns flicker against the fog.',
          },
          {
            text: 'Nobody stepped out.',
            subtext: 'For almost a minute, the brass-rimmed carriage doors remained open to the frost.',
            visualShift: 'Fog rolls into the interior of the empty wooden carriages.',
          },
        ],
      },
      {
        number: '02',
        heading: 'The Figure on Platform Three',
        cues: [
          {
            text: 'Then a girl appeared at the far end of the platform.',
            subtext: 'She carried no luggage. Her coat was dry despite the sleet.',
            visualShift: 'A solitary lantern silhouette illuminates her outline.',
          },
          {
            text: 'She looked directly at me.',
            subtext: 'Her breath did not fog in the freezing autumn air.',
            visualShift: 'Amber signal lamps slowly turn to signal clear.',
          },
          {
            text: 'And smiled.',
            subtext: 'As if we had agreed to meet here sixty years ago.',
            visualShift: 'The rails vibrate as the doors begin to hiss closed.',
          },
        ],
      },
      {
        number: '03',
        heading: 'The Vanishing Signal',
        cues: [
          {
            text: 'When I stepped across the yellow threshold, the station behind me dissolved.',
            subtext: 'There were no ticket turnstiles. Only an unending corridor of dark varnished pine.',
            visualShift: 'The train platform yields to a twilight landscape rushing past glass.',
          },
          {
            text: '“Every line ends somewhere,” she whispered, handing me a brass token.',
            subtext: 'Stamped with today’s date, yet cold as cemetery stone.',
            visualShift: 'A soft amber lantern glows between our hands.',
          },
        ],
      },
    ],
  },
  {
    id: 'story-02',
    slug: 'the-boy-who-collected-rain',
    archiveId: 'ARCHIVE_002',
    title: 'The Boy Who Collected Rain',
    genre: 'Magical Realism',
    readingTime: '5 min',
    accent: '#8798A5',
    coverImage: '/src/assets/images/artifact_collected_rain_1791291536582.jpg',
    visualTheme: 'rain-glass',
    featured: true,
    position: [2.2, -0.4, -4.5],
    rotation: [0, -0.25, 0],
    description: 'Noah believed every rainstorm sounded different. So he kept each one inside small glass bottles.',
    excerpt: 'Noah believed every rainstorm sounded different. So he started collecting them.',
    sections: [
      {
        number: '01',
        heading: 'Acoustic Taxonomy of Clouds',
        cues: [
          {
            text: 'Noah believed every rainstorm sounded different.',
            subtext: 'To his ears, precipitation was not water—it was acoustic memory falling from the stratosphere.',
            visualShift: 'Delicate suspended droplets hover weightlessly in cool grey air.',
          },
          {
            text: 'So he started collecting them.',
            subtext: 'Labeling each apothecary vial with ink ground from chimney soot.',
            visualShift: 'Rows of slender glass phials emerge with soft caustics.',
          },
          {
            text: 'Summer rain. Morning rain. Rain against hospital windows.',
            subtext: 'The heavy August squall smelled of warm asphalt; the March drizzle whispered of moss.',
            visualShift: 'Rain ripples gently across dark reflective surfaces.',
          },
        ],
      },
      {
        number: '02',
        heading: 'The Forgotten Name',
        cues: [
          {
            text: 'Rain from the day his mother forgot his name.',
            subtext: 'It had taken four hours to capture three ounces on the porch eaves.',
            visualShift: 'A single teardrop-shaped glass bottle catches a soft cool beam of light.',
          },
          {
            text: 'He kept every storm inside a small glass bottle.',
            subtext: 'When uncorked, the room filled with the unmistakable rhythm of that forgotten afternoon.',
            visualShift: 'Microscopic mist particles scatter around the vial.',
          },
        ],
      },
      {
        number: '03',
        heading: 'The Sea in a Vial',
        cues: [
          {
            text: 'On the driest month of the hundred-year drought, the village came to his doorstep.',
            subtext: 'They did not ask for drinking water. They asked to remember what clouds sounded like.',
            visualShift: 'Soft rainfall rings resonate in sympathetic frequencies.',
          },
        ],
      },
    ],
  },
  {
    id: 'story-03',
    slug: 'seven-minutes-before-midnight',
    archiveId: 'ARCHIVE_007',
    title: 'Seven Minutes Before Midnight',
    genre: 'Drama',
    readingTime: '6 min',
    accent: '#E8E1D5',
    coverImage: '/src/assets/images/artifact_seven_minutes_1791291554858.jpg',
    visualTheme: 'city-clock',
    featured: true,
    position: [-0.4, 1.1, -12.0],
    rotation: [0, 0.12, 0],
    description: 'At 11:53 PM, the entire city lost electricity. Seven minutes remained before the new year.',
    excerpt: 'At 11:53 PM, the entire city lost electricity. Nobody knew the lights would never return.',
    sections: [
      {
        number: '01',
        heading: 'The Grid Collapses',
        cues: [
          {
            text: 'At 11:53 PM, the entire city lost electricity.',
            subtext: 'Not with a surge or siren, but like an exhale across forty square miles of concrete.',
            visualShift: 'Metropolitan apartment grids vanish one by one into stark obsidian silhouette.',
            atmosphere: 'A sudden, breathless hush settles across ten million windows.',
          },
          {
            text: 'Seven minutes remained before the new year.',
            subtext: 'Champagne glasses paused halfway to lips; record players ground to a slow chromatic halt.',
            visualShift: 'A faint ethereal clock face manifests against the skyline.',
          },
          {
            text: 'Nobody knew the lights would never return.',
            subtext: 'For in those seven minutes, humanity learned to look up at constellations long drowned by neon.',
            visualShift: 'The sky deepens into true astronomical darkness, revealing millions of stars.',
          },
        ],
      },
      {
        number: '02',
        heading: 'The Candle in the 40th Floor',
        cues: [
          {
            text: 'A solitary yellow flame flickered in the high tower of the central spire.',
            subtext: 'An archivist who had refused electric lamps forty years ago was still writing.',
            visualShift: 'A warm golden key light shines through a solitary square aperture.',
          },
          {
            text: '“Time didn’t stop,” he recorded in iron-gall ink. “It simply decided to stop being measured.”',
            subtext: 'The twelfth stroke of the pendulum was silence itself.',
            visualShift: 'Dust particles slowly descend through the cold urban air.',
          },
        ],
      },
    ],
  },
  {
    id: 'story-04',
    slug: 'the-forgotten-room',
    archiveId: 'ARCHIVE_009',
    title: 'The Forgotten Room',
    genre: 'Psychological',
    readingTime: '8 min',
    accent: '#C9A66B',
    coverImage: '/src/assets/images/artifact_forgotten_room_1791295174539.jpg',
    visualTheme: 'room-shadow',
    featured: false,
    position: [-2.8, -0.8, -18.5],
    rotation: [0, 0.22, 0],
    description: 'A door that was not on the architectural blueprints appears in the hallway every third Tuesday.',
    excerpt: 'The blueprints of 1884 recorded twelve suites. The superintendent counted thirteen.',
    sections: [
      {
        number: '01',
        heading: 'The Unmarked Keyhole',
        cues: [
          {
            text: 'The blueprints of 1884 recorded twelve suites. The superintendent counted thirteen.',
            subtext: 'Between apartment 4B and 4C sat an ebon wood door without a brass number.',
            visualShift: 'Architectural shadow planes shift in subtle perspective.',
          },
          {
            text: 'Inside was a room filled with tea cups that were still warm.',
            subtext: 'And a calendar hanging on the floral wallpaper that always displayed tomorrow.',
            visualShift: 'A sliver of golden light bleeds from beneath a dark jamb.',
          },
        ],
      },
    ],
  },
  {
    id: 'story-05',
    slug: 'a-letter-from-tomorrow',
    archiveId: 'ARCHIVE_013',
    title: 'A Letter from Tomorrow',
    genre: 'Science Fiction',
    readingTime: '5 min',
    accent: '#8798A5',
    coverImage: '/src/assets/images/artifact_letter_tomorrow_1791295221282.jpg',
    visualTheme: 'chrono-parchment',
    featured: false,
    position: [2.5, 0.5, -24.5],
    rotation: [0, -0.2, 0],
    description: 'The ink was still wet, but the date on the postmark was sixty years in the future.',
    excerpt: 'The postmark was dated October 14, 2086. It was delivered to my childhood mailbox.',
    sections: [
      {
        number: '01',
        heading: 'Chronological Mail',
        cues: [
          {
            text: 'The postmark was dated October 14, 2086.',
            subtext: 'The envelope was folded from synthetic cellulose that didn’t burn when held to a flame.',
            visualShift: 'Floating parchment shards orbit a quiet gravimetric eddy.',
          },
          {
            text: '“Do not buy the house near the pine ridge,” the handwriting instructed.',
            subtext: 'In my own distinctive, left-handed slant.',
            visualShift: 'A pale violet aurora sweeps through the archive geometry.',
          },
        ],
      },
    ],
  },
  {
    id: 'story-06',
    slug: 'the-sea-that-remembered',
    archiveId: 'ARCHIVE_018',
    title: 'The Sea That Remembered',
    genre: 'Mythology',
    readingTime: '6 min',
    accent: '#C9A66B',
    coverImage: '/src/assets/images/artifact_sea_remembered_1791295191891.jpg',
    visualTheme: 'saline-sea',
    featured: false,
    position: [0.0, -0.1, -32.5],
    rotation: [0, 0.0, 0],
    description: 'Every shell washed ashore echoed the voice of someone who had drowned two centuries ago.',
    excerpt: 'The fishermen never kept the conch shells. They threw them back into the deep trenches.',
    sections: [
      {
        number: '01',
        heading: 'Saline Acoustics',
        cues: [
          {
            text: 'The fishermen never kept the conch shells.',
            subtext: 'If you held one to your ear, you did not hear waves—you heard someone asking for their coat.',
            visualShift: 'Deep aquatic blue-grey caustics refract against basalt pedestals.',
          },
          {
            text: 'Water is the only element that refuses to forget what dissolved in it.',
            subtext: 'The archive contains one such shell, kept in a sealed glass vitrine.',
            visualShift: 'A rhythmic pulse of saline light illuminates the chamber.',
          },
        ],
      },
    ],
  },
];
