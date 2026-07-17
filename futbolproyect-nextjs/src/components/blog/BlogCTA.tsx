"use client";

import Link from "next/link";
import type { BlogPost } from "@/data/blogPosts";
import styles from "./blog.module.css";
import { useTranslation } from "react-i18next";

export default function BlogCTA({ cta }: { cta: BlogPost["cta"] }) {
  const { t } = useTranslation("common");
  const ctaKeyByHref: Record<string, { label: string; description: string }> = {
    "/register": { label: "blog_cta_register_label", description: "blog_cta_register_text" },
    "/create-offer": { label: "blog_cta_publish_label", description: "blog_cta_publish_text" },
    "/ofertas/analistas-de-futbol": { label: "blog_cta_analyst_label", description: "blog_cta_analyst_text" },
  };
  const translated = ctaKeyByHref[cta.href];
  const label = translated ? t(translated.label) : cta.label;
  const description = translated ? t(translated.description) : cta.description;
  return (
    <aside className={styles.cta}>
      <div>
        <span>{t("blog_next_step")}</span>
        <h2>{label}</h2>
        <p>{description}</p>
      </div>
      <Link href={cta.href} className={styles.primaryButton}>
        {label}
      </Link>
    </aside>
  );
}
