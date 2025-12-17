import Link from 'next/link';
import styles from './page.module.css';

interface StartupPreview {
    id: string;
    name: string;
    tagline: string;
    logoUrl: string | null;
    createdAt: string;
}

async function getStartups(): Promise<{ data: StartupPreview[]; meta: { total: number } }> {
    try {
        const res = await fetch(`${process.env.API_URL || 'http://localhost:3001'}/api/gallery`, {
            cache: 'no-store',
        });
        return await res.json();
    } catch {
        return { data: [], meta: { total: 0 } };
    }
}

export default async function GalleryPage() {
    const { data: startups, meta } = await getStartups();

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <a href="/" className={styles.backLink}>← Назад к YOBS</a>
            </header>

            <section className={styles.hero}>
                <h1>Галерея плохих стартапов</h1>
                <p>{meta.total} ужасных идей сгенерировано (и это не предел)</p>
            </section>

            {startups.length === 0 ? (
                <div className={styles.empty}>
                    <p>Пока нет плохих стартапов. Будь первым!</p>
                    <a href="/" className="btn btn-primary">Сгенерировать мой плохой стартап</a>
                </div>
            ) : (
                <div className={styles.grid}>
                    {startups.map((startup) => (
                        <Link key={startup.id} href={`/startup/${startup.id}`} className={styles.card}>
                            <div className={styles.cardContent}>
                                {startup.logoUrl ? (
                                    <img src={startup.logoUrl} alt="" className={styles.logo} />
                                ) : (
                                    <div className={styles.logoPlaceholder}>💡</div>
                                )}
                                <h2>{startup.name}</h2>
                                <p>{startup.tagline}</p>
                                <time>{new Date(startup.createdAt).toLocaleDateString('ru-RU')}</time>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <footer className={styles.footer}>
                <a href="/">Сгенерировать свой плохой стартап</a>
            </footer>
        </main>
    );
}
