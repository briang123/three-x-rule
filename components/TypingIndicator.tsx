export function TypingIndicator() {
  return (
    <div className="flex space-x-1">
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}
