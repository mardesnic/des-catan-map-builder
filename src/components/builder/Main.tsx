import React, { useEffect, useState } from 'react';
import { Setup } from './Setup';
import { Map } from './Map';
import { DEFAULT_SETTINGS, LOCAL_STORAGE_KEY } from '../../const';
import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from '../../utils/functions';
import { Navbar } from '../layout/Navbar';
import { ITile, MapSettings, useCatanMap } from '../../hooks/useCatanMap';
import { Box } from '@mui/system';
import { CircularProgress } from '@mui/material';

export const Main: React.FC = () => {
  const { generateMap, loading } = useCatanMap();
  const [settings, setSettings] = useState<MapSettings>(
    loadFromLocalStorage(LOCAL_STORAGE_KEY, DEFAULT_SETTINGS)
  );
  const [tiles, setTiles] = useState<ITile[]>();
  const [rows, setRows] = useState<number[]>();

  useEffect(() => {
    handleStart(loadFromLocalStorage(LOCAL_STORAGE_KEY, DEFAULT_SETTINGS));
  }, []);

  useEffect(() => {
    saveToLocalStorage(LOCAL_STORAGE_KEY, settings);
  }, [settings]);

  const handleStart = async (settings: MapSettings) => {
    setSettings(settings);
    const { tiles, rows } = await generateMap(settings.size);
    setRows(rows);
    setTiles(tiles);
  };

  return (
    <>
      <Navbar />
      <Setup onSubmit={handleStart} settings={settings} />
      {loading && (
        <Box
          display='flex'
          alignItems='center'
          justifyContent='center'
          width='100%'
        >
          <CircularProgress variant='indeterminate' disableShrink />
        </Box>
      )}
      {!loading && tiles && rows && (
        <Map settings={settings} tiles={tiles} rows={rows} />
      )}
    </>
  );
};
