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
