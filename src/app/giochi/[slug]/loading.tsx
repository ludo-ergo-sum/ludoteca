export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="h-4 w-24 rounded-full bg-ink/10" />
        <div className="h-8 w-8 rounded-full bg-ink/10" />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-y border-dashed border-ink/15 py-3">
        <div className="h-5 w-40 rounded-full bg-ink/10" />
        <div className="h-9 w-36 rounded-full bg-ink/10" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-3xl bg-ink/5 p-6 sm:p-8 lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
            <div className="aspect-square rounded-2xl bg-ink/10" />
            <div>
              <div className="h-8 w-3/4 rounded-lg bg-ink/10" />
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-ink/10" />
                ))}
              </div>
              <div className="mt-5 h-4 w-2/3 rounded bg-ink/10" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-4 w-24 rounded bg-ink/10" />
          <div className="h-24 rounded-2xl bg-ink/5" />
        </div>

        <div className="space-y-5">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-ink/5" />
          ))}
        </div>
      </div>

      <div className="mt-10 border-t border-ink/10 pt-6">
        <div className="h-5 w-64 rounded bg-ink/10" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="h-16 rounded-xl bg-ink/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
