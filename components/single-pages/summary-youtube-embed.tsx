type SummaryYoutubeEmbedProps = {
  videoId: string;
  title: string;
};

export function SummaryYoutubeEmbed({ videoId, title }: SummaryYoutubeEmbedProps) {
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
      <iframe
        title={title}
        src={src}
        className="size-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
