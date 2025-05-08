# PumpTrain - Backend API

## Descrição

Este projeto é a API backend para a aplicação PumpTrain, um rastreador de treinos de academia. Ele fornece endpoints RESTful para gerenciar usuários, autenticação, exercícios, sessões de treino e os registros de atividades dentro dessas sessões.

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
    * Registro de novos usuários.
    * Login de usuários com retorno de token JWT.
    * Proteção de endpoints baseada em autenticação JWT.
* **Gerenciamento de Exercícios:**
    * Listagem de todos os exercícios cadastrados (público).
    * Criação de novos exercícios (requer autenticação).
    * Deleção de exercícios (requer autenticação).
    * Inicialização de dados com exercícios de exemplo.
* **Gerenciamento de Sessões de Treino:**
    * Criação de novas sessões de treino, incluindo atividades associadas (requer autenticação).
    * Listagem das sessões de treino do usuário autenticado.
    * Busca dos detalhes de uma sessão de treino específica (incluindo atividades).
    * Atualização de uma sessão de treino existente (incluindo substituição das atividades).
    * Deleção de uma sessão de treino (e suas atividades associadas via cascata).
* **Gerenciamento de Atividades (dentro das Sessões):**
    * Adição, atualização e deleção de atividades individuais associadas a uma sessão (endpoints separados em `ActivityLogController`, embora a criação/atualização principal ocorra via `WorkoutSessionController`).

## Estrutura do Projeto

O projeto segue uma arquitetura em camadas padrão para aplicações Spring Boot:

* `com.pumptrain.pumptrain`
    * `config`: Classes de configuração (Spring Security, CORS, Inicializador de Dados, Filtro JWT, Propriedades JWT).
    * `controller`: Controladores REST que expõem os endpoints da API e lidam com requisições/respostas HTTP.
        * `advice`: Handlers globais de exceção.
    * `dto`: Data Transfer Objects usados para definir a estrutura dos dados nas requisições e respostas da API, e para validação.
    * `entity`: Classes de entidade JPA que representam as tabelas do banco de dados.
    * `exception`: Classes de exceção customizadas.
    * `mapper`: Interfaces MapStruct para mapeamento entre Entidades e DTOs.
    * `repository`: Interfaces Spring Data JPA para acesso aos dados.
    * `service`: Classes de serviço que contêm a lógica de negócio da aplicação.
    * `PumptrainApplication.java`: Classe principal da aplicação Spring Boot.
* `src/main/resources`
    * `application.properties`: Arquivo de configuração principal.

## Configuração

As principais configurações estão no arquivo `src/main/resources/application.properties`:

* **Porta do Servidor:** `server.port=9970`
* **Banco de Dados H2:**
    * URL: `jdbc:h2:file:./data/pumptraindb` (arquivo na pasta `data` na raiz do projeto)
    * Usuário: `sa`
    * Senha: `password`
* **Console H2:** Habilitado em `/h2-console`
* **JWT:**
    * Segredo (`app.jwt.secret`): Chave usada para assinar os tokens. **IMPORTANTE:** Em produção, este valor NUNCA deve estar hardcoded no arquivo. Use variáveis de ambiente ou um sistema de gerenciamento de segredos.
    * Expiração (`app.jwt.expiration-ms`): Tempo de validade do token em milissegundos.
* **Logging:** Configurado para nível INFO para a aplicação e WARN para o root, com saída para o arquivo `logs/pumptrain-app.log`.

## Como Executar

1.  **Pré-requisitos:**
    * JDK 21 ou superior instalado.
    * Maven instalado.
2.  **Clonar o Repositório:** (Se aplicável)
    ```bash
    git clone https://github.com/Gabriel-Programacoes/PumpTrain.git
    cd pumptrain-backend
    ```
3.  **Compilar o Projeto:**
    ```bash
    mvn clean compile
    ```
4.  **Executar a Aplicação:**
    ```bash
    mvn spring-boot:run
    ```
    A aplicação estará disponível em `http://localhost:9977`.

## Banco de Dados (H2 Console)

Durante o desenvolvimento, você pode acessar o console web do H2 para inspecionar o banco de dados:

1.  Com a aplicação rodando, acesse `http://localhost:9970/h2-console` no seu navegador.
2.  Use as seguintes credenciais (do `application.properties`):
    * **JDBC URL:** `jdbc:h2:file:./data/pumptraindb`
    * **User Name:** `sa`
    * **Password:** `password`
3.  Clique em "Connect". Você poderá ver as tabelas e executar queries SQL.

## Segurança

* A autenticação é feita via JWT. O cliente deve enviar o token JWT obtido no login no cabeçalho `Authorization` como `Bearer <token>` para acessar endpoints protegidos.
* As senhas dos usuários são armazenadas usando BCrypt.
* A configuração de CORS permite requisições de origens específicas (configuradas em `SecurityConfig.java`), essencial para integração com frontend.

## API Endpoints

Aqui estão os principais endpoints da API:

| Método HTTP | Path                     | Autenticação? | Descrição                                                                 | Controller                         |
| :---------- | :----------------------- | :------------ | :------------------------------------------------------------------------ | :--------------------------------- |
| POST        | `/auth/register`         | Não           | Registra um novo usuário.                                                   | `AuthController`         |
| POST        | `/auth/login`            | Não           | Autentica um usuário e retorna um token JWT.                              | `AuthController`         |
| GET         | `/api/exercises`         | Não           | Lista todos os exercícios cadastrados.                                    | `ExerciseController`     |
| POST        | `/api/exercises`         | Sim           | Cria um novo exercício.                                                   | `ExerciseController`     |
| DELETE      | `/api/exercises/{id}`    | Sim           | Deleta um exercício existente.                                            | `ExerciseController`     |
| GET         | `/api/workouts`          | Sim           | Lista as sessões de treino do usuário autenticado.                        | `WorkoutSessionController` |
| POST        | `/api/workouts`          | Sim           | Cria uma nova sessão de treino (incluindo atividades).                    | `WorkoutSessionController` |
| GET         | `/api/workouts/{id}`     | Sim           | Busca os detalhes de uma sessão de treino específica (inclui atividades). | `WorkoutSessionController` |
| PUT         | `/api/workouts/{id}`     | Sim           | Atualiza uma sessão de treino existente (substituição completa).        | `WorkoutSessionController` |
| DELETE      | `/api/workouts/{id}`     | Sim           | Deleta uma sessão de treino (e suas atividades).                          | `WorkoutSessionController` |
| PUT         | `/api/activities/{id}`   | Sim           | Atualiza uma atividade específica.                                        | `ActivityLogController`    |
| DELETE      | `/api/activities/{id}`   | Sim           | Deleta uma atividade específica.                                          | `ActivityLogController`    |

_(Nota: A criação de atividades também ocorre implicitamente via `POST /api/workouts`)_

## Tratamento de Erros

* Um `GlobalExceptionHandler` intercepta exceções comuns e customizadas, retornando respostas de erro padronizadas no formato `ErrorResponseDto` com status HTTP apropriados (400, 401, 403, 404, 409, 500).
* Erros de validação de DTOs retornam status 400 com detalhes sobre os campos inválidos.
