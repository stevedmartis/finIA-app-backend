import { IsString, IsNumber, IsEnum, IsDate, ValidateNested, ArrayMinSize, ArrayNotEmpty } from 'class-validator';
import { Type as ClassType } from 'class-transformer'; // Renombramos el import a ClassType

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
    @IsEnum(Sender)
    sender: Sender;

    @IsNumber()
    amount: number;

    @IsEnum(Type)
    type: Type;
}

class IncomeByMonthDto {
    @IsString()
    month: string;

    @IsNumber()
    total: number;

    @IsNumber()
    main: number;

    @IsNumber()
    extra: number;

    @IsDate()
    date: Date;

    @ValidateNested({ each: true })
    @ClassType(() => SourceDto)
    @ArrayMinSize(1)
    sources: SourceDto[];
}

class IncomeAccountDto {
    @IsNumber()
    account_number: number;

    @IsString()
    regularity: string;

    @IsNumber()
    totalAverage: number;

    @IsNumber()
    mainAverage: number;

    @IsNumber()
    extraAverage: number;

    @IsString()
    mainIncomeDeposit: string;

    @ValidateNested({ each: true })
    @ClassType(() => IncomeByMonthDto)
    @ArrayMinSize(1)
    incomeByMonth: IncomeByMonthDto[];
}

class ProductsDto {
    @ValidateNested({ each: true })
    @ClassType(() => ProductsAccountDto)
    @ArrayMinSize(1)
    accounts: ProductsAccountDto[];

    @ValidateNested({ each: true })
    @ClassType(() => CardDto)
    @ArrayMinSize(1)
    cards: CardDto[];

    @ValidateNested({ each: true })
    @ClassType(() => LineDto)
    @ArrayMinSize(1)
    lines: LineDto[];
}

class TransactionsDto {
    @ValidateNested({ each: true })
    @ClassType(() => TransactionsAccountDto)
    @ArrayMinSize(1)
    accounts: TransactionsAccountDto[];
}

class IncomeDto {
    @ValidateNested({ each: true })
    @ClassType(() => IncomeAccountDto)
    @ArrayNotEmpty()
    accounts: IncomeAccountDto[];
}

class FloidWidgetResponseDto {
    @IsString()
    consumerId: string;

    @IsString()
    caseid: string;

    @ValidateNested()
    @ClassType(() => ProductsDto)
    products: ProductsDto;

    @ValidateNested()
    @ClassType(() => TransactionsDto)
    transactions: TransactionsDto;

    @ValidateNested()
    @ClassType(() => IncomeDto)
    income: IncomeDto;
}



class ProductsAccountDto {
    @IsString()
    type: string;

    @IsNumber()
    number: number;

    @IsString()
    currency: string;

    @IsNumber()
    balance: number;
}

class CardDto {
    @IsString()
    number: string;

    @IsString()
    currency: string;

    @IsNumber()
    total: number;

    @IsNumber()
    used: number;

    @IsNumber()
    available: number;

    @IsString()
    name: string;
}

class LineDto {
    @IsNumber()
    number: number;

    @IsString()
    currency: string;

    @IsNumber()
    total: number;

    @IsNumber()
    used: number;

    @IsNumber()
    available: number;
}



class TransactionsAccountDto {
    @IsNumber()
    account_number: number;

    @ValidateNested({ each: true })
    @ClassType(() => TransactionDto)
    @ArrayMinSize(1)
    transactions: TransactionDto[];
}

class TransactionDto {
    @IsDate()
    date: Date;

    @IsString()
    branch: string;

    @IsString()
    description: string;

    @IsString()
    doc_number: string;

    @IsNumber()
    out: number;

    @IsNumber()
    in: number;

    @IsNumber()
    balance: number;

    @IsString()
    id: string;
}



export {
    FloidWidgetResponseDto,
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
