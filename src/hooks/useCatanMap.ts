import { useState } from 'react';

export enum MAP_SIZE {
  STANDARD = 'Standard',
  EXPANDED = 'Expanded',
}

export interface MapSettings {
  size: MAP_SIZE;
}

type Resource = 'wood' | 'brick' | 'wheat' | 'sheep' | 'ore' | 'desert';

const RESOURCES: Resource[] = [
  'wood',
  'brick',
  'wheat',
  'sheep',
  'ore',
  'desert',
];

export interface ITile {
  resource: Resource;
  number?: number;
}

const ROW_LENGTHS = {
  STANDARD: [3, 4, 5, 4, 3],
  EXPANDED: [3, 4, 5, 6, 5, 4, 3],
};

interface useCatanMapInterface {
  generateMap: (mapSize: MAP_SIZE) => Promise<{
    tiles: ITile[];
    rows: number[];
  }>;
  loading: boolean;
}
const getResourceCounts = (mapSize: MAP_SIZE) => {
  if (mapSize === MAP_SIZE.STANDARD) {
    return {
      wood: 4,
      brick: 3,
      wheat: 4,
      sheep: 4,
      ore: 3,
      desert: 1,
    };
  }
  return {
    wood: 6,
    brick: 5,
    wheat: 6,
    sheep: 6,
    ore: 5,
    desert: 2,
  };
};

const generateResourceNumbers = (mapSize: MAP_SIZE) => {
  const baseNumbers = [2, 12];
  const additionalNumbers = mapSize === MAP_SIZE.STANDARD ? [] : [2, 12];
  const numbers = Array.from({ length: 9 }, (_, i) => i + 3);

  for (const i of numbers) {
    if (i !== 7) {
      baseNumbers.push(i, i);
      if (mapSize === MAP_SIZE.EXPANDED) {
        additionalNumbers.push(i);
      }
    }
  }

  return baseNumbers.concat(additionalNumbers);
};

const getAdjacentTilesIndexes = (index: number, rows: number[]): number[] => {
  const numRows = rows.length;

  const getRow = (idx: number) => {
    let rowStartIdx = 0;
    for (let i = 0; i < numRows; i++) {
      if (idx < rowStartIdx + rows[i]) {
        return i;
      }
      rowStartIdx += rows[i];
    }
    return -1;
  };

  const row = getRow(index);
  const isEvenRow = row % 2 === 0;

  const adjacentIndices = [];
  const possibleOffsets = isEvenRow
    ? [-1, 1, -rows[row], -rows[row] - 1, -rows[row] + 1, rows[row + 1]]
    : [-1, 1, rows[row - 1], -rows[row] + 1, rows[row], rows[row] + 1];

  for (const offset of possibleOffsets) {
    const adjIndex = index + offset;
    const adjRow = getRow(adjIndex);

    if (adjRow >= 0 && Math.abs(adjRow - row) <= 1) {
      adjacentIndices.push(adjIndex);
    }
  }

  return adjacentIndices;
};

const validateNumbers = (tiles: ITile[], rows: number[]): boolean => {
  for (const [i, tile] of tiles.entries()) {
    const currentNumber = tile.number;
    if (currentNumber === undefined) continue;

    const adjacentIndexes = getAdjacentTilesIndexes(i, rows);
    for (const adjIndex of adjacentIndexes) {
      const adjacentTile = tiles[adjIndex];
      if (
        adjacentTile &&
        (adjacentTile.number === currentNumber ||
          (currentNumber === 6 && adjacentTile.number === 8) ||
          (currentNumber === 8 && adjacentTile.number === 6) ||
          (currentNumber === 2 && adjacentTile.number === 12) ||
          (currentNumber === 12 && adjacentTile.number === 2))
      ) {
        return false;
      }
    }
  }

  return true;
};

const validateResources = (tiles: ITile[], rows: number[]): boolean => {
  const maxAdjacentSameResource = 1;
  for (const [i, tile] of tiles.entries()) {
    const currentResource = tile.resource;
    const adjacentIndexes = getAdjacentTilesIndexes(i, rows);
    let sameResourceCount = 0;

    for (const adjIndex of adjacentIndexes) {
      if (tiles[adjIndex] && tiles[adjIndex].resource === currentResource) {
        sameResourceCount += 1;
      }
    }

    if (sameResourceCount > maxAdjacentSameResource) {
      return false;
    }
  }

  return true;
};

export const useCatanMap = (): useCatanMapInterface => {
  const [loading, setLoading] = useState<boolean>(false);

  const generateMap = async (mapSize: MAP_SIZE) => {
    setLoading(true);
    const generate = () => {
      const rows =
        mapSize === MAP_SIZE.STANDARD
          ? [...ROW_LENGTHS.STANDARD]
          : [...ROW_LENGTHS.EXPANDED];

      const shuffle = <T>(array: T[]): T[] => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      };

      const resourceCounts = getResourceCounts(mapSize);
      let shuffledResources: Resource[];
      let tiles: ITile[];

      // Shuffle resources until a valid resource distribution is generated
      do {
        shuffledResources = shuffle(
          RESOURCES.flatMap((resource) =>
            Array.from({ length: resourceCounts[resource] }, () => resource)
          )
        );
        tiles = shuffledResources.map((resource) => ({ resource }));
      } while (!validateResources(tiles, rows));

      let shuffledNumbers = shuffle(generateResourceNumbers(mapSize));
      let numberIndex = 0;

      // Assign numbers to non-desert tiles
      tiles.forEach((tile) => {
        if (tile.resource !== 'desert') {
          tile.number = shuffledNumbers[numberIndex++];
        }
      });

      // Shuffle numbers until a valid number distribution is generated
      while (!validateNumbers(tiles, rows)) {
        numberIndex = 0;
        shuffledNumbers = shuffle(shuffledNumbers);
        tiles.forEach((tile) => {
          if (tile.resource !== 'desert') {
            tile.number = shuffledNumbers[numberIndex++];
          }
        });
      }

      return { tiles, rows };
    };
    const { tiles, rows } = await new Promise<{
      tiles: ITile[];
      rows: number[];
    }>((resolve) => {
      setTimeout(() => {
        resolve(generate());
      }, 0);
    });

    setLoading(false);
    return { tiles, rows };
  };

  return { generateMap, loading };
};
