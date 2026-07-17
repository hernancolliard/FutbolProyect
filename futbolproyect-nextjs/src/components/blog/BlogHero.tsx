"use client";

import { useTranslation } from "react-i18next";
import styles from "./blog.module.css";

export default function BlogHero() {
  const { t } = useTranslation("common");
  return (
    <header className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.container}>
        <span className={styles.eyebrow}>{t("blog_hero_eyebrow")}</span>
        <h1>Blog FutbolProyect</h1>
        <p>{t("blog_hero_text")}</p>
      </div>
    </header>
  );
}
