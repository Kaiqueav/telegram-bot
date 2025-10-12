import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import EfiPay from 'gn-api-sdk-node';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PixService implements OnModuleInit {
  private efiPay: EfiPay;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const options = {
      client_id: this.configService.get<string>('EFI_CLIENT_ID'),
      client_secret: this.configService.get<string>('EFI_CLIENT_SECRET'),
      sandbox: this.configService.get<string>('EFI_SANDBOX') === 'true',
      certificate: fs.readFileSync(
        path.resolve(this.configService.get<string>('EFI_CERTIFICATE_PATH')),
      ),
    };
    this.efiPay = new EfiPay(options);
  }

  async createImmediateCharge(valor: number) {
    const body = {
      calendario: { expiracao: 3600 },
      valor: { original: valor.toFixed(2) },
      chave: this.configService.get<string>('PIX_KEY'),
      solicitacaoPagador: 'Cobrança gerada via Telegram Bot',
    };

    try {
      const chargeResponse = await this.efiPay.pixCreateImmediateCharge([], body);
      const qrCodeResponse = await this.efiPay.pixGenerateQRCode({ id: chargeResponse.loc.id });
      return {
        qrCodeImage: qrCodeResponse.imagemQrcode,
        pixCopyPaste: qrCodeResponse.qrcode,
      };
    } catch (error) {
      console.error('Erro ao criar cobrança Pix:', error);
      throw new Error('Não foi possível gerar a cobrança Pix.');
    }
  }
}