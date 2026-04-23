import { deriveSeed, createRng } from '../seed';
import { abandonmentFragments } from '../data/abandonment-fragments';

export interface AbandonmentDetail {
  readonly id: string;
  readonly label: string;
  readonly cssClass: string;
}

export function generateAbandonmentDetails(
  seed: string,
  era: { id: string; yearStart: number; yearEnd: number; [k: string]: unknown },
  _archetype: { id: string; [k: string]: unknown }, // eslint-disable-line @typescript-eslint/no-unused-vars
  _region: { id: string; tld: string; [k: string]: unknown }, // eslint-disable-line @typescript-eslint/no-unused-vars
): AbandonmentDetail[] {
  const rng = createRng(deriveSeed(seed, 'abandonment'));

  const compatible = abandonmentFragments.filter((f) =>
    f.compatibleEraIds.includes(era.id),
  );

  const count = rng.int(2, 5);
  const shuffled = rng.shuffle(compatible);
  const selected = shuffled.slice(0, count);

  return selected.map((fragment) => {
    let label = fragment.template;

    // Resolve {count} placeholder
    label = label.replace(/\{count\}/g, String(rng.int(127, 48_231)));

    // Resolve {staleYear} — a year that feels outdated relative to the era
    const staleYear = rng.int(era.yearStart, era.yearEnd);
    label = label.replace(/\{staleYear\}/g, String(staleYear));

    // Resolve {staleDate} — a plausible past date
    const month = rng.int(1, 12);
    const day = rng.int(1, 28);
    const dateYear = rng.int(era.yearStart, era.yearEnd);
    const staleDate = `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${dateYear}`;
    label = label.replace(/\{staleDate\}/g, staleDate);

    return {
      id: fragment.id,
      label,
      cssClass: fragment.cssClass,
    };
  });
}
