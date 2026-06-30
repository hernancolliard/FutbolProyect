import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/data/blogPosts";
import styles from "./blog.module.css";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className={styles.card}>
      <Link
        href={`/blog/${post.slug}`}
        className={styles.cardImage}
        aria-label={`Leer ${post.title}`}
      >
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
        />
        <span className={styles.category}>{post.category}</span>
      </Link>
      <div className={styles.cardBody}>
        <time dateTime={post.date}>{dateFormatter.format(new Date(post.date))}</time>
        <h2>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p>{post.description}</p>
        <Link href={`/blog/${post.slug}`} className={styles.textLink}>
          Leer artículo <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
