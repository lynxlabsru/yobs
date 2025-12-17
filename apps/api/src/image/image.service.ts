import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class ImageService {
    private openai: OpenAI | null = null;

    constructor() {
        if (process.env.AITUNNEL_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.AITUNNEL_API_KEY,
                baseURL: 'https://api.aitunnel.ru/v1/',
            });
            console.log('🎨 AITunnel image generation enabled');
        } else {
            console.log('⚠️ AITUNNEL_API_KEY not set, image generation disabled');
        }
    }

    /**
     * Generate a logo using AITunnel gpt-image-1
     */
    async generateLogo(startupName: string): Promise<string | null> {
        if (!this.openai) {
            return null;
        }

        try {
            console.log(`🎨 Generating logo for "${startupName}"...`);

            const response = await this.openai.images.generate({
                model: 'gpt-image-1',
                prompt: `Минималистичный логотип для стартапа "${startupName}". Современный tech логотип, простой абстрактный дизайн, на белом фоне. Без текста.`,
                quality: 'low',
                size: '1024x1024',
                // @ts-ignore - aitunnel specific options
                moderation: 'low',
                output_format: 'png',
            });

            // AITunnel returns base64
            const b64 = (response.data?.[0] as any)?.b64_json;
            if (b64) {
                // Convert to data URL for inline display
                const dataUrl = `data:image/png;base64,${b64}`;
                console.log('✅ Logo generated');
                return dataUrl;
            }

            return null;
        } catch (error) {
            console.error('Error generating logo:', error);
            return null;
        }
    }

    /**
     * Generate a hero image for the landing page
     */
    async generateHeroImage(startupName: string, description: string): Promise<string | null> {
        if (!this.openai) {
            return null;
        }

        try {
            console.log(`🎨 Generating hero image for "${startupName}"...`);

            const response = await this.openai.images.generate({
                model: 'gpt-image-1',
                prompt: `Абстрактная hero-иллюстрация для tech стартапа "${startupName}": ${description.slice(0, 100)}. Современный градиентный дизайн, минимализм, подходит для лендинга.`,
                quality: 'low',
                size: '1536x1024',
                // @ts-ignore - aitunnel specific options
                moderation: 'low',
                output_format: 'png',
            });

            const b64 = (response.data?.[0] as any)?.b64_json;
            if (b64) {
                const dataUrl = `data:image/png;base64,${b64}`;
                console.log('✅ Hero image generated');
                return dataUrl;
            }

            return null;
        } catch (error) {
            console.error('Error generating hero image:', error);
            return null;
        }
    }

    /**
     * Generate a square image for Telegram post
     */
    async generatePostImage(startupName: string, postContent: string): Promise<Buffer | null> {
        if (!this.openai) {
            return null;
        }

        try {
            console.log(`🎨 Generating Telegram post image for "${startupName}"...`);

            const response = await this.openai.images.generate({
                model: 'gpt-image-1',
                prompt: `Креативная квадратная иллюстрация для поста в Telegram о стартапе "${startupName}". Тема поста: ${postContent.slice(0, 80)}. Яркий, запоминающийся дизайн, современный стиль, подходит для социальных сетей. Без текста на картинке.`,
                quality: 'low',
                size: '1024x1024',
                // @ts-ignore - aitunnel specific options
                moderation: 'low',
                output_format: 'png',
            });

            const b64 = (response.data?.[0] as any)?.b64_json;
            if (b64) {
                console.log('✅ Post image generated');
                return Buffer.from(b64, 'base64');
            }

            return null;
        } catch (error) {
            console.error('Error generating post image:', error);
            return null;
        }
    }
}
