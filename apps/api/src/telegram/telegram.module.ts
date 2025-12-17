import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ImageModule } from '../image/image.module';

@Module({
    imports: [ImageModule],
    providers: [TelegramService],
    exports: [TelegramService],
})
export class TelegramModule { }
