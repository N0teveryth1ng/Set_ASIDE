export function BrandMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden
      className={className}
    >
      <rect x="4.5" y="8" width="15" height="11.5" rx="2.6" />
      <path d="M4.5 12.4h15" />
      <circle cx="12" cy="12.3" r="2.4" fill="currentColor" stroke="none" />
    </svg>
  );
}