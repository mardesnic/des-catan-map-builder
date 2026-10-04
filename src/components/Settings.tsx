import type { Rules } from '../lib/map';

type Props = {
  rules: Rules;
  onChange: (rules: Rules) => void;
  onDone: () => void;
};

const RULES: { key: keyof Rules; label: string; note: string }[] = [
  {
    key: 'hotApart',
    label: '6 and 8 apart',
    note: 'The red numbers never touch.',
  },
  {
    key: 'sameApart',
    label: 'Matching numbers apart',
    note: 'The same number never sits on two touching tiles.',
  },
  {
    key: 'rareApart',
    label: '2 and 12 apart',
    note: 'The two rarest numbers never touch.',
  },
  {
    key: 'noClumps',
    label: 'No resource clumps',
    note: 'A tile touches at most one other tile of its kind.',
  },
  {
    key: 'desertsApart',
    label: 'Deserts apart',
    note: 'The two deserts on the 5–6 player board never touch.',
  },
];

export function Settings({ rules, onChange, onDone }: Props) {
  return (
    <>
      <section className='card'>
        <div className='card__head'>
          <h2>Board rules</h2>
          <span className='muted'>Used for the next shuffle</span>
        </div>
        {RULES.map(({ key, label, note }) => (
          <label key={key} className='check'>
            <input
              type='checkbox'
              checked={rules[key]}
              onChange={(e) => onChange({ ...rules, [key]: e.target.checked })}
            />
            <span>
              {label}
              <span className='muted'>{note}</span>
            </span>
          </label>
        ))}
      </section>

      <button className='button' onClick={onDone}>
        Done
      </button>
    </>
  );
}
