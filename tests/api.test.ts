import request from "supertest";
import bcrypt from "bcrypt";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../src/app";
import { prisma } from "../src/lib/prisma";

const shouldRunDatabaseTests =
  process.env.RUN_DB_TESTS === "true" &&
  Boolean(process.env.DATABASE_URL && process.env.JWT_SECRET);

describe.skipIf(!shouldRunDatabaseTests)("Document Management API", () => {
  let adminToken = "";
  let userToken = "";
  let createdUserId = "";
  let createdDocumentId = "";

  beforeAll(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.document.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.create({
      data: {
        name: "Administrador",
        email: "admin@example.com",
        password: await bcrypt.hash("[REDACTED_TEST_PASSWORD]", 10),
        role: "ADMIN",
        active: true,
      },
    });

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "[REDACTED_TEST_PASSWORD]" });

    adminToken = adminLogin.body.token;

    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "João Usuário",
        email: "joao@email.com",
        password: "SenhaForte123",
      });

    createdUserId = registerResponse.body.user.id;

    const userLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "joao@email.com", password: "SenhaForte123" });

    userToken = userLogin.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("registers a new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Maria Teste",
      email: "maria@email.com",
      password: "SenhaForte123",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe("maria@email.com");
  });

  it("logs in with valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "joao@email.com", password: "SenhaForte123" });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
  });

  it("rejects invalid password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "joao@email.com", password: "wrong-password" });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Credenciais inválidas");
  });

  it("rejects disabled user login", async () => {
    await prisma.user.update({
      where: { email: "joao@email.com" },
      data: { active: false },
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "joao@email.com", password: "SenhaForte123" });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Usuário desabilitado");

    await prisma.user.update({
      where: { email: "joao@email.com" },
      data: { active: true },
    });
  });

  it("requires JWT for protected routes", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
  });

  it("blocks USER from ADMIN route", async () => {
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });

  it("creates a document", async () => {
    const response = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "Contrato de Prestação")
      .field(
        "description",
        "Contrato referente ao serviço contratado pela empresa.",
      )
      .attach("file", "README.md");

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    createdDocumentId = response.body.document.id;
  });

  it("rejects document without description", async () => {
    const response = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "Documento sem descrição")
      .attach("file", "README.md");

    expect(response.status).toBe(400);
  });

  it("rejects invalid upload type", async () => {
    const response = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "Arquivo inválido")
      .field("description", "Arquivo com extensão não permitida")
      .attach("file", "package.json");

    expect(response.status).toBe(415);
  });

  it("searches documents", async () => {
    const response = await request(app)
      .get("/api/documents?search=contrato&page=1&limit=10")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.total).toBeGreaterThan(0);
  });

  it("updates a document", async () => {
    const response = await request(app)
      .patch(`/api/documents/${createdDocumentId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Contrato atualizado",
        description: "Descrição atualizada",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Documento atualizado com sucesso");
  });

  it("downloads a document", async () => {
    const response = await request(app)
      .get(`/api/documents/${createdDocumentId}/download`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  it("deletes a document", async () => {
    const response = await request(app)
      .delete(`/api/documents/${createdDocumentId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Documento excluído com sucesso");
  });
});
