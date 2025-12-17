import { Module } from '@nestjs/common';
import { StartupController } from './startup.controller';
import { StartupService } from './startup.service';
import { ImageModule } from '../image/image.module';

@Module({
    imports: [ImageModule],
    controllers: [StartupController],
    providers: [StartupService],
})
export class StartupModule { }
