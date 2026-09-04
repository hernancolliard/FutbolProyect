import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import BlogCTA from "@/components/blog/BlogCTA";
import RelatedPosts from "@/components/blog/RelatedPosts";
import { BlogArticleHeader, BlogSidebar } from "@/components/blog/BlogArticleUi";
import { blogPosts, getBlogPost } from "@/data/blogPosts";
import styles from "@/components/blog/blog.module.css";

type PageProps = {
  params: { slug: string };
};

const BASE_URL = "https://www.futbolproyect.com";
const toArgentinaDateTime = (date: string) =>
  date.includes("T") ? date : `${date}T09:00:00-03:00`;
export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return {};

  const canonical = `/blog/${post.slug}`;
  return {
    title: { absolute: `${post.seoTitle} | FutbolProyect` },
    description: post.seoDescription,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: post.seoTitle,
      description: post.seoDescription,
      publishedTime: toArgentinaDateTime(post.date),
      modifiedTime: post.modifiedDate
        ? toArgentinaDateTime(post.modifiedDate)
        : undefined,
      authors: [post.author],
      section: post.category,
      images: [{ url: post.image, alt: post.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle,
      description: post.seoDescription,
      images: [post.image],
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const relatedPosts = post.relatedSlugs
    .map((slug) => getBlogPost(slug))
    .filter((related): related is NonNullable<typeof related> => Boolean(related));

  const articleUrl = `${BASE_URL}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${articleUrl}#article`,
    url: articleUrl,
    headline: post.title,
    description: post.seoDescription,
    image: [`${BASE_URL}${post.image}`],
    datePublished: toArgentinaDateTime(post.date),
    dateModified: post.modifiedDate
      ? toArgentinaDateTime(post.modifiedDate)
      : undefined,
    inLanguage: "es",
    author: {
      "@type": "Organization",
      name: post.author,
      url: post.authorUrl || BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "FutbolProyect",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/images/logos/logofpazul.webp`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    articleSection: post.category,
    keywords: post.keywords.join(", "),
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <BlogArticleHeader post={post} />

      <div className={styles.articleBody}>
        <div className={styles.container}>
          <div className={styles.articleImage}>
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1180px"
            />
          </div>

          <div className={styles.articleLayout}>
            <div className={styles.articleContent}>
              {post.content.map((section) => (
                <section key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.subheading && <h3>{section.subheading}</h3>}
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets && (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            <BlogSidebar />
          </div>

          <BlogCTA cta={post.cta} />
          <RelatedPosts posts={relatedPosts} />
        </div>
      </div>
    </article>
  );
}
