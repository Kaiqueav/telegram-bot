<p align="center">
<a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
</p>

# Bot de Vendas para Telegram com NestJS e Mercado Pago

Um bot para Telegram robusto e escalável, construído com o framework **NestJS**, que automatiza a venda de planos de assinatura. A integração com o **Mercado Pago** permite a geração de cobranças PIX, com confirmação automática de pagamento e liberação de acesso a conteúdos ou grupos privados.

## Funcionalidades

- **Menu Interativo:** Navegação simples através de botões para visualização de planos, seção de dúvidas e contato para suporte.
- **Catálogo de Planos:** Exibe diferentes níveis de assinatura com descrição e preços.
- **Pagamento via PIX:** Gera um QR Code e um código "Copia e Cola" para pagamentos PIX através da API do Mercado Pago.
- **Confirmação Automática:** Utiliza webhooks do Mercado Pago para detectar pagamentos aprovados em tempo real.
- **Gerenciamento de Acesso:** Cadastra usuários e controla o acesso aos planos e seus respectivos benefícios, como a entrada em grupos privados.
- **Notificações Automáticas:** Envia mensagens de confirmação de pagamento e links de convite para grupos exclusivos no Telegram.
- **Base de Dados:** Persiste informações de usuários e pedidos utilizando PostgreSQL.

## Tecnologias Utilizadas

- **Backend:** NestJS
- **Interação com Telegram:** Telegraf / nestjs-telegraf
- **Gateway de Pagamento:** SDK do Mercado Pago
- **Banco de Dados:** PostgreSQL
- **ORM:** TypeORM
- **Containerização:** Docker

## Configuração e Instalação

Siga os passos abaixo para configurar e executar o projeto em seu ambiente de desenvolvimento.

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Docker e Docker Compose
- Ngrok para expor sua aplicação local e testar os webhooks.

### 1. Clonar o Repositório

```bash
git clone <url-do-seu-repositorio>
cd <nome-do-repositorio>
```
### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variaveis de ambientes
 Crie um arquivo .env na raiz do projeto com as seguintes variáveis:
```bash
# Token do seu bot no Telegram (obtido com o @BotFather)
TELEGRAM_BOT_TOKEN=SEU_TOKEN_AQUI

# Credenciais do Mercado Pago (Access Token)
MP_ACCESS_TOKEN=SEU_ACCESS_TOKEN_AQUI

# URL de conexão com o banco de dados PostgreSQL
DATABASE_URL=postgres://user:password@localhost:5432/telegram_bot_db

# ID do grupo privado para onde os membros serão convidados
PRIVATE_GROUP_ID=SEU_ID_DE_GRUPO_AQUI
```

### 4. Iniciar o Banco de Dados com Docker
  Com o Docker em execução, suba o container do PostgreSQL:
```bash
docker-compose up -d
```

### 5. Executar a Aplicação
  Para iniciar o bot em modo de desenvolvimento com hot-reload:
ngrok http 3000
A aplicação estará rodando em http://localhost:3000.

### 6. Configurar o Webhook do Mercado Pago
Para que o Mercado Pago possa notificar sua aplicação sobre o status dos pagamentos, você precisa de uma URL pública.

Inicie o ngrok para expor a porta 3000:
```bash
ngrok http 3000
```
Copie a URL "Forwarding" que termina com ngrok-free.app.

No painel de desenvolvedor do Mercado Pago, vá até a seção de Webhooks.

Cadastre a URL https://SUA_URL_DO_NGROK/mercadopago/webhook e selecione o evento "Pagamentos" (payment).



# Estrutura do Projeto
```bashs rc/app.module.ts:``` Módulo principal que organiza a aplicação.

```src/bot/:``` Contém a lógica principal do bot, lidando com comandos e ações dos usuários.

```src/mercado-pago/:``` Responsável pela integração com o Mercado Pago.

```src/order/:``` Gerencia a criação e atualização dos pedidos.

```src/user/:``` Gerencia o cadastro e as permissões dos usuários.

```src/notification/:``` Centraliza o envio de notificações para o usuário.

# Scripts Disponíveis
```npm run start:``` Inicia a aplicação em modo de produção.

 ```npm run start:dev:``` Inicia a aplicação em modo de desenvolvimento.

```npm run build:``` Compila o projeto.

```npm run format: ```Formata o código com o Prettier.

```npm run lint:``` Executa o linter no código.

```npm run test:``` Roda os testes unitários.