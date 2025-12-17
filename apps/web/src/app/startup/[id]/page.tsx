import { notFound } from 'next/navigation';
import styles from './page.module.css';

interface Startup {
    id: string;
    name: string;
    tagline: string;
    description: string;
    problem: string;
    solution: string;
    logoUrl: string | null;
    landingHtml: string;
    telegramChannelId: string | null;
    telegramChannelName: string | null;
    createdAt: string;
}

async function getStartup(id: string): Promise<Startup | null> {
    try {
        const res = await fetch(`${process.env.API_URL || 'http://localhost:3001'}/api/startup/${id}`, {
            cache: 'no-store',
        });
        const data = await res.json();
        return data.success ? data.data : null;
    } catch {
        return null;
    }
}

export default async function StartupPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const startup = await getStartup(id);

    if (!startup) {
        notFound();
    }

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <a href="/" className={styles.backLink}>← Назад к YOBS</a>
                <a href="/gallery" className={styles.galleryLink}>Галерея</a>
            </header>

            <section className={styles.hero}>
                {startup.logoUrl && (
                    <img src={startup.logoUrl} alt={startup.name} className={styles.logo} />
                )}
                <h1 className={styles.name}>{startup.name}</h1>
                <p className={styles.tagline}>{startup.tagline}</p>
            </section>

            <section className={styles.content}>
                <div className="card">
                    <h2>«Проблема»</h2>
                    <p>{startup.problem}</p>
                </div>

                <div className="card">
                    <h2>Наше «решение»</h2>
                    <p>{startup.solution}</p>
                </div>

                <div className="card">
                    <h2>О проекте</h2>
                    <p>{startup.description}</p>
                </div>
            </section>

            <section className={styles.actions}>
                <h2>Экспорт стартапа</h2>
                <div className={styles.actionButtons}>
                    <a href={`/api/startup/${startup.id}/html`} className="btn btn-primary">
                        📥 Скачать HTML
                    </a>
                    <a href={`/api/startup/${startup.id}/preview`} target="_blank" className="btn btn-secondary">
                        👁️ Превью лендинга
                    </a>
                </div>
            </section>

            <section className={styles.telegram}>
                <h2>Подключить Telegram</h2>
                {startup.telegramChannelId ? (
                    <div className={styles.connected}>
                        <span>✅ Подключено к: {startup.telegramChannelName}</span>
                    </div>
                ) : (
                    <div className={styles.instructions}>
                        <p>Хочешь, чтобы ИИ постил ужасный маркетинговый контент для твоего плохого стартапа?</p>
                        <ol>
                            <li>Создай Telegram-канал</li>
                            <li>Добавь <strong>@YOBS_SMM_Bot</strong> как администратора</li>
                            <li>Узнай ID канала (перешли сообщение из канала боту @userinfobot)</li>
                            <li>Напиши боту: <code>/link CHANNEL_ID {startup.id}</code></li>
                            <li>Используй <code>/post</code> для генерации поста в канал</li>
                        </ol>
                    </div>
                )}
            </section>

            <footer className={styles.footer}>
                <p>Создано: {new Date(startup.createdAt).toLocaleDateString('ru-RU')}</p>
                <a href="/">Сгенерировать ещё один плохой стартап</a>
            </footer>
        </main>
    );
}
