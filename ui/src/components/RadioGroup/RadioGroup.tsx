import { ChangeEvent, memo } from "react";

interface RadioGroupProps {
  options: {
    id?: string;
    value: string;
    label: string;
    checked: boolean;
    onChange: (evt: ChangeEvent<HTMLInputElement>) => void;
  }[];
}

function RadioGroup({ options }: RadioGroupProps) {
  return (
    <div className="w-full">
      {options.map(({ value, label, checked, onChange }) => (
        <div
          key={value}
          className="flex my-1 text-left cursor-pointer hover:bg-gray-200"
        >
          <label className="w-full p-2 cursor-pointer">
            <input
              type="radio"
              value={value}
              checked={checked}
              onChange={onChange}
            />
            <span className="ml-2">{label}</span>
          </label>
        </div>
      ))}
    </div>
  );
}

export default memo(RadioGroup);
