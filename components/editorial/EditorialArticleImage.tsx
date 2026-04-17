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
    <figure className="my-8 overflow-hidden rounded-[1.75rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,244,239,0.94)_100%)] shadow-[0_18px_48px_rgba(0,0,0,0.06)]">
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
