# Document Management API

API REST para gestão documental de uma empresa, com autenticação, autorização por papel, upload de arquivos, busca, paginação, auditoria e documentação Swagger. O projeto foi pensado para ser um backend pronto para portfólio e para futuras integrações com frontend.

## Funcionalidades

- Cadastro e login de usuários com JWT
- Controle de acesso por role: USER e ADMIN
- Upload de documentos em formatos permitidos
- Listagem, busca, paginação, edição, exclusão e download de documentos
- Armazenamento dos arquivos na pasta uploads/
- Registro de auditoria para upload, atualização, exclusão e download
- Tratamento global de erros com respostas padronizadas
- Prisma com PostgreSQL
- Swagger/OpenAPI
- Seed para criação de usuário administrador

## Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt
- Zod
- Multer
- Swagger/OpenAPI
- dotenv
- Vitest

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- Docker e Docker Compose (opcional, mas recomendado)
- npm

## Estrutura do projeto

```text
src/
├── app.ts
├── server.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   └── document.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── document.service.ts
│   └── audit.service.ts
├── routes/
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   └── document.routes.ts
├── middlewares/
│   ├── auth.middleware.ts
│   ├── admin.middleware.ts
│   ├── upload.middleware.ts
│   └── error.middleware.ts
├── schemas/
│   ├── auth.schema.ts
│   ├── user.schema.ts
│   ├── document.schema.ts
│   └── common.schema.ts
├── lib/
│   └── prisma.ts
├── types/
│   └── express.d.ts
├── docs/
│   └── swagger.ts
└── utils/
prisma/
├── schema.prisma
├── seed.ts
docker-compose.yml
Dockerfile
uploads/
.env
.env.example
.gitignore
README.md
package.json
tsconfig.json
```

## Configuração inicial

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o arquivo de ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo:

```env
DATABASE_URL="postgresql://postgres:<SUA_SENHA>@localhost:5432/document_management_api?schema=public"
JWT_SECRET="<SEGREDO_ALEATORIO_FORTE>"
PORT=4000
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=5242880
NODE_ENV="development"
```

> Ajuste a senha para a sua instalação local do PostgreSQL. Se estiver usando Docker Compose, o host do banco será `postgres` em vez de `localhost`.

### 3. Preparar o banco

```bash
npx prisma migrate dev --name init
npm run prisma:seed
```

### 4. Iniciar a API

```bash
npm run dev
```

Em seguida, a API ficará disponível em:

```text
http://localhost:4000
```

Swagger:

```text
http://localhost:4000/docs
```

## Opção A: iniciar com Docker Compose

### 1. Subir PostgreSQL + API

```bash
docker compose up --build
```

Isso irá:

- criar o PostgreSQL
- gerar o cliente Prisma
- rodar as migrations
- executar o seed
- iniciar a API em modo de desenvolvimento

### 2. Acessar a API

```text
http://localhost:4000
```

### 3. Acessar o Swagger

```text
http://localhost:4000/docs
```

### 4. Parar os containers

```bash
docker compose down
```

### 5. Remover volumes do banco

```bash
docker compose down -v
```

## Opção B: iniciar localmente sem Docker

### 1. Criar o banco PostgreSQL

```sql
CREATE DATABASE document_management_api;
```

### 2. Ajustar o `.env`

Use a URL do banco conforme sua instalação local:

```env
DATABASE_URL="postgresql://postgres:<SUA_SENHA>@localhost:5432/document_management_api?schema=public"
```

### 3. Rodar as migrations

```bash
npx prisma migrate dev --name init
```

### 4. Rodar o seed

```bash
npm run prisma:seed
```

### 5. Iniciar a API

```bash
npm run dev
```

## Seed do administrador

O comando `npm run prisma:seed` cria automaticamente um usuário ADMIN para desenvolvimento:

- Nome: Administrador
- Email: admin@example.com
- Senha: [REDACTED_TEST_PASSWORD]

> Essa senha é apenas para ambiente de desenvolvimento. Em produção, altere a senha antes de expor o sistema.

## Validação local

O projeto foi validado localmente com banco PostgreSQL ativo e testes reais da API:

```bash
$env:RUN_DB_TESTS='true'; npm test
```

Resultado verificado: 13 testes passaram com sucesso.

## Migrations

```bash
npx prisma migrate dev
```

Ou para ambiente de produção:

```bash
npx prisma migrate deploy
```

## Migrations

```bash
npx prisma migrate dev
```

Ou para ambiente de produção:

```bash
npx prisma migrate deploy
```

## Swagger

Após iniciar a API, abra:

```text
http://localhost:4000/docs
```

A documentação inclui:

- Auth
- Users
- Documents
- autenticação Bearer Token
- upload multipart/form-data
- respostas e erros padronizados

## Autenticação

### Registrar usuário

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Souza",
    "email": "maria@email.com",
    "password": "SenhaForte123"
  }'
```

### Fazer login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "[REDACTED_TEST_PASSWORD]"
  }'
```

## Endpoints principais

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Usuários

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `PATCH /api/users/:id/disable`
- `PATCH /api/users/:id/enable`
- `DELETE /api/users/:id`

### Documentos

- `POST /api/documents`
- `GET /api/documents`
- `GET /api/documents/:id`
- `PATCH /api/documents/:id`
- `DELETE /api/documents/:id`
- `GET /api/documents/:id/download`

## Upload e pesquisa

### Upload de documento

```bash
curl -X POST http://localhost:4000/api/documents \
  -H "Authorization: Bearer <token>" \
  -F "name=Contrato de Prestação" \
  -F "description=Contrato referente ao serviço contratado pela empresa." \
  -F "file=@./contrato.pdf"
```

### Busca e paginação

```bash
curl "http://localhost:4000/api/documents?search=contrato&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

## Tratamento de erros

A API responde em padrão consistente:

```json
{
  "success": false,
  "message": "Documento não encontrado",
  "statusCode": 404
}
```

Códigos tratados:

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 413 Payload Too Large
- 415 Unsupported Media Type
- 500 Internal Server Error

## Observações importantes

- Não exponha a senha real em produção; use variáveis de ambiente seguras.
- O diretório `uploads/` deve ter permissão de escrita pelo processo da aplicação.
- Para Docker, os arquivos enviados são montados em volume local, permitindo persistência entre reinicializações.
- O PostgreSQL em desenvolvimento usa as credenciais padrão do compose: `postgres/postgres`.
- Em ambiente real, prefira usar uma senha forte, secrets gerenciados e um banco separado por ambiente.
- O projeto está pronto para ser consumido por frontend em React, React Native, Angular ou outro cliente.

## Testes

```bash
npm test
```

Os testes incluem fluxos principais como:

- cadastro
- login
- acesso sem JWT
- autenticação e autorização
- criação e edição de documentos
- busca, download e exclusão

## Como rodar em produção

```bash
npm run build
npm start
```

> Em produção, recomenda-se manter o banco fora do contêiner e configurar um secret forte para `JWT_SECRET`.
