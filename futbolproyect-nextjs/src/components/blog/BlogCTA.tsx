import Link from "next/link";
import type { BlogPost } from "@/data/blogPosts";
import styles from "./blog.module.css";

export default function BlogCTA({ cta }: { cta: BlogPost["cta"] }) {
  return (
    <aside className={styles.cta}>
      <div>
        <span>Tu próximo paso</span>
        <h2>{cta.label}</h2>
        <p>{cta.description}</p>
      </div>
      <Link href={cta.href} className={styles.primaryButton}>
        {cta.label}
      </Link>
    </aside>
  );
}
