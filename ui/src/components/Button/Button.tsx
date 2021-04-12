import { CSSProperties, MouseEvent, ReactNode, useState } from "react";

interface ButtonProps {
  containerClassName?: string;
  hoverContent?: any;
  hoverStyle?: CSSProperties;
  onClick: (e: MouseEvent) => void;
  children: ReactNode;
}

export default function Button({
  containerClassName = "",
  hoverContent,
  hoverStyle,
  onClick,
  children,
}: ButtonProps) {
  const [isHover, setIsHover] = useState(false);

  const _onMouseEnter = () => setIsHover(true);
  const _onMouseLeave = () => setIsHover(false);

  const getChildrenClassName = () => {
    const transitionClass = hoverContent
      ? "transition-opacity duration-1000"
      : "";
    if (hoverContent && isHover) {
      return `${transitionClass} opacity-0`;
    } else if (isHover) {
      return "opacity-50";
    } else {
      return `${transitionClass} opacity-100`;
    }
  };

  return (
    <div
      className={`px-6 py-3 rounded-sm cursor-pointer ${containerClassName}`}
      style={isHover ? hoverStyle : undefined}
      onMouseEnter={_onMouseEnter}
      onMouseLeave={_onMouseLeave}
      onClick={onClick}
    >
      <span className="relative">
        {hoverContent && (
          <span
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isHover ? "opacity-100" : "opacity-0"
            }`}
          >
            {hoverContent}
          </span>
        )}
        <span className={getChildrenClassName()}>{children}</span>
      </span>
    </div>
  );
}
