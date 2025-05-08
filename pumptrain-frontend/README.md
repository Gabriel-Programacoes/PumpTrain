# PumpTrain - Frontend

## Descrição

Este é o repositório do frontend para a aplicação PumpTrain, uma plataforma web moderna para acompanhamento de treinos de fitness. O objetivo é fornecer uma interface de usuário responsiva, intuitiva e funcional onde os usuários possam registrar, visualizar, editar e deletar seus treinos e atividades físicas.

## Tecnologias Utilizadas

O frontend é construído com um conjunto de tecnologias modernas para garantir performance, manutenibilidade e uma ótima experiência de desenvolvimento:

* **React:** Biblioteca JavaScript declarativa e baseada em componentes para construir interfaces de usuário interativas.
* **TypeScript:** Superset do JavaScript que adiciona tipagem estática, aumentando a robustez e a segurança do código.
* **Vite:** Ferramenta de build e servidor de desenvolvimento frontend extremamente rápida e moderna.
* **Material UI (MUI):** Biblioteca de componentes React que implementa o Material Design do Google. Usada extensivamente para UI, layout (Grid v2, Box, Stack, Container), inputs, feedback visual e theming.
    * **Theming:** Um tema customizado (principalmente escuro com detalhes em verde) está definido em `src/theme.ts`.
* **React Router DOM:** Biblioteca padrão para roteamento em aplicações React single-page, gerenciando a navegação entre as diferentes "páginas" da aplicação.
* **Axios:** Cliente HTTP baseado em Promises para realizar requisições à API backend. Uma instância configurada (`src/api/apiClient.ts`) inclui interceptors para adicionar tokens de autenticação e tratar erros básicos.
* **React Query (@tanstack/react-query):** Biblioteca poderosa para gerenciamento de estado do servidor (server state). Simplifica o fetching, caching, sincronização e atualização de dados da API, além de gerenciar o estado de mutações (criação, atualização, deleção).

## Funcionalidades Implementadas

* **Autenticação:** (Implícito - Hooks e API Client lidam com tokens). Páginas de Login/Cadastro (a serem criadas).
* **Dashboard/Listagem de Treinos (`MyWorkoutsPage`):** Exibe a lista de treinos do usuário em formato de Cards, com busca e ações rápidas (Editar/Deletar via menu). Inclui placeholders para estatísticas futuras.
* **Criação de Treino (`CreateWorkoutPage` / `WorkoutForm`):** Permite ao usuário registrar um novo treino, incluindo data, nome (opcional), notas (opcional) e uma lista dinâmica de atividades (exercício, séries, reps, peso, notas).
    * Utiliza o componente reutilizável `WorkoutForm` baseado em `react-hook-form` e `zod` para validação.
* **Detalhes do Treino (`WorkoutDetailPage`):** Exibe todas as informações de um treino específico, incluindo a lista detalhada das atividades realizadas. Permite Editar ou Deletar o treino.
* **Edição de Treino (`EditWorkoutPage`):** Reutiliza o `WorkoutForm` para permitir a modificação de treinos existentes, pré-preenchendo os dados atuais.
* **Exclusão de Treino:** Implementada com um dialog de confirmação e usando o hook `useDeleteWorkoutMutation`, com atualização automática da UI via invalidação de cache do React Query.
* **(Opcional) Landing Page:** Página inicial para apresentar a aplicação a novos usuários.

## Estrutura do Projeto (`src/`)

O código fonte está organizado da seguinte forma:

* `api/`: Contém a configuração do cliente Axios (`apiClient.ts`).
* `assets/`: Para imagens, fontes e outros arquivos estáticos.
* `components/`: Componentes React reutilizáveis (ex: `WorkoutForm.tsx`, `WorkoutCard.tsx`).
* `context/`: Context API do React (ex: `SnackbarProvider`).
* `hooks/`: Hooks customizados, principalmente para React Query (`useWorkoutsQuery`, `useWorkoutDetailQuery`, `useExercisesQuery`, `useCreateWorkoutMutation`, `useUpdateWorkoutMutation`, `useDeleteWorkoutMutation`).
* `pages/`: Componentes que representam as páginas completas da aplicação (ex: `MyWorkoutsPage.tsx`, `EditWorkoutPage.tsx`, `WorkoutDetailPage.tsx`).
* `types/`: Definições de interface TypeScript para os modelos de dados (ex: `Workout.ts`, `Activity.ts`, `Exercise.ts`).
* `theme.ts`: Definição do tema customizado do Material UI.
* `main.tsx` / `App.tsx`: Arquivos principais de inicialização, configuração de rotas e providers.

## Arquitetura e Conceitos Chave

* **Componentização:** A interface é dividida em componentes reutilizáveis.
* **Estado do Servidor:** Gerenciado de forma eficiente pelo React Query, separando o estado da API do estado local da UI. Os hooks customizados abstraem a lógica de comunicação e cache.
* **Tipagem:** O uso de TypeScript garante maior segurança e facilita a manutenção.
* **Cliente API Centralizado:** O `apiClient.ts` centraliza a configuração do Axios e a lógica de interceptors (autenticação JWT Bearer, tratamento básico de erros).
* **Roteamento:** Aplicação de página única (SPA) gerenciada pelo React Router DOM.
* **Estilização:** Primariamente com Material UI e a prop `sx` para customizações pontuais, seguindo o tema definido em `theme.ts`.

## Como Executar Localmente

Para executar este projeto frontend localmente, siga os passos:

1.  **Pré-requisitos:**
    * Node.js (versão LTS recomendada)
    * npm ou yarn

2.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/Gabriel-Programacoes/PumpTrain.git
    cd pumptrain-frontend
    ```

3.  **Instale as Dependências:**
    ```bash
    npm install
    # ou
    yarn install
    ```

4.  **Configure as Variáveis de Ambiente:**
    * Crie um arquivo `.env` na raiz do projeto.
    * Adicione as variáveis necessárias. No mínimo, a URL base da API:
        ```dotenv
        # Exemplo .env
        VITE_API_BASE_URL=http://localhost:9977/api
        ```
    * **Importante:** Modifique o arquivo `src/api/apiClient.ts` para ler esta variável em vez de ter a URL fixa:
        ```typescript
        // Em apiClient.ts
        const apiClient = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:9977/api", // Fallback opcional
            // ... headers ...
        });
        ```

5.  **Execute o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    # ou
    yarn dev
    ```
    Isso iniciará o servidor Vite, geralmente em `http://localhost:5173` (verifique a saída do terminal).

6.  **Execute o Backend:** Certifique-se de que a aplicação backend PUMPTRAIN esteja em execução e acessível na URL configurada no passo 4 (ex: `http://localhost:9977`).

## Contribuição

*(Opcional: Adicione diretrizes se o projeto for aberto a contribuições)*

## Licença

*(Opcional: Adicione a licença do seu projeto, ex: MIT)*
