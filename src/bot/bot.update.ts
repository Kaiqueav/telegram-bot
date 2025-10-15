import { Injectable, Logger } from '@nestjs/common';
import { Action, Ctx, Message, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { MercadoPagoService } from '../mercado-pago/mercado-pago.service';
import { OrderService } from 'src/order/order.service';
import { UserService } from 'src/user/user.service';


const plans = [
  {
    id: 'basic',
    name: 'Plano Básico',
    price: 9.90,
    description: 'Acesso por 30 dias às funcionalidades essenciais.',
  },
  {
    id: 'pro',
    name: 'Plano Pro',
    price: 29.90,
    description: 'Acesso ilimitado, suporte prioritário e relatórios avançados.',
  },
  {
    id: 'premium',
    name: 'Plano Premium',
    price: 49.90,
    description: 'Tudo do Pro mais consultoria individual mensal.',
  },
];

@Update()
@Injectable()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);
  
  constructor(
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly orderService: OrderService,
    private readonly userService: UserService
  ) {}

  @Start()
  async startCommand(@Ctx() ctx: Context) {
   
    const from = ctx.from;
     if (from) {
      await this.userService.findOrCreate(from.id, from.first_name, from.username);
    } 
    const welcomeMessage = from?.first_name
      ? `Olá, ${from.first_name}! Sou seu assistente virtual. Como posso ajudar?`
      : 'Olá! Sou seu assistente virtual. Como posso ajudar?';
      
    await ctx.reply(welcomeMessage, this.mainMenu());
  }
  


  @Action('PLANS')
  async onPlans(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    
    let message = '✨ *Nossos Planos*\n\n';
    const buttons = plans.map(plan => {
      message += `*${plan.name}* - R$ ${plan.price.toFixed(2)}\n`;
      message += `_${plan.description}_\n\n`;
  
      return [Markup.button.callback(`Adquirir ${plan.name} (R$ ${plan.price.toFixed(2)})`, `CHOOSE_PLAN_${plan.id}`)];
    });
   
    buttons.push([Markup.button.callback('⬅️ Voltar', 'MAIN_MENU')]);

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    });
  }


  @Action(/^CHOOSE_PLAN_(\w+)$/)
  async onChoosePlan(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    

    const planId = (ctx as any).match[1];
    const chosenPlan = plans.find(p => p.id === planId);
    
    if (!chosenPlan) {
      await ctx.reply('Plano não encontrado. Por favor, tente novamente.', this.mainMenu());
      return;
    }
    
      
    await ctx.reply(`Você escolheu o *${chosenPlan.name}*. Aguarde, estou gerando sua cobrança PIX...`, { parse_mode: 'Markdown' });
    
    try {
      
      const charge = await this.mercadoPagoService.createPixCharge(chosenPlan.price);
      
      const chatId = ctx.chat.id;
      await this.orderService.create(charge.paymentId, chatId, chosenPlan.id);
      this.logger.log(`Order created for chatId ${chatId} with paymentId ${charge.paymentId}`);
      
      const buffer = Buffer.from(charge.qrCodeBase64, 'base64');
      
      await ctx.replyWithPhoto({ source: buffer }, {
          caption: `PIX para pagamento do *${chosenPlan.name}* no valor de R$ ${chosenPlan.price.toFixed(2)}.`,
          parse_mode: 'Markdown',
      });

      await ctx.reply('Ou use o Pix Copia e Cola:');
      await ctx.reply(`\`${charge.pixCopyPaste}\``, { parse_mode: 'MarkdownV2' });

    } catch (error) {
      this.logger.error(`Erro ao gerar PIX para o plano ${planId}`, error);
      await ctx.reply('Desculpe, não consegui gerar sua cobrança. Tente novamente mais tarde.');
    }

  }

 

  @Action('FAQ')
  async onFaq(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      '🤖 *Dúvidas Frequentes*\n\nSelecione uma pergunta abaixo para ver a resposta.',
      {
        parse_mode: 'Markdown',
        ...this.faqMenu(),
      }
    );
  }

  @Action('FAQ_WHAT_IS_IT')
  async onFaqWhatIsIt(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    const message = 'Somos uma plataforma de automação que ajuda você a [descreva o que seu serviço faz]. Nossos planos oferecem diferentes níveis de acesso e suporte para atender às suas necessidades.';
    await ctx.reply(message, Markup.inlineKeyboard([
      [Markup.button.callback('⬅️ Voltar para Dúvidas', 'FAQ')]
    ]));
  }
  
  @Action('FAQ_PAYMENT_METHODS')
  async onFaqPaymentMethods(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    const message = 'No momento, aceitamos pagamentos exclusivamente via PIX para garantir a confirmação mais rápida e segura para você.';
    await ctx.reply(message, Markup.inlineKeyboard([
      [Markup.button.callback('⬅️ Voltar para Dúvidas', 'FAQ')]
    ]));
  }



  @Action('SUPPORT')
  async onSupport(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    const supportMessage = 
      '💬 *Falar com o Suporte*\n\n' +
      'Se você não encontrou a resposta para sua dúvida ou precisa de ajuda com um problema específico, entre em contato com nossa equipe:\n\n' +
      '📧 *E-mail:* `suporte@suaempresa.com.br`\n' +
      '🕒 *Horário de Atendimento:* Segunda a Sexta, das 9h às 18h.';
      
    await ctx.editMessageText(supportMessage, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Voltar', 'MAIN_MENU')]])
    });
  }

  

  @Action('MAIN_MENU')
  async onMainMenu(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.editMessageText('Como posso ajudar?', this.mainMenu());
  }
  

  private mainMenu() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('💎 Nossos Planos', 'PLANS')],
      [Markup.button.callback('🤖 Dúvidas Frequentes', 'FAQ')],
      [Markup.button.callback('💬 Falar com Suporte', 'SUPPORT')],
    ]);
  }

  private faqMenu() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('O que é este serviço?', 'FAQ_WHAT_IS_IT')],
      [Markup.button.callback('Quais são as formas de pagamento?', 'FAQ_PAYMENT_METHODS')],
    
      [Markup.button.callback('⬅️ Voltar ao Início', 'MAIN_MENU')],
    ]);
  }
}