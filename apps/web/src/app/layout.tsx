import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'YOBS - Твой Собственный Плохой Стартап',
    description: 'ИИ генерирует ужасную идею стартапа для тебя. Ты не можешь отказаться.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
