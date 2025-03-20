import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import dotenv from 'dotenv';


const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
// Çevre değişkenlerini yükle
dotenv.config();

const app = express();

// JSON ve URL-encoded parser middleware'leri
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI'ı sadece geliştirme ortamında aktif et
if (process.env.NODE_ENV === 'development') {
  // API dokümantasyonu endpoint'i
  app.use("/api-docs", swaggerUi.serve);
  app.get("/api-docs", swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "SportLink API Dokümantasyonu"
  }));

  // API dokümantasyonu JSON endpoint'i
  app.get("/api-docs.json", (_, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

// Ana API rotaları için prefix
const apiRouter = express.Router();
const API_PREFIX = process.env.API_PREFIX || '/api/v1';
app.use(API_PREFIX, apiRouter);

// Örnek endpoint
apiRouter.get("/", (_, res) => {
  res.json({ 
    message: "SportLink API V1",
    environment: process.env.NODE_ENV
  });
});

// Kök yolu endpoint'i
app.get("/", (_, res) => {
  if (process.env.NODE_ENV === 'development') {
    res.redirect("/api-docs");
  } else {
    res.json({ message: "SportLink API" });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`API Dokümantasyonu: ${BASE_URL}/api-docs`);

});

export default app;
