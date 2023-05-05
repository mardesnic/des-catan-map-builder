import React, { useState, useEffect } from 'react';
import { ITile, MAP_SIZE, MapSettings } from '../../hooks/useCatanMap';
import { DEFAULT_SETTINGS } from '../../const';
import { Box, styled } from '@mui/system';
import { CircularProgress } from '@mui/material';

interface IMapContainer {
  mapsize: MAP_SIZE;
}

const MapContainer = styled(Box)<IMapContainer>(({ theme, mapsize }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridTemplateRows: `repeat(${mapsize === MAP_SIZE.STANDARD ? 5 : 6}, 1fr)`,
  justifyItems: 'center',
  position: 'relative',
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const Row = styled('div')(() => ({
  display: 'flex',
}));

const Tile = styled('div')({
  position: 'relative',
});

interface ITileImage {
  mapsize: MAP_SIZE;
}

const TileImage = styled('img')<ITileImage>(({ mapsize }) => ({
  display: 'block',
  marginTop: '-30%',
  width: 100,
  maxWidth: `${mapsize === MAP_SIZE.STANDARD ? 18.5 : 15.5}vw`,
}));

interface ITileNumber {
  number: number;
}
const TileNumber = styled('div')<ITileNumber>(({ theme, number }) => ({
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  color: number === 6 || number === 8 ? 'red' : theme.palette.primary.dark,
  background: theme.palette.secondary.main,
  border: `1px solid ${theme.palette.primary.dark}`,
  padding: theme.spacing(1.5),
  width: theme.spacing(1),
  height: theme.spacing(1),
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  fontWeight: 900,
}));

type Props = {
  settings: MapSettings;
  tiles: ITile[];
  rows: number[];
};

export const Map: React.FC<Props> = ({ settings, tiles, rows }) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const imagePaths = tiles.map((tile) => `assets/${tile.resource}.png`);
    const imagePromises = imagePaths.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.src = src;
        })
    );

    Promise.all(imagePromises).then(() => {
      setImagesLoaded(true);
    });
  }, [tiles]);

  if (!tiles.length || !rows.length || !imagesLoaded) {
    return (
      <Box
        display='flex'
        alignItems='center'
        justifyContent='center'
        width='100%'
      >
        <CircularProgress variant='indeterminate' disableShrink />
      </Box>
    );
  }

  let tileIndex = 0;

  return (
    <MapContainer mapsize={settings.size || DEFAULT_SETTINGS.size}>
      {rows.map((rowLength: number, rowIndex: number) => (
        <Row key={rowIndex}>
          {Array.from({ length: rowLength }, () => {
            const { resource, number } = tiles[tileIndex++];
            return (
              <Tile key={tileIndex}>
                {number && <TileNumber number={number}>{number}</TileNumber>}
                <TileImage
                  src={`assets/${resource}.png`}
                  alt={resource}
                  mapsize={settings.size || DEFAULT_SETTINGS.size}
                />
              </Tile>
            );
          })}
        </Row>
      ))}
    </MapContainer>
  );
};
