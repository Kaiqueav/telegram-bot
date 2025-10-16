// Copie e cole este código em src/mercado-pago/mercado-pago.controller.ts

import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';

@Controller('mercadopago')
export class MercadoPagoController {
  private readonly logger = new Logger(MercadoPagoController.name);

  // O construtor vazio está correto para este modo de debug.
  constructor() {}

  @Post('webhook')
  @HttpCode(200)
  // 1. O parâmetro agora se chama "rawBody" e é do tipo Buffer.
  // 2. Removemos o "@Res() res: Response".
  async handleWebhook(@Body() rawBody: Buffer) {
    try {
      this.logger.log('>>>>>>>>>> WEBHOOK ENDPOINT ATINGIDO <<<<<<<<<<');

      if (!rawBody || rawBody.length === 0) {
        this.logger.warn('ALERTA: Webhook recebido com BODY VAZIO.');
        return;
      }
      
      const bodyAsString = rawBody.toString('utf-8');
      this.logger.log(`CONTEÚDO DO BODY (RAW): ${bodyAsString}`);

      // 3. A nova variável "parsedBody" evita o conflito de nomes.
      const parsedBody = JSON.parse(bodyAsString);

      this.logger.log(`BODY APÓS PARSE: ${JSON.stringify(parsedBody, null, 2)}`);
      
      this.logger.log('>>>>>>>>>> PROCESSAMENTO DO WEBHOOK FINALIZADO (RAW DEBUG) <<<<<<<<<<');

    } catch (error) {
      this.logger.error('!!!!!! ERRO FATAL AO PROCESSAR O WEBHOOK !!!!!!');
      this.logger.error(`Erro: ${error.message}`, error.stack);
    }
  }
}