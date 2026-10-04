import { useState } from 'react';

import { Segmented } from './components/Segmented';
import { Settings } from './components/Settings';
import {
  DEFAULT_RULES,
  generate,
  isHot,
  pips,
  type Board,
  type Rules,
  type Size,
} from './lib/map';
import { useStoredState } from './lib/use-stored-state';
import { useWakeLock } from './lib/use-wake-lock';

// The last board for each size, so switching size doesn't lose one.
type State = {
  size: Size;
  boards: Record<Size, Board>;
  rules: Rules;
};

const SIZES = [
  { value: 'standard' as const, label: '3–4 players' },
  { value: 'expanded' as const, label: '5–6 players' },
];

const initial: State = {
  size: 'standard',
  boards: { standard: generate('standard'), expanded: generate('expanded') },
  rules: DEFAULT_RULES,
};

export default function App() {
  const [state, setState] = useStoredState<State>('catan-map', initial);
  const [view, setView] = useState<'board' | 'settings'>('board');
  const { size, boards } = state;
  // Rules added later are missing from older saves, so fill in defaults.
  const rules = { ...DEFAULT_RULES, ...state.rules };
  // The board stays up for the whole game, so the screen should too.
  useWakeLock(true);

  const board = boards[size];

  const shuffle = () =>
    setState((s) => ({
      ...s,
      boards: { ...s.boards, [size]: generate(size, rules) },
    }));

  // Switching size keeps both boards as they were.
  const pickSize = (size: Size) => setState((s) => ({ ...s, size }));

  return (
    <main className='app'>
      <header className='header'>
        <h1>Catan Map</h1>
        <button
          className='icon-button'
          aria-label='Settings'
          aria-pressed={view === 'settings'}
          onClick={() => setView(view === 'board' ? 'settings' : 'board')}
        >
          <CogIcon />
        </button>
      </header>

      {view === 'settings' ? (
        <Settings
          rules={rules}
          onChange={(rules) => setState((s) => ({ ...s, rules }))}
          onDone={() => setView('board')}
        />
      ) : (
        <>
          <Segmented
            label='Board size'
            options={SIZES}
            value={size}
            onChange={pickSize}
          />

          <Map board={board} />

          <button className='button button--shuffle' onClick={shuffle}>
            Shuffle
          </button>
        </>
      )}

      <footer className='footer'>
        <span className='muted'>Unofficial, not affiliated with Catan.</span>
        <a href='https://github.com/mardesnic/des-catan-map-builder'>Source</a>
      </footer>
    </main>
  );
}

function Map({ board }: { board: Board }) {
  const { rows, tiles } = board;
  let i = 0;

  return (
    // Keyed on the board so every shuffle plays the deal animation.
    <section
      key={JSON.stringify(tiles)}
      className='board'
      style={{ '--cols': Math.max(...rows) } as React.CSSProperties}
    >
      {rows.map((length, r) => (
        <div key={r} className='board__row'>
          {Array.from({ length }, () => {
            const { resource, number } = tiles[i++];
            return (
              <div
                key={i}
                className='hex'
                style={{ '--i': i } as React.CSSProperties}
              >
                <img
                  className='hex__image'
                  src={`${import.meta.env.BASE_URL}assets/${resource}.png`}
                  alt={resource}
                />
                {number && (
                  <span
                    className={isHot(number) ? 'token token--hot' : 'token'}
                  >
                    {number}
                    <span className='token__pips'>
                      {'•'.repeat(pips(number))}
                    </span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}

function CogIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      width='22'
      height='22'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <circle cx='12' cy='12' r='3' />
      <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' />
    </svg>
  );
}
