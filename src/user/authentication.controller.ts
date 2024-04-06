
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
        try {

            // Llama al método del servicio y pasa el DTO como argumento
            await this.authService.authFloid(authFloid);

            // Si el método del servicio se ejecuta correctamente, retorna un mensaje de éxito
            return { success: true, message: 'Autenticación exitosa' };
        } catch (error) {
            // Manejo de errores
            console.error('Error en la autenticación Floid:', error);
            throw error;
        }
    }


}
