import { IsNotEmpty, IsString, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

class AccountCredsDTO {
    @IsNotEmpty()
    @IsString()
    account: string;

    @IsNotEmpty()
    @IsUUID()
    token_password: string;
}

export class UserCredentialDto {
    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsString()
    msg: string;

    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsString()
    country: string;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AccountCredsDTO)
    accounts: AccountCredsDTO[];

    @IsNotEmpty()
    @IsString()
    bank: string;

    @IsNotEmpty()
    @IsUUID()
    caseid: string;
}
