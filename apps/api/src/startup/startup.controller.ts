import { Controller, Get, Post, Param, Query, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { StartupService } from './startup.service';

@Controller('api')
export class StartupController {
    constructor(private startupService: StartupService) { }

    @Post('generate')
    async generate() {
        const startup = await this.startupService.generate();
        return {
            success: true,
            data: startup,
        };
    }

    @Get('startup/:id')
    async findOne(@Param('id') id: string) {
        const startup = await this.startupService.findOne(id);
        if (!startup) {
            return { success: false, error: 'Startup not found' };
        }
        return { success: true, data: startup };
    }

    @Get('startup/:id/html')
    @Header('Content-Type', 'text/html')
    @Header('Content-Disposition', 'attachment; filename="landing.html"')
    async downloadHtml(@Param('id') id: string, @Res() res: Response) {
        const html = await this.startupService.getHtml(id);
        if (!html) {
            return res.status(404).send('Startup not found');
        }
        return res.send(html);
    }

    @Get('startup/:id/preview')
    @Header('Content-Type', 'text/html')
    async previewHtml(@Param('id') id: string, @Res() res: Response) {
        const html = await this.startupService.getHtml(id);
        if (!html) {
            return res.status(404).send('Startup not found');
        }
        return res.send(html);
    }

    @Get('gallery')
    async gallery(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        return this.startupService.findAll(parseInt(page), parseInt(limit));
    }
}
