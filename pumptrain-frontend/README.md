# PUMPTRAIN - Frontend

![PumpTrain Logo Placeholder](https://via.placeholder.com/150/77cc88/06070e?text=PUMPTRAIN)
*(Substitua por um logo real, se tiver)*

Frontend da aplicação web PUMPTRAIN, uma plataforma moderna para acompanhamento e gerenciamento de treinos de fitness.

---

## 📜 Descrição

PUMPTRAIN é uma Single Page Application (SPA) construída com React e TypeScript, focada em fornecer uma interface de usuário rica, responsiva e performática. Ela permite aos usuários registrar seus treinos, acompanhar o progresso, visualizar estatísticas, gerenciar o perfil e (futuramente) interagir com uma comunidade ou desafios. O design segue um tema escuro customizado utilizando Material UI.

---

## ✨ Funcionalidades Principais

* **Autenticação de Usuário:** Fluxo de Login e Registro (páginas e lógica de contexto).
* **Dashboard Principal:** Visão geral com estatísticas chave (Sequência, Contagem de Treinos, Metas, etc. - parcialmente conectado a dados reais) e exibição do "Treino do Dia".
* **Gerenciamento de Treinos (CRUD):**
    * Listagem e visualização de treinos passados.
    * Criação de novos treinos com detalhes de atividades (exercício, séries, reps, peso, notas).
    * Visualização detalhada de um treino específico.
    * Edição de treinos existentes.
    * Exclusão de treinos com confirmação.
* **Gerenciamento de Perfil:** Visualização e edição de informações do usuário (Nome, Email, Idade, Altura, Peso).
* **(Planejado/Parcial)** Listagem e Visualização de Exercícios Gerais.
* **(Planejado/Parcial)** Sistema de Conquistas (Achievements).
* **Landing Page:** Página de apresentação para novos usuários.
* **Design Responsivo:** Adaptável a diferentes tamanhos de tela (desktop, mobile).
* **Tema Escuro:** Interface padronizada com tema escuro e acentos na cor primária.

---

## 🚀 Tecnologias Utilizadas

* **React (v18+):** Biblioteca JavaScript para construção de interfaces de usuário.
* **TypeScript:** Superset tipado do JavaScript para maior robustez e manutenibilidade.
* **Vite:** Build tool e servidor de desenvolvimento frontend de alta performance.
* **Material UI (MUI) v5/v6:** Biblioteca de componentes UI baseada no Material Design.
    * **Core:** `@mui/material` para componentes (Box, Container, Grid v2, Card, Button, TextField, etc.).
    * **Icons:** `@mui/icons-material` para iconografia.
    * **Styles:** `@mui/material/styles` para `styled` e `ThemeProvider`.
    * **Date Pickers:** `@mui/x-date-pickers` para seleção de datas.
* **React Router DOM (v6):** Para roteamento declarativo no lado do cliente (SPA).
* **TanStack Query (React Query) v4/v5:** Gerenciamento de estado do servidor (fetching, caching, mutações, invalidação).
* **Axios:** Cliente HTTP para comunicação com a API backend.
* **React Hook Form:** (Usado em `WorkoutForm`, `ProfilePage`) Para gerenciamento de formulários e validação.
* **Zod:** (Usado com React Hook Form) Para validação de schemas com inferência de tipo.
* **Day.js:** Biblioteca leve para manipulação e formatação de datas.
* **ESLint / Prettier:** Ferramentas para padronização e qualidade de código (configuração não fornecida, mas recomendada).

---

## 📁 Estrutura do Projeto (`src/`)

src
├── api/               # Configuração do Axios (apiClient.ts)
├── assets/            # Imagens, fontes, etc.
├── components/        # Componentes React reutilizáveis (Layout, UserMenu, WorkoutList, Cards, etc.)
│   ├── landing/       # Componentes específicos da Landing Page
│   └── layout/        # Componentes do Layout principal (Header, etc)
├── context/           # Context API (AuthContext, SnackbarProvider)
├── hooks/             # Hooks customizados (React Query: useWorkoutsQuery, useUserProfileQuery, etc.)
├── pages/             # Componentes de página completos (Dashboard, ProfilePage, WorkoutDetailPage, etc.)
├── types/             # Definições de Interface TypeScript (user.ts, workout.ts, etc.)
├── utils/             # Funções utilitárias (formatDate.ts, etc.)
├── App.tsx            # Configuração principal de rotas e providers globais
├── main.tsx           # Ponto de entrada da aplicação React
└── theme.ts           # Definição do tema MUI

---

## 🏗️ Arquitetura e Conceitos Chave

* **Single Page Application (SPA):** Interface renderizada no cliente com navegação gerenciada pelo React Router.
* **Component-Based:** UI construída com componentes funcionais React reutilizáveis.
* **Server State Management:** TanStack Query (React Query) é usado para gerenciar dados assíncronos da API, cache, e atualizações otimistas/invalidação, desacoplando o estado do servidor da lógica da UI. Hooks customizados abstraem as chamadas de query/mutation.
* **Client State Management:** Context API (`AuthContext`, `SnackbarProvider`) para estado global, `useState` para estado local de componentes.
* **API Client:** Instância centralizada do Axios (`apiClient.ts`) com `baseURL` configurável e interceptors para adicionar o token JWT `Bearer` e logar erros de resposta.
* **Styling:** Material UI com um tema escuro centralizado (`theme.ts`). Customizações pontuais via prop `sx` e componentes `styled` para padrões de layout específicos (como no `Layout`).
* **Forms:** React Hook Form para gerenciamento eficiente do estado e validação de formulários (Perfil, Criação/Edição de Treino), frequentemente combinado com Zod para schemas de validação.
* **Routing:** Estrutura de rotas definida em `App.tsx`, utilizando rotas aninhadas, `Layout` compartilhado e `ProtectedRoute` para controle de acesso.

---

## ⚙️ Como Executar Localmente

Siga estas instruções para configurar e executar o projeto frontend na sua máquina.

**Pré-requisitos:**

* Node.js (v18 ou superior recomendado)
* NPM ou Yarn

**Passos:**

1.  **Clonar o Repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO_FRONTEND>
    cd <NOME_DA_PASTA_DO_PROJETO>
    ```

2.  **Instalar Dependências:**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configurar Variáveis de Ambiente:**
    * Crie um arquivo chamado `.env` na raiz do projeto.
    * Adicione a URL base da sua API backend. **Certifique-se de que seu backend esteja rodando e acessível nesta URL.** (O padrão que vimos nos logs foi `http://localhost:9970`).
        ```dotenv
        # .env
        VITE_API_BASE_URL=http://localhost:9970/api
        ```
    * **Importante:** Garanta que seu `src/api/apiClient.ts` esteja lendo esta variável:
        ```typescript
        // src/api/apiClient.ts
        const apiClient = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:9970/api", // Fallback opcional
            // ...
        });
        ```

4.  **Executar o Backend:** Inicie sua aplicação backend PUMPTRAIN separadamente. Ela precisa estar rodando para que o frontend possa fazer as chamadas API.

5.  **Executar o Frontend (Modo de Desenvolvimento):**
    ```bash
    npm run dev
    # ou
    yarn dev
    ```
    * O servidor Vite será iniciado. Abra seu navegador e acesse o endereço fornecido (geralmente `http://localhost:5173`).

---

## scripts Disponíveis

No diretório do projeto, você pode executar:

* `npm run dev` / `yarn dev`: Inicia o servidor de desenvolvimento Vite com Hot Module Replacement (HMR).
* `npm run build` / `yarn build`: Compila a aplicação para produção na pasta `dist/`.
* `npm run lint` / `yarn lint`: Executa o ESLint para verificar erros de código e estilo (se configurado).
* `npm run preview` / `yarn preview`: Inicia um servidor local simples para pré-visualizar a build de produção.

---

*(Opcional: Adicione seções sobre Contribuição e Licença aqui)*

