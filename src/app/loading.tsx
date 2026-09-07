export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-10 sm:px-6">
      <div className="h-3 w-32 rounded-full bg-ink/10" />
      <div className="mt-3 h-8 w-72 rounded-lg bg-ink/10" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-44 rounded-2xl bg-ink/5" />
        ))}
      </div>
    </div>
  );
}
