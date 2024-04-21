
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

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(RolesGuard)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }


    @Post('send-code')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'A private route for send verification code', })
    async sendCode(@Body('phoneNumber') phoneNumber: string): Promise<string> {
        console.log(phoneNumber)
        const code = '123456'; // Aquí deberías generar un código aleatorio o de alguna manera
        await this.authService.sendVerificationCode(phoneNumber, code);
        return 'Código de verificación enviado.';
    }


}
