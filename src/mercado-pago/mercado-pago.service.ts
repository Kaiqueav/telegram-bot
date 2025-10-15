import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export interface PixChargeResponse {
  paymentId: number;
  qrCodeBase64: string;
  pixCopyPaste: string;
}

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly client: MercadoPagoConfig;

  constructor(private configService: ConfigService) {
  
    const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('Mercado Pago Access Token not found in environment variables.');
    }

    this.client = new MercadoPagoConfig({ accessToken });
  }

  
  async createPixCharge(valor: number, email = 'user@test.com'): Promise<PixChargeResponse> {
    try {
      this.logger.log(`Creating PIX charge for amount: ${valor}`);
      
  
      const payment = new Payment(this.client);

      const body = {
        transaction_amount: valor, 
        description: 'Produto/Serviço via Bot Telegram', 
        payment_method_id: 'pix', 
        payer: {
          email: email,
        },
 
      };

    
      const response = await payment.create({ body });
      this.logger.log(`PIX charge created successfully with ID: ${response.id}`);

    
      const pixData = response.point_of_interaction.transaction_data;

      return {
        paymentId: response.id, 
        qrCodeBase64: pixData.qr_code_base64, 
        pixCopyPaste: pixData.qr_code, 
      };

    } catch (error) {

      this.logger.error('Failed to create PIX charge with Mercado Pago', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to generate PIX charge.');
    }
  }
  async getPaymentStatus(paymentId: number): Promise<string> {
        try {
            const payment = new Payment(this.client);
            const paymentDetails = await payment.get({ id: paymentId });
            this.logger.log(`Status for payment ${paymentId} is ${paymentDetails.status}`);
            return paymentDetails.status; // ex: "approved", "pending", "rejected"
        } catch (error) {
            this.logger.error(`Failed to get status for payment ${paymentId}`, error);
            throw new InternalServerErrorException('Failed to get payment status.');
        }
    }
}