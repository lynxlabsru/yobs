import { Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { ImageService } from '../image/image.service';

@Injectable()
export class TelegramService implements OnModuleInit {
    private bot: Telegraf | null = null;

    constructor(
        private prisma: PrismaService,
        private llm: LlmService,
        private image: ImageService,
    ) { }

    onModuleInit() {
        if (process.env.TELEGRAM_BOT_TOKEN) {
            this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
            this.setupCommands();
            this.bot.launch().catch(console.error);
            console.log('🤖 Telegram bot @YOBS_SMM_Bot started');
        } else {
            console.log('⚠️ TELEGRAM_BOT_TOKEN not set, bot disabled');
        }
    }

    private setupCommands() {
        if (!this.bot) return;

        // /start command
        this.bot.start((ctx) => {
            ctx.reply(
                '👋 Привет! Я YOBS SMM Bot!\n\n' +
                'Я постю ужасный маркетинговый контент для твоего плохого стартапа.\n\n' +
                'Команды:\n' +
                '/link <channel_id> <startup_id> — привязать канал к стартапу\n' +
                '/post — сгенерировать и отправить пост в канал\n' +
                '/info — информация о привязанном стартапе\n\n' +
                'Как узнать channel_id:\n' +
                '1. Добавь бота в канал как админа\n' +
                '2. Перешли любое сообщение из канала боту @userinfobot — он покажет ID'
            );
        });

        // /link command - links channel to a startup
        this.bot.command('link', async (ctx) => {
            const parts = ctx.message.text.split(' ');
            const channelId = parts[1];
            const startupId = parts[2];

            if (!channelId || !startupId) {
                return ctx.reply(
                    '❌ Укажи оба параметра:\n' +
                    '/link <channel_id> <startup_id>\n\n' +
                    'Пример: /link -1001234567890 cmj9abc123'
                );
            }

            try {
                const startup = await this.prisma.startup.findUnique({
                    where: { id: startupId },
                });

                if (!startup) {
                    return ctx.reply('❌ Стартап не найден. Проверь ID и попробуй снова.');
                }

                // Verify bot can post to the channel
                try {
                    await this.bot!.telegram.sendMessage(channelId, '✅ YOBS SMM Bot подключен! Удали это сообщение.');
                } catch (e) {
                    return ctx.reply(
                        '❌ Не могу отправить сообщение в канал.\n' +
                        'Убедись что:\n' +
                        '1. Бот добавлен в канал как администратор\n' +
                        '2. У бота есть права на отправку сообщений\n' +
                        '3. Channel ID правильный (должен начинаться с -100)'
                    );
                }

                await this.prisma.startup.update({
                    where: { id: startupId },
                    data: {
                        telegramChannelId: channelId,
                        telegramChannelName: `Channel ${channelId}`,
                    },
                });

                return ctx.reply(
                    `✅ Канал ${channelId} привязан к "${startup.name}"!\n\n` +
                    `Используй /post для генерации поста — он пойдёт сразу в канал.`
                );
            } catch (error) {
                console.error('Error linking startup:', error);
                return ctx.reply('❌ Ошибка привязки. Попробуй ещё раз.');
            }
        });

        // /post command - generates and sends a post with image TO THE CHANNEL
        this.bot.command('post', async (ctx) => {
            // Find startup linked to this user's chat (for getting context)
            // We'll use the last startup they linked
            try {
                // Get startup from message or find the latest one
                const startupId = ctx.message.text.split(' ')[1];

                let startup;
                if (startupId) {
                    startup = await this.prisma.startup.findUnique({
                        where: { id: startupId },
                    });
                } else {
                    // Find any startup with a linked channel
                    startup = await this.prisma.startup.findFirst({
                        where: {
                            telegramChannelId: { not: null }
                        },
                        orderBy: { createdAt: 'desc' },
                    });
                }

                if (!startup || !startup.telegramChannelId) {
                    return ctx.reply(
                        '❌ Нет привязанного канала.\n' +
                        'Сначала используй /link <channel_id> <startup_id>\n\n' +
                        'Или укажи ID стартапа: /post <startup_id>'
                    );
                }

                await ctx.reply(`🎨 Генерирую пост для "${startup.name}"...`);

                const post = await this.llm.generateBadTelegramPost({
                    name: startup.name,
                    tagline: startup.tagline,
                    description: startup.description,
                    problem: startup.problem,
                    solution: startup.solution,
                    features: [],
                    testimonials: [],
                });

                // Generate image for the post
                const imageBuffer = await this.image.generatePostImage(startup.name, post);

                // Save the post
                await this.prisma.telegramPost.create({
                    data: {
                        startupId: startup.id,
                        content: post,
                        postedAt: new Date(),
                    },
                });

                // Send to the CHANNEL (not the current chat)
                if (imageBuffer) {
                    await this.bot!.telegram.sendPhoto(
                        startup.telegramChannelId,
                        { source: imageBuffer },
                        { caption: post }
                    );
                } else {
                    await this.bot!.telegram.sendMessage(startup.telegramChannelId, post);
                }

                return ctx.reply(`✅ Пост отправлен в канал!`);
            } catch (error) {
                console.error('Error generating post:', error);
                return ctx.reply('❌ Ошибка генерации поста. Попробуй ещё раз.');
            }
        });

        // /info command - shows linked startup info
        this.bot.command('info', async (ctx) => {
            const startups = await this.prisma.startup.findMany({
                where: { telegramChannelId: { not: null } },
                orderBy: { createdAt: 'desc' },
                take: 5,
            });

            if (startups.length === 0) {
                return ctx.reply('Нет привязанных стартапов. Используй /link <channel_id> <startup_id>');
            }

            const list = startups.map((s: { name: string; id: string; telegramChannelId: string | null }) =>
                `• ${s.name}\n  ID: ${s.id}\n  Канал: ${s.telegramChannelId}`
            ).join('\n\n');

            return ctx.reply(
                `📊 Привязанные стартапы:\n\n${list}`
            );
        });
    }

    /**
     * Post to a channel programmatically with image
     */
    async postToChannel(channelId: string, content: string, imageBuffer?: Buffer | null): Promise<boolean> {
        if (!this.bot) {
            console.log('Bot not initialized');
            return false;
        }

        try {
            if (imageBuffer) {
                await this.bot.telegram.sendPhoto(channelId, { source: imageBuffer }, { caption: content });
            } else {
                await this.bot.telegram.sendMessage(channelId, content);
            }
            return true;
        } catch (error) {
            console.error('Error posting to channel:', error);
            return false;
        }
    }
}
