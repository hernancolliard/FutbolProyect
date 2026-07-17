"use client";

import { useTranslation } from "react-i18next";
import type { BlogPost } from "@/data/blogPosts";
import BlogCard from "./BlogCard";
import BlogHero from "./BlogHero";
import styles from "./blog.module.css";

export default function BlogIndexContent({ posts }: { posts: BlogPost[] }) {
  const { t } = useTranslation("common");

  return (
    <>
      <BlogHero />
      <div className={styles.blogMain}>
        <section className={styles.container} aria-labelledby="latest-posts">
          <div className={styles.sectionHeading}>
            <span>{t("blog_practical_resources")}</span>
            <h2 id="latest-posts">{t("blog_latest_articles")}</h2>
          </div>
          <div className={styles.grid}>
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
