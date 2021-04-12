import { ChangeEvent } from "react";

interface CheckboxProps {
  label: string;
  isChecked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function Checkbox({
  label = "",
  isChecked = false,
  onChange,
}: CheckboxProps) {
  return (
    <div className="flex my-1 text-left cursor-pointer hover:bg-gray-200">
      <label className="w-full p-2 cursor-pointer">
        <input type="checkbox" checked={isChecked} onChange={onChange} />
        <span className="ml-2">{label}</span>
      </label>
    </div>
  );
}
