'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/generate', { method: 'POST' });
            const data = await res.json();
            if (data.success && data.data?.id) {
                router.push(`/startup/${data.data.id}`);
            }
        } catch (error) {
            console.error('Error generating startup:', error);
            setLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.hero}>
                <div className={styles.badge}>🚀 100% ИИ-сгенерированный мусор</div>

                <h1 className={styles.title}>
                    <span className={styles.gradient}>YOBS</span>
                    <br />
                    Твой Собственный Плохой Стартап
                </h1>

                <p className={styles.subtitle}>
                    ИИ генерирует ужасную идею стартапа для тебя.
                    <br />
                    <strong>Ты не можешь отказаться.</strong>
                </p>

                <button
                    className="btn btn-primary"
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className="spinner" />
                            <span className="loading-text">Генерируем твою судьбу...</span>
                        </>
                    ) : (
                        <>🎲 Сгенерировать мой плохой стартап</>
                    )}
                </button>

                <p className={styles.note}>
                    Бесплатно • Без регистрации • Мгновенное сожаление
                </p>
            </div>

            <section className={styles.features}>
                <h2>Что ты получишь:</h2>
                <div className={styles.featureGrid}>
                    <div className="card">
                        <div className={styles.featureIcon}>💡</div>
                        <h3>Ужасная идея</h3>
                        <p>ИИ-сгенерированная концепция стартапа, решающая проблемы, которых ни у кого нет</p>
                    </div>
                    <div className="card">
                        <div className={styles.featureIcon}>🌐</div>
                        <h3>Лендинг</h3>
                        <p>Полный HTML, который можно экспортировать и задеплоить (но, наверное, не стоит)</p>
                    </div>
                    <div className="card">
                        <div className={styles.featureIcon}>📱</div>
                        <h3>Telegram-канал</h3>
                        <p>Подключи нашего бота для автопостинга неубедительного маркетингового контента</p>
                    </div>
                </div>
            </section>

            <footer className={styles.footer}>
                <a href="/gallery">Галерея плохих стартапов</a>
                <span>•</span>
                <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
            </footer>
        </main>
    );
}
