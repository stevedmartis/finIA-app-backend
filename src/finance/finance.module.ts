// src/finance/finance.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import Accounts from 'twilio/lib/rest/Accounts';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { AccountModel, FloidAccountWidgetModel, TransactionModel } from './models/floid-account-summary';
import { HttpModule } from '@nestjs/axios';
import { FinanceGateway } from 'src/socket/socket.gateway';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: 'FloidAccountWidget', schema: FloidAccountWidgetModel.schema },
            { name: 'Account', schema: AccountModel.schema },
            { name: 'Transaction', schema: TransactionModel.schema },

        ])


    ],
    controllers: [FinanceController],
    providers: [FinanceService, FinanceGateway],
    exports: [FinanceGateway]
})
export class FinanceModule { }
