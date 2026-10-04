import { describe, expect, it } from 'vitest';

import {
  DEFAULT_RULES,
  generate,
  isHot,
  neighbours,
  pips,
  ROWS,
  type Board,
  type Rules,
  type Size,
} from './map';

// Deterministic stand-in for Math.random.
function seeded(seed = 1) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const SIZES: Size[] = ['standard', 'expanded'];
const RULE_KEYS = Object.keys(DEFAULT_RULES) as (keyof Rules)[];
const OFF = Object.fromEntries(RULE_KEYS.map((k) => [k, false])) as Rules;

const sorted = (ns: number[]) => [...ns].sort((a, b) => a - b);

const tally = <T>(items: T[]) => {
  const out: Record<string, number> = {};
  for (const item of items) out[String(item)] = (out[String(item)] ?? 0) + 1;
  return out;
};

const boards = (size: Size, rules: Rules, n: number, seed = 1) => {
  const random = seeded(seed);
  return Array.from({ length: n }, () => generate(size, rules, random));
};

// Every pair of touching tiles on a board, each pair once.
const pairs = ({ rows, tiles }: Board) =>
  neighbours(rows).flatMap((near, i) =>
    near.filter((j) => j > i).map((j) => [tiles[i], tiles[j]] as const)
  );

// The rules a board breaks, out of those switched on in `rules`.
function broken({ rows, tiles }: Board, rules: Rules) {
  const out: (keyof Rules)[] = [];
  const isRare = (n: number) => n === 2 || n === 12;
  for (const [a, b] of pairs({ rows, tiles })) {
    if (a.number && b.number) {
      if (isHot(a.number) && isHot(b.number)) out.push('hotApart');
      if (a.number === b.number) out.push('sameApart');
      if (isRare(a.number) && isRare(b.number)) out.push('rareApart');
    }
    if (a.resource === 'desert' && b.resource === 'desert') {
      out.push('desertsApart');
    }
  }
  neighbours(rows).forEach((near, i) => {
    const same = near.filter((j) => tiles[j].resource === tiles[i].resource);
    if (same.length > 1) out.push('noClumps');
  });
  return out.filter((rule) => rules[rule]);
}

describe('neighbours', () => {
  it('links the centre hex to its six neighbours', () => {
    // Standard board, middle row: index 9 is the centre tile.
    expect(sorted(neighbours(ROWS.standard)[9])).toEqual([4, 5, 8, 10, 13, 14]);
  });

  it('links each corner to three hexes', () => {
    const near = neighbours(ROWS.standard);
    expect(sorted(near[0])).toEqual([1, 3, 4]);
    expect(sorted(near[2])).toEqual([1, 5, 6]);
    expect(sorted(near[7])).toEqual([3, 8, 12]);
    expect(sorted(near[11])).toEqual([6, 10, 15]);
    expect(sorted(near[16])).toEqual([12, 13, 17]);
    expect(sorted(near[18])).toEqual([14, 15, 17]);
  });

  it('links across the widest row of the expanded board', () => {
    // Rows 3, 4, 5 come first, so the 6-tile row starts at index 12.
    const near = neighbours(ROWS.expanded);
    expect(sorted(near[12])).toEqual([7, 13, 18]);
    expect(sorted(near[14])).toEqual([8, 9, 13, 15, 19, 20]);
    expect(sorted(near[17])).toEqual([11, 16, 22]);
  });

  it.each(SIZES)('gives the %s board the right shape', (size) => {
    const near = neighbours(ROWS[size]);
    const count = ROWS[size].reduce((a, b) => a + b, 0);
    expect(near.length).toBe(count);

    // Inner tiles touch six others: all but the ends of the inner rows.
    const inner = ROWS[size].slice(1, -1).reduce((a, b) => a + b - 2, 0);
    expect(near.filter((n) => n.length === 6).length).toBe(inner);
    for (const n of near) {
      expect(n.length).toBeGreaterThanOrEqual(3);
      expect(new Set(n).size).toBe(n.length);
    }
  });

  it.each(SIZES)('is symmetric on the %s board', (size) => {
    const near = neighbours(ROWS[size]);
    near.forEach((js, i) => {
      expect(js).not.toContain(i);
      js.forEach((j) => expect(near[j]).toContain(i));
    });
  });
});

describe('generate', () => {
  it.each([
    ['standard', { wood: 4, brick: 3, wheat: 4, sheep: 4, ore: 3, desert: 1 }],
    ['expanded', { wood: 6, brick: 5, wheat: 6, sheep: 6, ore: 5, desert: 2 }],
  ] as const)('deals every %s tile', (size, counts) => {
    for (const board of boards(size, DEFAULT_RULES, 20)) {
      expect(board.rows).toEqual(ROWS[size]);
      expect(tally(board.tiles.map((t) => t.resource))).toEqual(counts);
    }
  });

  it.each([
    ['standard', 1, 2],
    ['expanded', 2, 3],
  ] as const)('deals every %s number token', (size, rare, other) => {
    for (const board of boards(size, DEFAULT_RULES, 20)) {
      const numbers = board.tiles.flatMap((t) => t.number ?? []);
      expect(tally(numbers)).toEqual({
        2: rare,
        12: rare,
        ...Object.fromEntries(
          [3, 4, 5, 6, 8, 9, 10, 11].map((n) => [n, other])
        ),
      });
    }
  });

  it('puts a number on every tile but the deserts', () => {
    for (const size of SIZES) {
      for (const board of boards(size, OFF, 20)) {
        for (const t of board.tiles) {
          expect(t.resource === 'desert').toBe(t.number === undefined);
        }
      }
    }
  });

  it('is repeatable with the same random numbers', () => {
    expect(generate('expanded', DEFAULT_RULES, seeded(5))).toEqual(
      generate('expanded', DEFAULT_RULES, seeded(5))
    );
  });

  it('deals a different board each time', () => {
    const seen = boards('standard', DEFAULT_RULES, 50).map((b) =>
      JSON.stringify(b.tiles)
    );
    expect(new Set(seen).size).toBe(50);
  });

  it('can put the desert on any tile', () => {
    const spots = new Set(
      boards('standard', DEFAULT_RULES, 300).map((b) =>
        b.tiles.findIndex((t) => t.resource === 'desert')
      )
    );
    expect(spots.size).toBe(19);
  });

  it('uses Math.random by default', () => {
    const board = generate('standard');
    expect(board.tiles.length).toBe(19);
    expect(broken(board, DEFAULT_RULES)).toEqual([]);
  });
});

describe('rules', () => {
  it('turns every rule on by default', () => {
    expect(RULE_KEYS.every((k) => DEFAULT_RULES[k])).toBe(true);
  });

  it.each(SIZES)('keeps every rule on the %s board', (size) => {
    for (const board of boards(size, DEFAULT_RULES, 100, 42)) {
      expect(broken(board, DEFAULT_RULES)).toEqual([]);
    }
  });

  it.each(RULE_KEYS)('keeps %s when it is the only rule on', (rule) => {
    const rules = { ...OFF, [rule]: true };
    for (const board of boards('expanded', rules, 100, 7)) {
      expect(broken(board, rules)).toEqual([]);
    }
  });

  // Random boards break each rule now and then once it is off, so the
  // passing checks above are down to the rule and not to luck.
  it.each(RULE_KEYS)('lets boards break %s when it is off', (rule) => {
    const rules = { ...DEFAULT_RULES, [rule]: false };
    const breaking = boards('expanded', rules, 300, 11).filter(
      (b) => broken(b, { ...OFF, [rule]: true }).length
    );
    expect(breaking.length).toBeGreaterThan(0);
  });

  it('lets two deserts touch under no clumps alone', () => {
    const rules = { ...OFF, noClumps: true };
    const touching = boards('expanded', rules, 300, 3).some(
      (b) => broken(b, { ...OFF, desertsApart: true }).length
    );
    expect(touching).toBe(true);
  });

  it('still deals a full board with every rule off', () => {
    for (const size of SIZES) {
      for (const board of boards(size, OFF, 20)) {
        expect(board.tiles.length).toBe(ROWS[size].reduce((a, b) => a + b));
      }
    }
  });
});

describe('number tokens', () => {
  it('counts the dots for each number', () => {
    expect([2, 3, 4, 5, 6, 8, 9, 10, 11, 12].map(pips)).toEqual([
      1, 2, 3, 4, 5, 5, 4, 3, 2, 1,
    ]);
  });

  it('marks only 6 and 8 as red', () => {
    expect([2, 3, 4, 5, 6, 8, 9, 10, 11, 12].filter(isHot)).toEqual([6, 8]);
  });
});
