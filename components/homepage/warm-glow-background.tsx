export function WarmGlowBackground() {
  return (
    <div className="homepage-warm-glow" aria-hidden>
      <span className="homepage-warm-glow__core" />
      <span className="homepage-warm-glow__flicker homepage-warm-glow__flicker--first" />
      <span className="homepage-warm-glow__flicker homepage-warm-glow__flicker--second" />
      <span className="homepage-warm-glow__haze" />
    </div>
  );
}
