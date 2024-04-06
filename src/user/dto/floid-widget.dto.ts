import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, ValidateNested, ArrayMinSize, ArrayNotEmpty } from 'class-validator';
import { Type as ClassType } from 'class-transformer';

enum Sender {
    'ABONO DE CREDITO 29600179865' = 'ABONO DE CREDITO 29600179865',
    'ABONO POR TRF DESDE OTRO BANCO EN LINEA' = 'ABONO POR TRF DESDE OTRO BANCO EN LINEA',
    'ABONO TERCEROS 12345678-0 A.PEREZ BAR' = 'ABONO TERCEROS 12345678-0 A.PEREZ BAR',
    'TRANSFER DE FLOW SPA' = 'TRANSFER DE FLOW SPA',
    'TRANSFER DE PEREZ' = 'TRANSFER DE PEREZ',
}

enum Type {
    'extra' = 'extra',
    'main' = 'main',
}

class SourceDto {
    @ApiProperty({ enum: Sender })
    sender: Sender;

    @ApiProperty()
    amount: number;

    @ApiProperty({ enum: Type })
    type: Type;
}

class IncomeByMonthDto {
    @ApiProperty()
    month: string;

    @ApiProperty()
    total: number;

    @ApiProperty()
    main: number;

    @ApiProperty()
    extra: number;

    @ApiProperty()
    date: string;

    @ValidateNested({ each: true })
    @ApiProperty({ type: [SourceDto] })
    sources: SourceDto[];
}

class IncomeAccountDto {
    @ApiProperty()
    account_number: number;

    @ApiProperty()
    regularity: string;

    @ApiProperty()
    totalAverage: number;

    @ApiProperty()
    mainAverage: number;

    @ApiProperty()
    extraAverage: number;

    @ApiProperty()
    mainIncomeDeposit: string;

    @ValidateNested({ each: true })
    @ApiProperty({ type: [IncomeByMonthDto] })
    incomeByMonth: IncomeByMonthDto[];
}

class ProductsAccountDto {
    @ApiProperty()
    type: string;

    @ApiProperty()
    number: number;

    @ApiProperty()
    currency: string;

    @ApiProperty()
    balance: number;
}

class LineDto {
    @ApiProperty()
    number: number;

    @ApiProperty()
    currency: string;

    @ApiProperty()
    total: number;

    @ApiProperty()
    used: number;

    @ApiProperty()
    available: number;
}


class CardDto {
    @ApiProperty()
    number: string;

    @ApiProperty()
    currency: string;

    @ApiProperty()
    total: number;

    @ApiProperty()
    used: number;

    @ApiProperty()
    available: number;

    @ApiProperty()
    name: string;
}


class TransactionDto {
    @ApiProperty()
    date: string;

    @ApiProperty()
    branch: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    doc_number: string;

    @ApiProperty()
    out: number;

    @ApiProperty()
    in: number;

    @ApiProperty()
    balance: number;

    @ApiProperty()
    id: string;
}

class TransactionsAccountDto {
    @ApiProperty()
    account_number: number;

    @ValidateNested({ each: true })
    @ApiProperty({ type: [TransactionDto] })
    transactions: TransactionDto[];
}


class ProductsDto {
    @ValidateNested({ each: true })
    @ApiProperty({ type: [ProductsAccountDto] })
    accounts: ProductsAccountDto[];

    @ValidateNested({ each: true })
    @ApiProperty({ type: [CardDto] })
    cards: CardDto[];

    @ValidateNested({ each: true })
    @ApiProperty({ type: [LineDto] })
    lines: LineDto[];
}

class TransactionsDto {
    @ValidateNested({ each: true })
    @ApiProperty({ type: [TransactionsAccountDto] })
    accounts: TransactionsAccountDto[];
}

class IncomeDto {
    @ValidateNested({ each: true })
    @ApiProperty({ type: [IncomeAccountDto] })
    accounts: IncomeAccountDto[];
}

class AccountFloidWidgetDto {
    @ApiProperty()
    consumerId: string;

    @ApiProperty()
    caseid: string;

    @ValidateNested()
    @ApiProperty({ type: ProductsDto })
    products: ProductsDto;

    @ValidateNested()
    @ApiProperty({ type: TransactionsDto })
    transactions: TransactionsDto;

    @ValidateNested()
    @ApiProperty({ type: IncomeDto })
    income: IncomeDto;
}

export {
    AccountFloidWidgetDto,
    IncomeAccountDto,
    IncomeByMonthDto,
    ProductsDto,
    ProductsAccountDto,
    CardDto,
    LineDto,
    TransactionsDto,
    TransactionsAccountDto,
    TransactionDto,
    IncomeDto,
    SourceDto
};
