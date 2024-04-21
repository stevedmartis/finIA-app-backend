// src/finance/finance.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { FloidAccountWidgetSchema } from './schemas/floid-widget.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'FloidAccountWidget', schema: FloidAccountWidgetSchema }
        ])
    ],
    controllers: [FinanceController],
    providers: [FinanceService],
})
export class FinanceModule { }
