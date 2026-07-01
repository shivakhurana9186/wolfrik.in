export function WolfMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 10l10 4 4-6 10 6 10-6 4 6 10-4-4 12 4 6-8 4-2 10-6 4-6-4-4 6-4-6-6 4-6-4-2-10-8-4 4-6L8 10zm18 20a3 3 0 100 6 3 3 0 000-6zm12 0a3 3 0 100 6 3 3 0 000-6zm-6 12l-3 4h6l-3-4z" />
    </svg>
  );
}
