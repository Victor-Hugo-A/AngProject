# AngProject

<p align="center">
  <img src="https://img.shields.io/badge/Angular-20-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular 20" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white" alt="RxJS" />
  <img src="https://img.shields.io/badge/SCSS-Styling-CC6699?style=for-the-badge&logo=sass&logoColor=white" alt="SCSS" />
  <img src="https://img.shields.io/badge/JWT-Auth-black?style=for-the-badge" alt="JWT" />
  <img src="https://img.shields.io/badge/Karma-Tests-56C0C0?style=for-the-badge&logo=karma&logoColor=white" alt="Karma" />
</p>

<p align="center">
  Frontend desenvolvido em <strong>Angular</strong> para autenticação de usuários, abertura e acompanhamento de chamados, visualização de indicadores e gestão básica de perfil, com integração a um backend local via proxy HTTP.
</p>

---

## Sobre o projeto

O **AngProject** é uma aplicação frontend construída com **Angular 20** e arquitetura baseada em **componentes standalone**, voltada para um fluxo de atendimento com autenticação, dashboard do usuário e módulo de tickets.

O projeto foi estruturado para consumir um backend local, oferecendo recursos como:

- login e cadastro de usuário
- recuperação de senha
- proteção de rotas com autenticação
- dashboard com indicadores
- listagem, criação e detalhamento de tickets
- atualização básica de perfil
- área de knowledge base
- envio automático de token JWT nas requisições protegidas

---

## Destaque para portfólio

Este projeto demonstra na prática:

- desenvolvimento frontend com **Angular moderno**
- uso de **standalone components**
- navegação com **lazy loading por rota**
- autenticação com **JWT**
- proteção de rotas com **guard**
- interceptação de requisições HTTP
- integração com backend via **proxy local**
- uso de **Reactive Forms**
- feedback visual com **toasts**
- organização por páginas, serviços, tipos e componentes reutilizáveis

---

## Tecnologias utilizadas

- **Angular 20**
- **TypeScript**
- **RxJS**
- **SCSS**
- **Reactive Forms**
- **ngx-toastr**
- **Angular Router**
- **HTTP Client**
- **Karma / Jasmine**

---

## Funcionalidades

### Autenticação
- login
- cadastro de conta
- recuperação de senha
- persistência de sessão com token em `localStorage`
- redirecionamento automático para login em caso de `401`

### Tickets
- listagem paginada de chamados
- filtros por status, prioridade e categoria
- criação de novo ticket
- visualização de detalhes do ticket
- alteração de status
- atribuição de ticket ao usuário autenticado, conforme perfil

### Usuário
- dashboard inicial
- exibição de indicadores (KPIs)
- visualização e edição de perfil
- logout

### Navegação
- rotas públicas e protegidas
- fallback para login em rotas inválidas
- fluxo de acesso centralizado por guard

---

## Estrutura do projeto

```bash
src
├── app
│   ├── componente
│   ├── core
│   ├── guards
│   ├── pages
│   │   ├── forgot
│   │   ├── knowledge
│   │   ├── login
│   │   ├── profile
│   │   ├── signup
│   │   ├── tickets
│   │   │   ├── details
│   │   │   ├── list
│   │   │   └── new
│   │   └── user
│   ├── services
│   ├── types
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── app.html
│   ├── app.scss
│   └── app.ts
├── environments
│   └── environment.ts
├── styles
├── index.html
├── main.ts
└── styles.scss
```

---

## Arquitetura

### `pages`
Contém as telas principais da aplicação, separadas por contexto funcional.

### `services`
Centraliza autenticação, sessão, tickets, usuário e interceptação HTTP.

### `componente`
Guarda componentes reutilizáveis de interface, como cabeçalho, input customizado e topbar.

### `guards`
Controla acesso a rotas protegidas com base na presença de token.

### `environments`
Define configurações de ambiente, incluindo o `apiBaseUrl`.

---

## Rotas da aplicação

```ts
/login
/signup
/forgot
/user
/tickets
/tickets/new
/tickets/:id
/knowledge
/profile
```

### Regras de acesso

- `/login`, `/signup` e `/forgot` são rotas públicas
- `/user`, `/tickets`, `/tickets/new`, `/knowledge` e `/profile` exigem autenticação
- a rota inicial redireciona para `/login`
- rotas inválidas também redirecionam para `/login`

---

## Fluxo de autenticação

A autenticação é baseada em **JWT**.

### Como funciona

1. o usuário faz login ou cadastro
2. o token retornado é salvo no `localStorage`
3. os dados do usuário também são persistidos localmente
4. o interceptor adiciona `Authorization: Bearer <token>` nas rotas protegidas
5. em caso de resposta `401`, a sessão é limpa e o usuário é redirecionado para `/login`

### Chaves de sessão utilizadas

```ts
auth_token
auth_user
```

---

## Módulo de tickets

O projeto possui um fluxo de tickets com operações voltadas ao acompanhamento de chamados.

### Recursos implementados

- listagem paginada
- filtros por:
  - status
  - prioridade
  - categoria
- opção de visualizar apenas tickets relacionados ao usuário autenticado
- criação de novo chamado
- detalhamento do ticket
- alteração de status
- atribuição para o próprio usuário

### Status previstos

```ts
OPEN
IN_PROGRESS
RESOLVED
CLOSED
```

### Prioridades previstas

```ts
LOW
MEDIUM
HIGH
```

---

## Dashboard e perfil

A área `/user` funciona como tela principal após o login, com carregamento de:

- perfil do usuário autenticado
- indicadores resumidos de tickets
- atalhos para tickets, knowledge e perfil

A tela `/profile` permite:

- consultar dados atuais
- atualizar nome do usuário
- sincronizar o perfil com o backend

---

## Knowledge base

A rota `/knowledge` representa uma área de apoio ao usuário autenticado, integrada ao fluxo principal da aplicação e acessível apenas com sessão ativa.

---

## Componentes reutilizáveis

O projeto já utiliza componentes reaproveitáveis para melhorar a organização da interface, como:

- `Header`
- `PrimaryInput`
- `TopbarComponent`

Isso favorece manutenção, padronização visual e reaproveitamento entre páginas de autenticação e navegação interna.

---

## Integração com backend

O frontend foi configurado para trabalhar com backend local por meio de proxy.

### Configuração de ambiente

```ts
export const environment = {
  production: false,
  apiBaseUrl: '/api'
};
```

### Proxy local

```json
{
  "/auth": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/user": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  },
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### Principais endpoints consumidos

#### Autenticação
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/reset/request`
- `POST /auth/reset/confirm`

#### Usuário
- `GET /user`
- `PUT /user`

#### Tickets e indicadores
- `GET /api/tickets`
- `GET /api/tickets/:id`
- `POST /api/tickets`
- `PUT /api/tickets/:id`
- `PATCH /api/tickets/:id/status`
- `PATCH /api/tickets/:id/assignee`
- `GET /api/categories`
- `GET /api/kpis`

---

## Perfis e permissões

O projeto já considera papéis de acesso em alguns fluxos internos, especialmente no módulo de tickets.

### Perfis observados no código
- `SUPPORT`
- `ADMIN`

Esses perfis influenciam ações como atribuição de tickets e filtragem contextual.

---

## Como executar o projeto

### Pré-requisitos

Antes de iniciar, você precisa ter instalado:

- **Node.js**
- **npm**
- **Angular CLI**
- backend disponível em `http://localhost:8080`

---

### 1. Clone o repositório

```bash
git clone https://github.com/Victor-Hugo-A/AngProject.git
```

### 2. Acesse a pasta do projeto

```bash
cd AngProject
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm start
```

ou

```bash
ng serve
```

### 5. Acesse no navegador

```bash
http://localhost:4200
```

---

## Scripts disponíveis

```bash
npm start      # inicia o servidor de desenvolvimento
npm run build  # gera a build de produção
npm run watch  # build em modo watch para desenvolvimento
npm test       # executa os testes com Karma
```

---

## Build da aplicação

Para gerar a versão de produção:

```bash
npm run build
```

Os arquivos serão gerados no diretório `dist/`.

---

## Diferenciais técnicos

- uso de **Angular standalone**
- autenticação simples e objetiva com JWT
- interceptor centralizado para segurança
- organização clara entre páginas e serviços
- feedback visual com notificações
- fluxo funcional de tickets e perfil
- integração local desacoplada via proxy
- base pronta para expansão em sistema corporativo

---

## Pontos de evolução

Algumas melhorias que podem evoluir este projeto:

- refresh token
- expiração e renovação automática de sessão
- testes automatizados mais completos
- controle mais granular de autorização por perfil
- melhoria de acessibilidade
- responsividade mais refinada
- integração com deploy em produção
- internacionalização da interface

---

## Aprendizados aplicados

Este projeto reforça conhecimentos em:

- Angular moderno
- TypeScript
- Reactive Forms
- guards e interceptors
- autenticação JWT
- consumo de API REST
- organização de frontend escalável
- integração frontend + backend

---

## Autor

<p align="left">
  <a href="https://github.com/Victor-Hugo-A">
    <img src="https://img.shields.io/badge/GitHub-Victor--Hugo--A-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Victor Hugo A" />
  </a>
  <a href="https://www.linkedin.com/in/victor-hugo-a57b021ab/">
    <img src="https://img.shields.io/badge/LinkedIn-Victor%20Hugo-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn Victor Hugo" />
  </a>
</p>

---

## Status do projeto

🚧 Projeto em desenvolvimento, com base sólida para evolução de um sistema de autenticação e atendimento com tickets em Angular.
