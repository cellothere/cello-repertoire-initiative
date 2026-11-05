// The level-and-instrumentation illustrations used on piece cards and in share images.

/** Pick an illustration matching the piece's level and instrumentation. */
export function pieceIllustration(level: string, instrumentation: string[]): string {
  const parts = instrumentation.map((part) => part.toLowerCase());
  const has = (name: string) => parts.includes(name);
  const allCello = parts.length > 0 && parts.every((part) => part === 'cello' || part === 'cello solo');
  const isSolo = parts.length === 1 && allCello;
  const isDuet = parts.length === 2 && allCello;
  const isEnsemble = has('cello ensemble') || (parts.length >= 3 && allCello);
  const withPiano = has('cello') && has('piano');
  const withOrchestra = has('cello') && has('orchestra');

  if (has('cello') && has('saxophone')) return '/assets/cello_saxophone.png';
  if (isEnsemble) return '/assets/various_cello_ensemble.png';

  switch (level.toLowerCase()) {
    case 'professional':
      if (isDuet) return '/assets/professional_duet.png';
      if (isSolo) return '/assets/professional_cello_solo.png';
      if (withOrchestra) return '/assets/professional_cello_orchestra.png';
      return '/assets/professional_cello_piano.png';
    case 'beginner':
      if (withPiano) return '/assets/beginner_cello_and_piano.png';
      if (isDuet) return '/assets/beginner_duet.png';
      if (isSolo) return '/assets/beginner_solo.png';
      break;
    case 'late beginner':
      if (isDuet) return '/assets/late_beginner_duet.png';
      if (withPiano) return '/assets/late_beginner_cello_piano.png';
      if (isSolo) return '/assets/late_beginner_solo.png';
      break;
    case 'early intermediate':
      if (isDuet) return '/assets/early_intermediate_duet.png';
      if (isSolo) return '/assets/early_intermediate_solo.png';
      if (withPiano) return '/assets/early_intermediate_cello_piano.png';
      break;
    case 'intermediate':
      if (isDuet) return '/assets/intermediate_duet.png';
      if (withPiano) return '/assets/intermediate_cello_piano.png';
      if (isSolo) return '/assets/intermediate_solo.png';
      break;
    case 'late intermediate':
      if (isSolo) return '/assets/late_intermediate_solo.png';
      if (withPiano) return '/assets/late_intermediate_cello_piano.png';
      break;
    case 'early advanced':
      if (isDuet) return '/assets/early_advanced_duet.png';
      if (withPiano) return '/assets/early_advanced_cello_piano.png';
      return '/assets/early_advanced_cello.png';
    case 'advanced':
      if (withPiano) return '/assets/advanced_cello_piano.png';
      if (isDuet) return '/assets/advanced_duet.png';
      return '/assets/advanced_cello_solo.png';
    case 'early beginner':
      if (isSolo) return '/assets/early_beginner_cello_solo.png';
      break;
    case 'various':
      if (withPiano) return '/assets/various_cello_piano.png';
      if (isSolo) return '/assets/various_cello.png';
      break;
  }

  if (isDuet) return '/assets/early_beginner_duet.png';
  if (withPiano) return '/assets/early_beginner_cello_piano.png';
  return '/assets/default_cello_and_piano.png';
}
