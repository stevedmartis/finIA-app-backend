import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/user/schemas/user.schema';
import { RefreshTokenSchema } from './schemas/refresh-token.schema';
import { FloidAccountWidgetSchema, IncomeAccountSchema, SourceSchema } from 'src/user/schemas/floid-widget.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'RefreshToken', schema: RefreshTokenSchema },
    ]),
    MongooseModule.forFeature([{ name: 'FloidAccountWidget', schema: FloidAccountWidgetSchema }]),
    MongooseModule.forFeature([{ name: 'IncomeAccount', schema: IncomeAccountSchema }]),
    MongooseModule.forFeature([{ name: 'Source', schema: SourceSchema }]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule { }
