import styles from "./blog.module.css";

export default function BlogHero() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.container}>
        <span className={styles.eyebrow}>Ideas para crecer en el fútbol</span>
        <h1>Blog FutbolProyect</h1>
        <p>
          Guías, consejos y recursos para jugadores, clubes, scouts y
          profesionales del fútbol.
        </p>
      </div>
    </header>
  );
}
