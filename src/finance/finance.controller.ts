import { Body, Controller, Get, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { FloidAccountWidgetDto } from './dto/floid-widget.dto';

import { FinanceService } from './finance.service';
import { FinanceSummary } from './interfaces/finance-summary.interface';
import { FloidAccountWidgetModel } from './models/floid-account-widget.interface';


@Controller('finance')
export class FinanceController {
    constructor(private financeService: FinanceService) { }

    // ╔═╗╦ ╦╔╦╗╦ ╦╔═╗╔╗╔╔╦╗╦╔═╗╔═╗╔╦╗╔═╗
    // ╠═╣║ ║ ║ ╠═╣║╣ ║║║ ║ ║║  ╠═╣ ║ ║╣
    // ╩ ╩╚═╝ ╩ ╩ ╩╚═╝╝╚╝ ╩ ╩╚═╝╩ ╩ ╩ ╚═╝
    @Post('callbackurl')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Auth Floid user' })
    @ApiCreatedResponse({})
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async createAccount(@Body() createFloidAccountDto: FloidAccountWidgetDto): Promise<FloidAccountWidgetModel> {
        return this.financeService.createAccountFloidWidget(createFloidAccountDto);
    }

    @Get('summary')
    async getFinancialSummary(): Promise<FinanceSummary> {
        return await this.financeService.getFinancialSummary();
    }
}