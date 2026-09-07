export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 py-10 sm:px-6">
      <div className="h-3 w-24 rounded-full bg-ink/10" />
      <div className="mt-2 h-8 w-56 rounded-lg bg-ink/10" />
      <div className="mt-2 h-4 w-72 rounded bg-ink/10" />

      <div className="mt-7 h-40 rounded-2xl bg-ink/5" />

      <div className="mt-10">
        <div className="flex items-center gap-4 border-b border-ink/10 pb-3">
          <div className="h-4 w-32 rounded bg-ink/10" />
          <div className="h-4 w-20 rounded bg-ink/10" />
        </div>
        <div className="mt-5 space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-16 rounded-xl bg-ink/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
