import swaggerJSDoc from "swagger-jsdoc";

const definition = {
  openapi: "3.0.0",
  info: {
    title: "Document Management API",
    version: "1.0.0",
    description:
      "API REST para gerenciamento de documentos com autenticação, autorização, upload, busca e auditoria.",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Servidor local de desenvolvimento",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "João Silva" },
          email: { type: "string", example: "joao@email.com" },
          password: { type: "string", example: "SenhaForte123" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "admin@example.com" },
          password: { type: "string", example: "senha-configurada-no-env" },
        },
      },
      UserResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["USER", "ADMIN"] },
          active: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      DocumentRequest: {
        type: "object",
        required: ["name", "description"],
        properties: {
          name: { type: "string", example: "Contrato de Prestação" },
          description: {
            type: "string",
            example: "Contrato referente ao serviço contratado pela empresa.",
          },
        },
      },
      DocumentResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          originalFileName: { type: "string" },
          mimeType: { type: "string" },
          fileSize: { type: "integer" },
          uploadedBy: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
            },
          },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          statusCode: { type: "integer" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/auth/register": {
      post: {
        summary: "Registrar novo usuário",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: { description: "Usuário criado com sucesso" },
          400: { description: "Dados inválidos" },
          409: { description: "E-mail já cadastrado" },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Realizar login",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: { description: "Login realizado com sucesso" },
          401: { description: "Credenciais inválidas" },
        },
      },
    },
    "/auth/me": {
      get: {
        summary: "Retorna os dados do usuário autenticado",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Dados do usuário autenticado" },
          401: { description: "Não autenticado" },
        },
      },
    },
    "/users": {
      get: {
        summary: "Lista usuários",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Lista de usuários" },
          403: { description: "Acesso negado" },
        },
      },
      post: {
        summary: "Cria um novo usuário",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: { description: "Usuário criado" },
          403: { description: "Somente administradores" },
        },
      },
    },
    "/documents": {
      get: {
        summary: "Lista documentos com busca e paginação",
        tags: ["Documents"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            required: false,
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
            required: false,
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
            required: false,
          },
        ],
        responses: {
          200: { description: "Lista de documentos" },
          401: { description: "Não autenticado" },
        },
      },
      post: {
        summary: "Cria um documento via upload",
        tags: ["Documents"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "description", "file"],
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Documento criado com sucesso" },
          415: { description: "Tipo de arquivo não permitido" },
          413: { description: "Arquivo excedeu o limite máximo" },
        },
      },
    },
    "/documents/{id}": {
      get: {
        summary: "Retorna um documento por identificador",
        tags: ["Documents"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Documento encontrado" },
          404: { description: "Documento não encontrado" },
        },
      },
      patch: {
        summary: "Atualiza um documento",
        tags: ["Documents"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DocumentRequest" },
            },
          },
        },
        responses: {
          200: { description: "Documento atualizado" },
          403: { description: "Somente administradores" },
        },
      },
      delete: {
        summary: "Exclui um documento",
        tags: ["Documents"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Documento excluído" },
          403: { description: "Somente administradores" },
        },
      },
    },
    "/documents/{id}/download": {
      get: {
        summary: "Faz download do documento",
        tags: ["Documents"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Arquivo enviado para download" },
          404: { description: "Documento não encontrado" },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJSDoc({
  definition,
  apis: [],
});
