import { Controller, Logger, Post, HttpCode, Req } from '@nestjs/common';
import { Request } from 'express'; 

@Controller('mercadopago')
export class MercadoPagoController {
  private readonly logger = new Logger(MercadoPagoController.name);

  constructor() {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Req() req: Request) { 
    try {
      this.logger.log('>>>>>>>>>> WEBHOOK ENDPOINT ATINGIDO <<<<<<<<<<');

      const rawBody = req.body;

      if (!rawBody || !(rawBody instanceof Buffer) || rawBody.length === 0) {
        this.logger.warn('ALERTA: Webhook recebido sem corpo ou com corpo inválido.');
        return;
      }
      
      const bodyAsString = rawBody.toString('utf-8');
      this.logger.log(`CONTEÚDO DO BODY (RAW): ${bodyAsString}`);

      const parsedBody = JSON.parse(bodyAsString);
      this.logger.log(`BODY APÓS PARSE: ${JSON.stringify(parsedBody, null, 2)}`);
      
      this.logger.log('>>>>>>>>>> PROCESSAMENTO DO WEBHOOK FINALIZADO (RAW DEBUG) <<<<<<<<<<');

    } catch (error) {
      this.logger.error('!!!!!! ERRO FATAL AO PROCESSAR O WEBHOOK !!!!!!');
      this.logger.error(`Erro: ${error.message}`, error.stack);
    }
  }
}