"use client";

import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/data/blogPosts";
import styles from "./blog.module.css";
import { useTranslation } from "react-i18next";

export default function BlogCard({ post }: { post: BlogPost }) {
  const { t, i18n } = useTranslation("common");
  const keyPrefix = `blog_post_${post.slug}`;
  const title = t(`${keyPrefix}_title`, { defaultValue: post.title });
  const description = t(`${keyPrefix}_description`, { defaultValue: post.description });
  const category = t(`${keyPrefix}_category`, { defaultValue: post.category });
  const imageAlt = t(`${keyPrefix}_image_alt`, { defaultValue: post.imageAlt });
  const locale = i18n.language?.startsWith("en") ? "en-US" : "es-AR";
  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(post.date));
  return (
    <article className={styles.card}>
      <Link
        href={`/blog/${post.slug}`}
        className={styles.cardImage}
        aria-label={t("read_article_named", { title })}
      >
        <Image
          src={post.image}
          alt={imageAlt}
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
        />
        <span className={styles.category}>{category}</span>
      </Link>
      <div className={styles.cardBody}>
        <time dateTime={post.date}>{formattedDate}</time>
        <h2>
          <Link href={`/blog/${post.slug}`}>{title}</Link>
        </h2>
        <p>{description}</p>
        <Link href={`/blog/${post.slug}`} className={styles.textLink}>
          {t("read_article")} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
