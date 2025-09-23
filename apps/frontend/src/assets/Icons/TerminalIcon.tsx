
interface TerminalIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const TerminalIcon: React.FC<TerminalIconProps> = ({ 
  width = 16, 
  height = 16, 
  color = "currentColor" 
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 24 24"
  >
    <g id="System / Terminal">
      <path
        id="Vector"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17 15h-5m-5-5 3 2.5L7 15m-4 .8V8.2c0-1.12 0-1.68.218-2.108.192-.377.497-.682.874-.874C4.52 5 5.08 5 6.2 5h11.6c1.12 0 1.68 0 2.107.218.377.192.683.497.875.874.218.427.218.987.218 2.105v7.606c0 1.118 0 1.677-.218 2.104a2 2 0 0 1-.875.875c-.427.218-.986.218-2.104.218H6.197c-1.118 0-1.678 0-2.105-.218a2 2 0 0 1-.874-.875C3 17.48 3 16.92 3 15.8"
      ></path>
    </g>
  </svg>
);

export default TerminalIcon;
