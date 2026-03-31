import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  priority?: boolean;
};

/** Editorial hero / inline figures with required alt text for image SEO. */
export default function EditorialArticleImage({ src, alt, width, height, caption, priority }: Props) {
  return (
    <figure className="my-8 overflow-hidden rounded-card border border-[rgb(var(--border-soft))] bg-subtle/30 shadow-soft">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-auto w-full object-cover"
        sizes="(max-width: 768px) 100vw, 720px"
        priority={priority}
      />
      {caption ? (
        <figcaption className="border-t border-[rgb(var(--border-soft))] px-4 py-3 text-sm text-[rgb(var(--text-muted))]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
