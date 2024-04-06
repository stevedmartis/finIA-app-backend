import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { ForgotPasswordSchema } from './schemas/forgot-password.schema';
import { AuthController } from './authentication.controller';
import { FloidAccountWidgetSchema, IncomeAccountSchema, SourceSchema } from './schemas/floid-widget.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'ForgotPassword', schema: ForgotPasswordSchema }]),
    AuthModule,
  ],
  controllers: [UserController, AuthController],
  providers: [UserService],
})
export class UserModule { }
