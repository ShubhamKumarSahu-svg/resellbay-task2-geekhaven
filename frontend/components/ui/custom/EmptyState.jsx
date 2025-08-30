export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
