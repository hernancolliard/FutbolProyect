import type { Metadata } from "next";
import BlogCard from "@/components/blog/BlogCard";
import BlogHero from "@/components/blog/BlogHero";
import { blogPosts } from "@/data/blogPosts";
import styles from "@/components/blog/blog.module.css";

export const metadata: Metadata = {
  title: { absolute: "Blog de fútbol para jugadores y clubes | FutbolProyect" },
  description:
    "Guías y recursos sobre perfiles de jugadores, CV deportivo, búsqueda de clubes, scouting y análisis de datos en fútbol.",
  keywords: [
    "blog de fútbol",
    "conseguir club de fútbol",
    "CV deportivo",
    "scouting",
    "análisis de fútbol",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: "/blog",
    title: "Blog FutbolProyect",
    description:
      "Guías, consejos y recursos para jugadores, clubes, scouts y profesionales del fútbol.",
    images: [
      {
        url: "/images/home-hero-stadium.webp",
        alt: "Blog FutbolProyect",
      },
    ],
  },
};

export default function BlogPage() {
  return (
    <>
      <BlogHero />
      <div className={styles.blogMain}>
        <section className={styles.container} aria-labelledby="latest-posts">
          <div className={styles.sectionHeading}>
            <span>Recursos prácticos</span>
            <h2 id="latest-posts">Últimos artículos</h2>
          </div>
          <div className={styles.grid}>
            {blogPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
