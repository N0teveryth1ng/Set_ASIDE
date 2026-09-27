export function BrandMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      aria-hidden
      className={className}
    >
      <path d="M17 7c-.5-2.6-3-4.2-5.6-4.2C8.6 2.8 6.6 4.8 6.6 7.3c0 3 3 3.7 5.4 4.6 3 1.1 4.5 2 4.5 4.8 0 2.4-2 4.3-4.8 4.4-1.9 0-4-1-5.4-3.1" />
    </svg>
  );
}