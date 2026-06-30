import type { BlogPost } from "@/data/blogPosts";
import BlogCard from "./BlogCard";
import styles from "./blog.module.css";

export default function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;

  return (
    <section className={styles.related} aria-labelledby="related-title">
      <div className={styles.sectionHeading}>
        <span>Seguí aprendiendo</span>
        <h2 id="related-title">Artículos relacionados</h2>
      </div>
      <div className={styles.relatedGrid}>
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
