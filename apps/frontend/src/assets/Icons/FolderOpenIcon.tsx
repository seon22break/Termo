interface FolderOpenIconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

const FolderOpenIcon = ({ 
  width = 16, 
  height = 16, 
  color = "currentColor", 
  className = "" 
}: FolderOpenIconProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 7.5L4.21 16.89a2 2 0 001.85 1.11h11.88a2 2 0 001.85-1.11L22 7.5" />
      <path d="M2 7.5h20v-2a2 2 0 00-2-2h-5.5l-2-3H4a2 2 0 00-2 2v5z" />
    </svg>
  );
};

export default FolderOpenIcon;
