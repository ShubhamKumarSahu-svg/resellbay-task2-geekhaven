export function Skeleton({ className = '' }) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md ${className}`}
    />
  );
}
