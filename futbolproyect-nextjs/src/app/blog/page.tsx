import type { Metadata } from "next";
import BlogIndexContent from "@/components/blog/BlogIndexContent";
import { blogPosts } from "@/data/blogPosts";

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
  return <BlogIndexContent posts={blogPosts} />;
}
