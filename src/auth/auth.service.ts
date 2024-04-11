import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { sign } from 'jsonwebtoken';
import { User } from 'src/user/interfaces/user.interface';
import { RefreshToken } from './interfaces/refresh-token.interface';
import { v4 } from 'uuid';
import { Request } from 'express';
import { getClientIp } from 'request-ip';
import Cryptr from 'cryptr';
import { AccountFloidWidgetDto } from 'src/user/dto/floid-widget.dto';
import { validate, ValidationError } from 'class-validator';
import { AccountFloidWidget } from 'src/user/interfaces/floid-widget';
import Twilio from 'twilio';

@Injectable()
export class AuthService {

  cryptr: any;
  twilioClient: any;

  constructor(
    @InjectModel('FloidAccountWidget') private readonly floidWidgetModel: Model<any>,
    @InjectModel('RefreshToken') private readonly refreshTokenModel: Model<RefreshToken>,
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {
    this.cryptr = new Cryptr(process.env.ENCRYPT_JWT_SECRET);
    this.twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  async createAccessToken(userId: string) {
    // const accessToken = this.jwtService.sign({userId});
    const accessToken = sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
    return this.encryptText(accessToken);
  }

  async createRefreshToken(req: Request, userId) {
    const refreshToken = new this.refreshTokenModel({
      userId,
      refreshToken: v4(),
      ip: this.getIp(req),
      browser: this.getBrowserInfo(req),
      country: this.getCountry(req),
    });
    await refreshToken.save();
    return refreshToken.refreshToken;
  }

  async findRefreshToken(token: string) {
    const refreshToken = await this.refreshTokenModel.findOne({ refreshToken: token });
    if (!refreshToken) {
      throw new UnauthorizedException('User has been logged out.');
    }
    return refreshToken.userId;
  }

  async validateUser(jwtPayload: JwtPayload): Promise<any> {
    const user = await this.userModel.findOne({ _id: jwtPayload.userId, verified: true });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    return user;
  }

  //   ┬┬ ┬┌┬┐  ┌─┐─┐ ┬┌┬┐┬─┐┌─┐┌─┐┌┬┐┌─┐┬─┐
  //   ││││ │   ├┤ ┌┴┬┘ │ ├┬┘├─┤│   │ │ │├┬┘
  //  └┘└┴┘ ┴   └─┘┴ └─ ┴ ┴└─┴ ┴└─┘ ┴ └─┘┴└─
  private jwtExtractor(request) {
    let token = null;
    if (request.header('x-token')) {
      token = request.get('x-token');
    } else if (request.headers.authorization) {
      token = request.headers.authorization.replace('Bearer ', '').replace(' ', '');
    } else if (request.body.token) {
      token = request.body.token.replace(' ', '');
    }
    if (request.query.token) {
      token = request.body.token.replace(' ', '');
    }
    const cryptr = new Cryptr(process.env.ENCRYPT_JWT_SECRET);
    if (token) {
      try {
        token = cryptr.decrypt(token);
      } catch (err) {
        throw new BadRequestException('Bad request.');
      }
    }
    return token;
  }

  async createAccountFloidWidget(createFloidAccount: AccountFloidWidgetDto): Promise<AccountFloidWidget> {
    try {
      const errors = await this.validateDto(createFloidAccount);
      if (errors.length > 0) {
        const errorMessage = this.formatValidationError(errors);
        throw new Error(`Los datos proporcionados no son válidos: ${errorMessage}`);
      }
      console.log('createFloidAccount', createFloidAccount);
      // Respuesta exitosa, save account
      const account = new this.floidWidgetModel(createFloidAccount);

      console.log(account);
      await this.isConsumerIsUnique(account.consumerId);
      const resp = await account.save();
      console.log(resp);
      const jsonString = JSON.stringify(createFloidAccount, null, 2);
      console.log('Cuenta desde floid creada con exito:', jsonString);
      // Lógica de autenticación aquí
      return resp;
      console.log('Autenticación Floid exitosa:', jsonString);
    } catch (error) {
      // Manejo de errores
      console.error('Error en la autenticación Floid:', error);
      throw error;
    }
  }

  private async validateDto(dto: any): Promise<ValidationError[]> {
    // Utiliza la función validate de class-validator para validar el DTO
    return await validate(dto);
  }

  private formatValidationError(errors: ValidationError[]): string {
    // Formatea los mensajes de error para que sean más legibles
    return errors.map(error => Object.values(error.constraints).join(', ')).join('; ');
  }

  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    console.log(phoneNumber)
    const message = await this.twilioClient.messages.create({
      body: `Tu código de verificación es: ${code}`,
      to: phoneNumber, // El número de teléfono del destinatario
      from: process.env.TWILIO_PHONE_NUMBER, // Tu número de Twilio
    });

    console.log(message.sid);
  }

  // ***********************
  // ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  // ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  // ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  // ***********************
  returnJwtExtractor() {
    return this.jwtExtractor;
  }

  getIp(req: Request): string {
    return getClientIp(req);
  }

  getBrowserInfo(req: Request): string {
    return req.header['user-agent'] || 'XX';
  }

  getCountry(req: Request): string {
    return req.header['cf-ipcountry'] ? req.header['cf-ipcountry'] : 'XX';
  }

  encryptText(text: string): string {
    return this.cryptr.encrypt(text);
  }


  // ********************************************
  // ╔═╗╦═╗╦╦  ╦╔═╗╔╦╗╔═╗  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  // ╠═╝╠╦╝║╚╗╔╝╠═╣ ║ ║╣   ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  // ╩  ╩╚═╩ ╚╝ ╩ ╩ ╩ ╚═╝  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  // ********************************************

  private async isConsumerIsUnique(consumerId: string) {
    const account = await this.floidWidgetModel.findOne({ consumerId: consumerId });
    console.log('account find?', account)
    if (account) {
      throw new BadRequestException('Account most be unique.');
    }
  }



}

