export type Size = 'standard' | 'expanded';

type Resource = 'wood' | 'brick' | 'wheat' | 'sheep' | 'ore' | 'desert';

type Tile = { resource: Resource; number?: number };

export type Board = { rows: number[]; tiles: Tile[] };

type Random = () => number;

// Tiles per row, top to bottom. Rows are centred, so each hex touches two
// in the row above and two in the row below.
export const ROWS: Record<Size, number[]> = {
  standard: [3, 4, 5, 4, 3],
  expanded: [3, 4, 5, 6, 5, 4, 3],
};

const RESOURCES: Record<Size, Record<Resource, number>> = {
  standard: { wood: 4, brick: 3, wheat: 4, sheep: 4, ore: 3, desert: 1 },
  expanded: { wood: 6, brick: 5, wheat: 6, sheep: 6, ore: 5, desert: 2 },
};

// Number tokens: 2 and 12 once, the rest twice in the base game. The 5–6
// player extension has two of 2 and 12 and three of everything else.
const NUMBERS: Record<Size, number[]> = {
  standard: [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12],
  expanded: [2, 2, 12, 12].concat(
    [3, 4, 5, 6, 8, 9, 10, 11].flatMap((n) => [n, n, n])
  ),
};

// Dots under the number: how many of the 36 dice combinations roll it.
export const pips = (n: number) => 6 - Math.abs(7 - n);

export const isHot = (n: number) => n === 6 || n === 8;

// For each tile, the indexes of the tiles touching it.
export function neighbours(rows: number[]): number[][] {
  const starts = rows.map((_, r) =>
    rows.slice(0, r).reduce((a, b) => a + b, 0)
  );
  const at = (r: number, c: number) =>
    r >= 0 && r < rows.length && c >= 0 && c < rows[r] ? starts[r] + c : -1;

  return rows.flatMap((len, r) =>
    Array.from({ length: len }, (_, c) => {
      // A longer row sits half a hex further left, so its columns shift by one.
      const up = rows[r - 1] > len ? c : c - 1;
      const down = rows[r + 1] > len ? c : c - 1;
      return [
        at(r, c - 1),
        at(r, c + 1),
        at(r - 1, up),
        at(r - 1, up + 1),
        at(r + 1, down),
        at(r + 1, down + 1),
      ].filter((i) => i >= 0);
    })
  );
}

// Fills tiles one at a time with a random item that `fits`, starting over
// when a tile has nothing left that fits. Quick for boards this size.
function place<T>(
  pool: T[],
  random: Random,
  fits: (placed: T[], item: T) => boolean
): T[] {
  for (;;) {
    const left = [...pool];
    const placed: T[] = [];
    while (left.length) {
      const options = left.filter((item) => fits(placed, item));
      if (!options.length) break;
      const item = options[Math.floor(random() * options.length)];
      left.splice(left.indexOf(item), 1);
      placed.push(item);
    }
    if (!left.length) return placed;
  }
}

// Placement rules. Only keeping the red numbers apart is in the official
// rules; the rest are common house rules for a fairer board.
export type Rules = {
  hotApart: boolean;
  sameApart: boolean;
  rareApart: boolean;
  noClumps: boolean;
  desertsApart: boolean;
};

export const DEFAULT_RULES: Rules = {
  hotApart: true,
  sameApart: true,
  rareApart: true,
  noClumps: true,
  desertsApart: true,
};

const isRare = (n: number) => n === 2 || n === 12;

const clash = (rules: Rules, a: number | undefined, b: number | undefined) =>
  a !== undefined &&
  b !== undefined &&
  ((rules.sameApart && a === b) ||
    (rules.hotApart && isHot(a) && isHot(b)) ||
    (rules.rareApart && isRare(a) && isRare(b)));

export function generate(
  size: Size,
  rules: Rules = DEFAULT_RULES,
  random: Random = Math.random
): Board {
  const rows = ROWS[size];
  const near = neighbours(rows);
  const same = (placed: Resource[], i: number, r: Resource) =>
    near[i].filter((j) => placed[j] === r).length;

  // How many tiles of its own kind a tile may touch. No clumps allows one.
  const limit = (r: Resource) =>
    r === 'desert' && rules.desertsApart ? 0 : rules.noClumps ? 1 : Infinity;

  const resources = place(
    Object.entries(RESOURCES[size]).flatMap(([r, n]) =>
      Array<Resource>(n).fill(r as Resource)
    ),
    random,
    (placed, r) => {
      const i = placed.length;
      return (
        same(placed, i, r) <= limit(r) &&
        near[i].every((j) => placed[j] !== r || same(placed, j, r) < limit(r))
      );
    }
  );

  const land = resources.flatMap((r, i) => (r === 'desert' ? [] : [i]));
  const numbers = place(NUMBERS[size], random, (placed, n) => {
    const i = land[placed.length];
    return near[i].every((j) => !clash(rules, n, placed[land.indexOf(j)]));
  });

  return {
    rows,
    tiles: resources.map((resource, i) => {
      const k = land.indexOf(i);
      return k < 0 ? { resource } : { resource, number: numbers[k] };
    }),
  };
}
