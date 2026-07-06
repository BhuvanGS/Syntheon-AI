export function BetaOverMessage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card/60 p-8 sm:p-10 text-center">
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          The beta testing is over
        </h1>
        <p className="mt-5 text-base sm:text-lg text-muted-foreground font-sans leading-relaxed">
          Thanks for your feedback and support.
        </p>
        <p className="mt-2 text-base sm:text-lg text-muted-foreground font-sans leading-relaxed">
          We will be releasing the applications once we implement your feedbacks into our
          application.
        </p>
      </div>
    </div>
  );
}
