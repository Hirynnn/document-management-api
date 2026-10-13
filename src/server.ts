import app from "./app";

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`🚀 API running on http://localhost:${port}`);
  console.log(`📚 Swagger available at http://localhost:${port}/docs`);
});
