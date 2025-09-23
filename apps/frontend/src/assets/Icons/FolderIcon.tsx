interface FolderIconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

const FolderIcon = ({ 
  width = 16, 
  height = 16, 
  color = "currentColor", 
  className = "" 
}: FolderIconProps) => {
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
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  );
};

export default FolderIcon;
