import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { forkJoin, Observable } from 'rxjs';
import { UserCredentialDto } from './dto/floid-credential.dto';
import { FloidAccountWidgetDto } from './dto/floid-widget.dto';

import { FinanceService } from './finance.service';
import { FinanceSummary } from './interfaces/finance-summary.interface';
import { IFloidAccountWidget } from './models/floid-account-summary';


@Controller('finance')
export class FinanceController {
    constructor(private financeService: FinanceService) { }

    // ╔═╗╦ ╦╔╦╗╦ ╦╔═╗╔╗╔╔╦╗╦╔═╗╔═╗╔╦╗╔═╗
    // ╠═╣║ ║ ║ ╠═╣║╣ ║║║ ║ ║║  ╠═╣ ║ ║╣
    // ╩ ╩╚═╝ ╩ ╩ ╩╚═╝╝╚╝ ╩ ╩╚═╝╩ ╩ ╩ ╚═╝
    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Auth Floid user' })
    @ApiCreatedResponse({})
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async createAccount(@Body() createFloidAccountDto: FloidAccountWidgetDto): Promise<IFloidAccountWidget> {
        console.log('createFloidAccountDto', createFloidAccountDto)
        return this.financeService.createAccountFloidWidget(createFloidAccountDto);
    }

    @Get('summary/:userId')
    async getFinancialSummary(@Param('userId') userId: string): Promise<IFloidAccountWidget> {
        try {
            const summary = await this.financeService.getFinancialSummaryForUser(userId);
            return summary;
        } catch (error) {
            throw new HttpException('Failed to retrieve financial summary', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('callbackurl')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Auth Floid user' })
    @ApiCreatedResponse({})
    processUserAccounts(@Body() userAccountsDto: UserCredentialDto): Observable<any[]> {
        console.log('userAccountsDto', userAccountsDto);

        const bankMap = {
            'Santander': 'santander',
            'Banco de Chile': 'chile',
            'Itaú': 'itau',
            'BCI': 'bci',
            'Banco Estado': 'estado',
            'BICE': 'bice',
            'Banco Falabella': 'falabella',
            'Banco Ripley': 'ripley',
            'Scotiabank': 'scotiabank',
            'Security': 'security'
        };

        const normalizedBank = bankMap[userAccountsDto.bank] || userAccountsDto.bank.toLowerCase();

        const requests = userAccountsDto.accounts.map(account =>
            this.financeService.getProductsForAccount(
                userAccountsDto.id,
                account.account,
                account.token_password,
                normalizedBank
            )
        );

        console.log('requests', requests);
        return forkJoin(requests);
    }

}