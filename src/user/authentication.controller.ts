
import { Controller, Get, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';

import {
    ApiCreatedResponse,
    ApiOkResponse,
    ApiTags,
    ApiBearerAuth,
    ApiHeader,
    ApiOperation,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthService } from 'src/auth/auth.service';
import { FloidWidgetResponseDto } from './dto/floid-widget.dto';

@ApiTags('Auth')
@Controller('callbackurl')
@UseGuards(RolesGuard)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    // ╔═╗╦ ╦╔╦╗╦ ╦╔═╗╔╗╔╔╦╗╦╔═╗╔═╗╔╦╗╔═╗
    // ╠═╣║ ║ ║ ╠═╣║╣ ║║║ ║ ║║  ╠═╣ ║ ║╣
    // ╩ ╩╚═╝ ╩ ╩ ╩╚═╝╝╚╝ ╩ ╩╚═╝╩ ╩ ╩ ╚═╝
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Auth Floid user' })
    @ApiCreatedResponse({})
    async authFloidWidget(@Body() authFloid: FloidWidgetResponseDto) {
        return await this.authService.authFloid(authFloid);
    }


}
