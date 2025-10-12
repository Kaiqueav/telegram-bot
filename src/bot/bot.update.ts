import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Action, Ctx, Message, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { PixService } from '../pix/pix.service';

const userStates = new Map<number, 'awaiting_pix_value'>();

@Update()
@Injectable()
export class BotUpdate {
  constructor(
    private readonly pixService: PixService,
    private readonly configService: ConfigService,
  ) {}


  @Start()
  async startCommand(@Ctx() ctx: Context) {
    const nome = ctx.from.first_name;
    await ctx.reply(`Olá, ${nome}! Sou seu assistente virtual. Como posso te ajudar?`, this.mainMenu());
  }


  @Action('GERAR_PIX')
  async onGerarPix(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.reply('Qual o valor da cobrança? (ex: 25,50)');
    userStates.set(ctx.from.id, 'awaiting_pix_value');
  }


  @Action('VER_PLANOS')
  async onVerPlanos(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    const mensagemPlanos = `
*Nossos Planos*

*Básico - R$19,90/mês*
- Ideal para começar.

*Profissional - R$49,90/mês*
- Perfeito para escalar.

*Empresarial - R$99,90/mês*
- Solução completa.
    `;
    await ctx.replyWithMarkdown(mensagemPlanos, this.mainMenu());
  }

 
  @Action('SUPORTE')
  async onSuporte(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    const supportUrl = this.configService.get<string>('SUPPORT_CONTACT_URL');
    await ctx.reply(
      'Para falar com um de nossos atendentes, clique no botão abaixo.',
      Markup.inlineKeyboard([Markup.button.url('Iniciar Chat', supportUrl)]),
    );
  }

 
  @On('text')
  async onTextMessage(@Ctx() ctx: Context, @Message('text') message: string) {
    if (userStates.get(ctx.from.id) === 'awaiting_pix_value') {
      const valor = parseFloat(message.replace(',', '.'));
      userStates.delete(ctx.from.id);

      if (isNaN(valor) || valor <= 0) {
        await ctx.reply('Valor inválido. Por favor, tente novamente.', this.mainMenu());
        return;
      }
      
      await ctx.reply('Aguarde, estou gerando sua cobrança Pix...');
      try {
        const charge = await this.pixService.createImmediateCharge(valor);
        const qrCodeBuffer = Buffer.from(charge.qrCodeImage.replace('data:image/png;base64,', ''), 'base64');
        
        await ctx.replyWithPhoto({ source: qrCodeBuffer }, { caption: `QR Code para R$ ${valor.toFixed(2)}` });
        await ctx.reply('Pix Copia e Cola:');
        await ctx.reply(`\`${charge.pixCopyPaste}\``, { parse_mode: 'Markdown' });

      } catch (error) {
        await ctx.reply('Desculpe, não consegui gerar sua cobrança no momento.');
      }
    }
  }

  private mainMenu() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('💰 Gerar Cobrança Pix', 'GERAR_PIX')],
      [Markup.button.callback('📄 Ver Planos', 'VER_PLANOS')],
      [Markup.button.callback('👨‍💻 Falar com Suporte', 'SUPORTE')],
    ]);
  }
}