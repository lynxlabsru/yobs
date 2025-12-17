import { Module } from '@nestjs/common';
import { StartupModule } from './startup/startup.module';
import { LlmModule } from './llm/llm.module';
import { ImageModule } from './image/image.module';
import { TelegramModule } from './telegram/telegram.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
    imports: [PrismaModule, StartupModule, LlmModule, ImageModule, TelegramModule],
})
export class AppModule { }

