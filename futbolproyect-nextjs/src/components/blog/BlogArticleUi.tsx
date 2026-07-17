"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import styles from "./blog.module.css";
import type { BlogPost } from "@/data/blogPosts";

export function BlogArticleHeader({ post }: { post: BlogPost }) {
  const { t } = useTranslation("common");
  const keyPrefix = `blog_post_${post.slug}`;
  const title = t(`${keyPrefix}_title`, { defaultValue: post.title });
  const description = t(`${keyPrefix}_description`, { defaultValue: post.description });
  const category = t(`${keyPrefix}_category`, { defaultValue: post.category });

  return (
    <header className={styles.articleHeader}>
      <div className={styles.container}>
        <BlogBreadcrumbs category={category} />
        <span className={styles.articleEyebrow}>{category}</span>
        <h1>{title}</h1>
        <p className={styles.articleDescription}>{description}</p>
        <BlogArticleMeta author={post.author} date={post.date} />
      </div>
    </header>
  );
}

export function BlogBreadcrumbs({ category }: { category: string }) {
  const { t } = useTranslation("common");
  return (
    <nav className={styles.breadcrumbs} aria-label={t("breadcrumbs")}>
      <Link href="/">{t("home")}</Link>
      <span aria-hidden="true">/</span>
      <Link href="/blog">Blog</Link>
      <span aria-hidden="true">/</span>
      <span>{category}</span>
    </nav>
  );
}

export function BlogArticleMeta({ author, date }: { author: string; date: string }) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language?.startsWith("en") ? "en-US" : "es-AR";
  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));

  return (
    <div className={styles.articleMeta}>
      <span>{t("written_by", { author })}</span>
      <time dateTime={date}>{formattedDate}</time>
    </div>
  );
}

export function BlogSidebar() {
  const { t } = useTranslation("common");
  return (
    <aside className={styles.sidebar} aria-label={t("useful_links")}>
      <strong>{t("also_on_futbolproyect")}</strong>
      <Link href="/register">{t("create_player_profile")}</Link>
      <Link href="/all-offers">{t("view_all_offers")}</Link>
      <Link href="/create-offer">{t("publish_offer")}</Link>
      <Link href="/">{t("go_home")}</Link>
    </aside>
  );
}
