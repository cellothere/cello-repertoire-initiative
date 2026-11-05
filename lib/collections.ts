import type { DatabaseSlug } from './featured-databases';

/**
 * Words for each Featured Database's own page (/featured-databases/<slug>): the heading, a short introduction, and the
 * description search engines and link previews show.
 */
export const DATABASE_PAGES: Record<DatabaseSlug, { title: string; intro: string; description: string }> = {
  women: {
    title: 'Cello Music by Women Composers',
    intro: 'Cello music by women composers, past and present, at every level from first lessons to the concert stage.',
    description:
      'Search cello music by women composers by level, instrumentation and technique: solos, duets and pieces with piano, from beginner to professional.',
  },
  black: {
    title: 'Cello Music by Black Composers',
    intro: 'Cello music by Black composers, along with arrangements of spirituals, at every level from first lessons to the concert stage.',
    description:
      'Search cello music by Black composers and spiritual arrangements by level, instrumentation and technique, from beginner to professional.',
  },
  indigenous: {
    title: 'Cello Music by Indigenous Composers',
    intro: 'Cello music by Indigenous composers, including First Nations, Native American, Aboriginal and Pacific Indigenous artists.',
    description:
      'Search cello music by Indigenous composers by level, instrumentation and technique, from beginner pieces to concert works.',
  },
  queer: {
    title: 'Cello Music by Queer Composers',
    intro:
      'Cello music by LGBTQIA+ composers, past and present. Composers are included on the strength of their own words or a well-documented history.',
    description: 'Search cello music by LGBTQIA+ composers by level, instrumentation and technique, from beginner to professional.',
  },
  'disabled-neurodivergent': {
    title: 'Cello Music by Disabled & Neurodivergent Composers',
    intro:
      'Cello music by disabled and neurodivergent composers. Composers are included on the strength of their own words or a well-documented history.',
    description:
      'Search cello music by disabled and neurodivergent composers by level, instrumentation and technique, from beginner to professional.',
  },
  living: {
    title: 'Cello Music by Living Composers',
    intro: 'Cello music by composers working today, so you can bring new music to students and audiences and reach the composer directly.',
    description: 'Search cello music by living composers by level, instrumentation and technique, from beginner pieces to concert works.',
  },
  free: {
    title: 'Free Cello Sheet Music',
    intro:
      'Cello music you can download legally for free: public-domain works and pieces their composers give away. Whether a public-domain piece is free depends on your country.',
    description:
      'Free cello sheet music you can download legally: public-domain works and pieces shared by their composers, searchable by level and instrumentation.',
  },
};

/**
 * One-line summaries for each level's page (/cello-music/<level>), taken from the rubric in utils/modalLevelTexts.ts;
 * keep them in step if the rubric changes. The page also shows the full rubric.
 */
export const LEVEL_SUMMARIES: Record<string, string> = {
  'Early Beginner': 'Open strings and first finger in first position, simple rhythms in 2/4 or 4/4, and straight détaché bows.',
  Beginner: 'All four fingers in first position with no shifting, short slurs, bow retakes and simple string crossings.',
  'Late Beginner': 'Small extensions, early shifts to 2nd and 3rd position, vibrato, longer slurs, and dotted rhythms, triplets and 6/8.',
  'Early Intermediate': 'Regular shifting from 1st to 4th position, ornaments, first double stops, spiccato and longer legato lines.',
  Intermediate: 'Confident positions 1 to 4, first steps into 5th position and tenor clef, double stops and reliable spiccato.',
  'Late Intermediate':
    'Positions up to 7th with treble clef, early thumb position, double stops in thirds and sixths, and long phrases shaped with rubato.',
  'Early Advanced': 'Thumb position in full use, advanced double stops, ricochet and up-bow staccato, and cadenza-style freedom.',
  Advanced: 'The whole fingerboard, every bow stroke at any tempo, and large-scale works.',
  Professional: 'Concert repertoire that asks for complete command of the instrument and a personal interpretive voice.',
};
