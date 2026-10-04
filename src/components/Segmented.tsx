type Props<T> = {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <div className='segmented' role='group' aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
