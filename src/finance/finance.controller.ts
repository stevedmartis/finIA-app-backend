import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { WebSocketServer } from '@nestjs/websockets';
import { forkJoin, Observable, tap } from 'rxjs';
import { FinanceGateway } from 'src/socket/socket.gateway';
import { UserCredentialDto } from './dto/floid-credential.dto';
import { FloidAccountWidgetDto } from './dto/floid-widget.dto';

import { FinanceService } from './finance.service';
import { FinanceSummary } from './interfaces/finance-summary.interface';
import { IFloidAccountWidget } from './models/floid-account-summary';


@Controller('finance')
export class FinanceController {

    constructor(private financeService: FinanceService, private financeGateway: FinanceGateway) {

    }

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
    processUserAccounts(@Body() userAccountsDto: UserCredentialDto): Observable<any[]> {
        if (!userAccountsDto.accounts || userAccountsDto.accounts.length === 0) {
            throw new HttpException('No accounts provided', HttpStatus.BAD_REQUEST);
        }

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

        const normalizedBank = bankMap[userAccountsDto.bank]?.toLowerCase() ||
            userAccountsDto.bank.toLowerCase();

        console.log('Procesando petición:', {
            bank: normalizedBank,
            accountsCount: userAccountsDto.accounts.length,
            hasToken: !!process.env.FLOID_TOKEN
        });

        const requests = userAccountsDto.accounts.map(account => {
            if (!account.token_password) {
                throw new HttpException(
                    `Missing token_password for account ${account.account}`,
                    HttpStatus.BAD_REQUEST
                );
            }

            return this.financeService.getProductsForAccount(
                userAccountsDto.id,
                account.account,
                account.token_password,
                normalizedBank
            );
        });

        return forkJoin(requests);
    }

    @Post('transactions-callback')
    async handleTransactionsCallback(@Body() data: any) {
        console.log('Transactions Callback received:', data);
        const { caseid, transactions } = data;

        try {
            // Procesar los datos de transacciones recibidos
            const processedTransactions = this.financeService.processTransactionData(transactions);

            // Notificar al front-end a través de WebSockets
            this.financeGateway.sendTransactionsUpdate(caseid, processedTransactions);

            return { success: true, message: 'Callback procesado correctamente' };
        } catch (error) {
            console.error('Error procesando callback de transacciones:', error);
            throw new HttpException(
                'Error procesando callback de transacciones',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    @Post('receive-data')
    async receiveFloidData(@Body() data: any) {
        console.log('Datos recibidos de Floid:', data);

        try {
            if (data.widget) {
                // Procesar datos del widget
                await this.financeService.processWidgetData(data.widget);
            }

            if (data.transactions) {
                // Procesar datos de transacciones
                await this.financeService.processTransactionData(data.transactions);
            }

            // Aquí podrías notificar al cliente a través de WebSockets si es necesario
            // this.financeGateway.sendDataUpdate(data.caseId, { widget: data.widget, transactions: data.transactions });

            return { success: true, message: 'Datos procesados correctamente' };
        } catch (error) {
            console.error('Error procesando datos de Floid:', error);
            throw new HttpException('Error procesando datos de Floid', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    private processTransactionData(data: any): any[] {
        // Lógica para procesar los datos de transacciones recibidos
        return data.transactions;
    }


}