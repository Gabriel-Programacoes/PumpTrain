# Pumptrain - Backend API

## Descrição

Este projeto é a API backend para a aplicação Pumptrain, um rastreador de treinos de academia. Ele fornece endpoints RESTful para gerenciar usuários (autenticação, perfil), exercícios, sessões de treino (criação, listagem, detalhe, atualização, conclusão), estatísticas de usuário e um sistema básico de conquistas.

## Tecnologias Utilizadas

* **Linguagem:** Java 21+
* **Framework Principal:** Spring Boot 3.x
* **Persistência:** Spring Data JPA, Hibernate
* **Banco de Dados:** H2 Database (em arquivo, configurado para desenvolvimento)
* **Segurança:** Spring Security 6.x, JSON Web Tokens (JWT)
* **Mapeamento Objeto-Objeto:** MapStruct
* **Build Tool:** Maven
* **Utilitários:** Lombok (para redução de código boilerplate)
* **Validação:** Jakarta Bean Validation

## Funcionalidades Principais

* **Autenticação e Autorização:**
    * Registro de novos usuários (`name`, `email`, `password`).
    * Login de usuários com retorno de token JWT.
    * Proteção de endpoints baseada em autenticação JWT.
* **Gerenciamento de Perfil de Usuário:**
    * Busca de dados do perfil do usuário autenticado (`id`, `name`, `email`, `createdAt`, `age`, `height`, `weight`).
    * Atualização de dados do perfil do usuário autenticado (`name`, `age`, `height`, `weight`).
* **Gerenciamento de Exercícios:**
    * Listagem de todos os exercícios cadastrados (público).
    * Criação de novos exercícios (requer autenticação).
    * Deleção de exercícios (requer autenticação).
    * Inicialização de dados com exercícios de exemplo.
* **Gerenciamento de Sessões de Treino:**
    * Criação de novas sessões de treino (começam como não concluídas), incluindo atividades associadas (requer autenticação).
    * Listagem das sessões de treino do usuário autenticado.
    * Busca dos detalhes de uma sessão de treino específica (incluindo atividades e status de conclusão).
    * Atualização de uma sessão de treino existente (substituição completa dos dados da sessão e atividades).
    * Marcação de um treino como concluído (registra `completedAt`).
    * Deleção de uma sessão de treino (e suas atividades associadas via cascata).
    * Endpoint para buscar o "Treino do Dia" (treino mais recente agendado para hoje e ainda não concluído).
* **Estatísticas do Usuário:**
    * Endpoint para buscar estatísticas agregadas do usuário autenticado: total de treinos registrados, treinos concluídos no mês atual, sequência atual de dias de treino concluídos, recorde de sequência.
* **Conquistas (Achievements):**
    * Estrutura básica implementada para definir conquistas (`Achievement`) e registrar conquistas desbloqueadas por usuários (`UserAchievement`).
    * Endpoint para buscar um resumo das conquistas do usuário (total desbloqueado, total disponível, lista das mais recentes).
    * Inicialização de dados com definições de conquistas de exemplo.
    * *(Lógica para conceder conquistas automaticamente ainda não implementada).*

## Estrutura do Projeto

O projeto segue uma arquitetura em camadas padrão para aplicações Spring Boot:

* `com.pumptrain.pumptrain`
    * `config`: Classes de configuração (Spring Security, CORS, Inicializador de Dados, Filtro JWT, Propriedades JWT).
    * `controller`: Controladores REST (`AuthController`, `ExerciseController`, `WorkoutSessionController`, `ActivityLogController`, `UserController`).
        * `advice`: Handlers globais de exceção.
    * `dto`: Data Transfer Objects (`UserRegistrationDto`, `LoginRequestDto`, `UserProfileDto`, `UserProfileUpdateDto`, `UserStatsDto`, `AchievementDto`, `UserAchievementsDto`, `ExerciseDto`, `WorkoutSessionDto`, `ActivityLogDto`, etc.).
    * `entity`: Entidades JPA (`User`, `Exercise`, `WorkoutSession`, `ActivityLog`, `Achievement`, `UserAchievement`).
    * `exception`: Exceções customizadas (`DuplicateEmailException`).
    * `mapper`: Interfaces MapStruct (`ActivityLogMapper`, `ExerciseMapper`, `WorkoutSessionMapper`, `UserMapper`).
    * `repository`: Repositórios Spring Data JPA (`UserRepository`, `ExerciseRepository`, `WorkoutSessionRepository`, `ActivityLogRepository`, `AchievementRepository`, `UserAchievementRepository`).
    * `service`: Serviços com a lógica de negócio (`UserService`, `ExerciseService`, `WorkoutSessionService`, `JwtService`, `JpaUserDetailsService`, `AchievementService`).
    * `PumptrainApplication.java`: Classe principal.
* `src/main/resources`
    * `application.properties`: Arquivo de configuração principal.

## Configuração

As principais configurações estão no arquivo `src/main/resources/application.properties`:

* **Porta:** `9970` (ou a porta configurada).
* **Banco H2:** Arquivo em `./data/pumptraindb`, usuário `sa`, senha `password`.
* **Console H2:** Habilitado em `/h2-console`.
* **JWT:** Segredo e tempo de expiração configurados. **IMPORTANTE:** O segredo (`app.jwt.secret`) deve ser externalizado em produção.
* **DDL Auto:** `update` (Hibernate tenta atualizar o schema). Mudar para `validate` em produção é recomendado.
* **Logging:** Saída para console e arquivo `logs/pumptrain-app.log`.

## Como Executar

1.  **Pré-requisitos:** JDK 21+, Maven.
2.  **Compilar:** `mvn clean compile`
3.  **Executar:** `mvn spring-boot:run`
4.  **Acessar:** `http://localhost:9970` (ou a porta configurada)

## Banco de Dados (H2 Console)

1.  Aplicação rodando.
2.  Acesse `http://localhost:9970/h2-console`.
3.  Use as credenciais do `application.properties`:
    * **JDBC URL:** `jdbc:h2:file:./data/pumptraindb`
    * **User Name:** `sa`
    * **Password:** `password`
4.  Conecte-se para inspecionar as tabelas (`USERS`, `EXERCISES`, `WORKOUT_SESSIONS`, `ACTIVITY_LOGS`, `ACHIEVEMENTS`, `USER_ACHIEVEMENTS`) e executar SQL.

## Segurança

* Autenticação via JWT (Bearer Token no header `Authorization`).
* Senhas armazenadas com BCrypt.
* CORS configurado em `SecurityConfig.java` para permitir origens específicas do frontend.
* Endpoints protegidos exigindo autenticação, exceto `/auth/**`, `GET /api/exercises`, `/h2-console/**` e Swagger UI.

## API Endpoints Principais

| Método | Path                               | Auth? | Descrição                                                                              |
| :----- | :--------------------------------- | :---- | :------------------------------------------------------------------------------------- |
| POST   | `/auth/register`                   | Não   | Registra novo usuário.                                                                 |
| POST   | `/auth/login`                      | Não   | Autentica usuário, retorna token JWT.                                                  |
| GET    | `/api/exercises`                   | Não   | Lista todos os exercícios.                                                             |
| POST   | `/api/exercises`                   | Sim   | Cria um novo exercício.                                                                |
| DELETE | `/api/exercises/{id}`              | Sim   | Deleta um exercício.                                                                   |
| GET    | `/api/workouts`                    | Sim   | Lista os treinos do usuário logado.                                                    |
| POST   | `/api/workouts`                    | Sim   | Cria um novo treino (e suas atividades).                                               |
| GET    | `/api/workouts/{id}`               | Sim   | Busca detalhes de um treino específico.                                                |
| PUT    | `/api/workouts/{id}`               | Sim   | Atualiza um treino existente (substituição completa).                                  |
| DELETE | `/api/workouts/{id}`               | Sim   | Deleta um treino (e suas atividades).                                                  |
| POST   | `/api/workouts/{id}/complete`      | Sim   | Marca um treino como concluído (define `completedAt`).                                 |
| GET    | `/api/workouts/today`              | Sim   | Busca o "Treino do Dia" (mais recente de hoje, não concluído). Retorna 204 se não houver. |
| PUT    | `/api/activities/{id}`             | Sim   | Atualiza uma atividade específica (usado menos frequentemente, talvez).             |
| DELETE | `/api/activities/{id}`             | Sim   | Deleta uma atividade específica (usado menos frequentemente, talvez).              |
| GET    | `/api/user/profile`                | Sim   | Busca o perfil do usuário logado (`id`, `name`, `email`, `createdAt`, `age`...).     |
| PUT    | `/api/user/profile`                | Sim   | Atualiza o perfil do usuário logado (`name`, `age`, `height`, `weight`).                 |
| GET    | `/api/user/stats`                  | Sim   | Busca estatísticas do usuário (total treinos, mês atual, streaks).                   |
| GET    | `/api/user/achievements`           | Sim   | Busca resumo de conquistas do usuário (contagens, recentes).                           |

## Tratamento de Erros

* `GlobalExceptionHandler` captura exceções e retorna respostas JSON padronizadas (`ErrorResponseDto`) com status HTTP apropriados (400, 401, 403, 404, 409, 500).
