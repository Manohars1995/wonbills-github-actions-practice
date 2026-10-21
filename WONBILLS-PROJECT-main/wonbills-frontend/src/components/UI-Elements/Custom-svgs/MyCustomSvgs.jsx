export const SidebarToggleIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="16"
      rx="5"              // softer corners
      stroke="currentColor"
      strokeWidth="1.6"   // balanced for larger size
    />
    <line
      x1="9"
      y1="4"
      x2="9"
      y2="20"
      stroke="currentColor"
      strokeWidth="1.4"
    />
  </svg>
);