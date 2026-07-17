"use client";

import type { BlogPost } from "@/data/blogPosts";
import BlogCard from "./BlogCard";
import styles from "./blog.module.css";
import { useTranslation } from "react-i18next";

export default function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  const { t } = useTranslation("common");
  if (!posts.length) return null;

  return (
    <section className={styles.related} aria-labelledby="related-title">
      <div className={styles.sectionHeading}>
        <span>{t("blog_keep_learning")}</span>
        <h2 id="related-title">{t("blog_related_articles")}</h2>
      </div>
      <div className={styles.relatedGrid}>
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
