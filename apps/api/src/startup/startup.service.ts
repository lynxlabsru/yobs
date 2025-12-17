import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { ImageService } from '../image/image.service';

@Injectable()
export class StartupService {
    constructor(
        private prisma: PrismaService,
        private llm: LlmService,
        private image: ImageService,
    ) { }

    async generate() {
        // 1. Generate the bad startup idea
        console.log('🎲 Generating bad startup idea...');
        const idea = await this.llm.generateBadStartupIdea();
        console.log(`💡 Generated: ${idea.name}`);

        // 2. Generate images (optional, runs in background)
        console.log('🎨 Generating images...');
        const [logoUrl, heroUrl] = await Promise.all([
            this.image.generateLogo(idea.name),
            this.image.generateHeroImage(idea.name, idea.description),
        ]);

        // 3. Generate the landing page HTML
        console.log('📄 Generating landing page...');
        let landingHtml = await this.llm.generateLandingHtml(idea);

        // 4. Inject logo/hero URLs if generated
        if (logoUrl) {
            landingHtml = landingHtml.replace('[LOGO]', `<img src="${logoUrl}" alt="${idea.name} logo" style="max-width: 150px;">`);
        }
        if (heroUrl) {
            landingHtml = landingHtml.replace(
                /<div class="hero[^"]*">/,
                `<div class="hero" style="background-image: url('${heroUrl}'); background-size: cover;">`
            );
        }

        // 5. Save to database
        console.log('💾 Saving to database...');
        const startup = await this.prisma.startup.create({
            data: {
                name: idea.name,
                tagline: idea.tagline,
                description: idea.description,
                problem: idea.problem,
                solution: idea.solution,
                logoUrl,
                heroUrl,
                landingHtml,
            },
        });

        console.log(`✅ Created startup: ${startup.id}`);
        return startup;
    }

    async findOne(id: string) {
        return this.prisma.startup.findUnique({
            where: { id },
            include: {
                posts: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
    }

    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [startups, total] = await Promise.all([
            this.prisma.startup.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    tagline: true,
                    logoUrl: true,
                    createdAt: true,
                },
            }),
            this.prisma.startup.count(),
        ]);

        return {
            data: startups,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getHtml(id: string) {
        const startup = await this.prisma.startup.findUnique({
            where: { id },
            select: { landingHtml: true },
        });
        return startup?.landingHtml;
    }
}
