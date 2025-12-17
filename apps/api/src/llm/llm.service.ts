import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';

export interface BadStartupIdea {
    name: string;
    tagline: string;
    description: string;
    problem: string;
    solution: string;
    features: string[];
    testimonials: { name: string; quote: string }[];
}

@Injectable()
export class LlmService {
    private groq: Groq;

    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }

    async generateBadStartupIdea(): Promise<BadStartupIdea> {
        // Добавляем рандомный seed для уникальности
        const randomSeed = Math.random().toString(36).substring(7);

        const prompt = `Ты — генератор ужасных стартап-идей. Сгенерируй смешную, непрактичную или абсурдную идею для стартапа НА РУССКОМ ЯЗЫКЕ.

Уникальный seed для этой генерации: ${randomSeed}

Идея должна быть:
- Технически возможной, но совершенно бесполезной или переусложнённой
- Решать несуществующую проблему или решать реальную проблему максимально плохим способом
- Чем-то, от чего инвесторы будут плакать (от смеха или грусти)

Ответь в JSON формате:
{
  "name": "Название стартапа (цепляющее, но тупое, можно использовать паттерны -ify, -coin, -AI, Uber-для-X)",
  "tagline": "Короткий, неубедительный слоган",
  "description": "2-3 предложения, восторженно описывающие эту ужасную идею",
  "problem": "'Проблема', которую стартап якобы решает",
  "solution": "Нелепое решение",
  "features": ["Фича 1", "Фича 2", "Фича 3"],
  "testimonials": [
    {"name": "Вася Пупкин", "quote": "Неубедительный отзыв"},
    {"name": "Маша Иванова", "quote": "Ещё один плохой отзыв"}
  ]
}

Будь креативен! Примеры плохих стартап-паттернов:
- Блокчейн для чего-то, чему он не нужен
- ИИ для тривиальных задач
- Подписка на бесплатные вещи
- Uber, но для чего-то абсурдного
- Приложение, которое делает одну бесполезную вещь
- Социальная сеть для неожиданной аудитории
- NFT для повседневных вещей

ВАЖНО: Сгенерируй УНИКАЛЬНУЮ и СМЕШНУЮ идею. Не повторяй предыдущие идеи. Используй seed ${randomSeed} для вдохновения.`;

        const response = await this.groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 1.3,
            max_tokens: 1000,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from LLM');
        }

        return JSON.parse(content) as BadStartupIdea;
    }

    async generateBadTelegramPost(startup: BadStartupIdea): Promise<string> {
        const prompt = `Ты — ужасный SMM-менеджер плохого стартапа.

Стартап: ${startup.name}
Слоган: ${startup.tagline}
Описание: ${startup.description}

Напиши один пост для Telegram-канала этого стартапа. Пост должен быть:
- Плохо написанным и неубедительным
- Использовать слишком много эмодзи или вообще ни одного (непоследовательно)
- Размытым о том, что продукт реально делает
- Содержать слабый призыв к действию
- Возможно, иметь опечатку или две

Пиши коротко (2-4 предложения). Только текст поста, без JSON. НА РУССКОМ ЯЗЫКЕ.`;

        const response = await this.groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 1.2,
            max_tokens: 300,
        });

        return response.choices[0]?.message?.content || 'Мы работаем над чем-то. Наверное. Следите за обновлениями!';
    }

    async generateLandingHtml(startup: BadStartupIdea): Promise<string> {
        const prompt = `Сгенерируй полную, самодостаточную HTML-страницу для этого ужасного стартапа.

Детали стартапа:
- Название: ${startup.name}
- Слоган: ${startup.tagline}
- Описание: ${startup.description}
- Проблема: ${startup.problem}
- Решение: ${startup.solution}
- Фичи: ${startup.features.join(', ')}
- Отзывы: ${JSON.stringify(startup.testimonials)}

Требования:
1. Полный HTML документ с inline CSS (без внешних файлов)
2. Адаптивный дизайн
3. Секции: Hero, Проблема, Решение, Фичи, Отзывы, CTA
4. Используй современный дизайн, но КОНТЕНТ должен быть плохим/неубедительным
5. Включи плейсхолдер для логотипа: <div class="logo">[LOGO]</div>
6. Дизайн должен выглядеть полу-профессионально, но копирайтинг ужасный
7. Используй градиенты, тени, современные шрифты (Google Fonts через CDN можно)
8. ВСЁ НА РУССКОМ ЯЗЫКЕ!

Верни ТОЛЬКО HTML код, без пояснений.`;

        const response = await this.groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            max_tokens: 4000,
        });

        return response.choices[0]?.message?.content || '<html><body><h1>Ошибка генерации страницы</h1></body></html>';
    }
}
