import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SHOP.CO API",
      version: "1.0.0",
      description: "SHOP.CO backend uchun API dokumentatsiya",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local server",
      },
      {
        url: "https://shop-co-backend-new.onrender.com",
        description: "Production server",
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
        Product: {
          type: "object",
          properties: {
            _id: { type: "string", example: "664a1f2e3b4c5d6e7f8a9b0c" },
            name: { type: "string", example: "Polo Shirt" },
            price: { type: "number", example: 29.99 },
            category: { type: "string", example: "men" },
            type: { type: "string", example: "shirt" },
            colors: { type: "array", items: { type: "string" }, example: ["red", "blue"] },
            size: { type: "array", items: { type: "string" }, example: ["S", "M", "L"] },
            images: { type: "array", items: { type: "string" }, example: ["https://res.cloudinary.com/..."] },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            firstName: { type: "string", example: "Ali" },
            lastName: { type: "string", example: "Valiyev" },
            email: { type: "string", example: "ali@gmail.com" },
            role: { type: "string", example: "user" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Ro'yxatdan o'tish va kirish" },
      { name: "Products", description: "Mahsulotlar CRUD" },
      { name: "Types", description: "Mahsulot turlari" },
    ],
    paths: {
      // ── AUTH ──────────────────────────────────────────────
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Ro'yxatdan o'tish",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["firstName", "lastName", "email", "password"],
                  properties: {
                    firstName: { type: "string", example: "Ali" },
                    lastName: { type: "string", example: "Valiyev" },
                    email: { type: "string", example: "ali@gmail.com" },
                    password: { type: "string", example: "123456" },
                    role: { type: "string", example: "user", enum: ["user", "admin"] },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Muvaffaqiyatli ro'yxatdan o'tildi",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
            },
            400: { description: "Email allaqachon mavjud yoki maydonlar to'liq emas" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Tizimga kirish",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "ali@gmail.com" },
                    password: { type: "string", example: "123456" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Muvaffaqiyatli kirish",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
            },
            400: { description: "Noto'g'ri email yoki parol" },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Token orqali o'z ma'lumotlarini olish",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Foydalanuvchi ma'lumotlari",
              content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
            },
            401: { description: "Token yo'q yoki noto'g'ri" },
          },
        },
      },

      // ── PRODUCTS ──────────────────────────────────────────
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "Barcha mahsulotlarni olish (filter bilan)",
          parameters: [
            { name: "type", in: "query", schema: { type: "string" }, description: "Tur (vergul bilan: shirt,pants)", example: "shirt" },
            { name: "category", in: "query", schema: { type: "string" }, description: "Kategoriya", example: "men" },
            { name: "minPrice", in: "query", schema: { type: "number" }, description: "Minimal narx", example: 10 },
            { name: "maxPrice", in: "query", schema: { type: "number" }, description: "Maksimal narx", example: 100 },
            { name: "colors", in: "query", schema: { type: "string" }, description: "Ranglar (vergul bilan: red,blue)", example: "red,blue" },
            { name: "size", in: "query", schema: { type: "string" }, description: "O'lchamlar (vergul bilan: S,M,L)", example: "M,L" },
          ],
          responses: {
            200: {
              description: "Mahsulotlar ro'yxati",
              content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Product" } } } },
            },
          },
        },
        post: {
          tags: ["Products"],
          summary: "Yangi mahsulot yaratish (rasmsiz) — faqat admin",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "price"],
                  properties: {
                    name: { type: "string", example: "Polo Shirt" },
                    price: { type: "number", example: 29.99 },
                    category: { type: "string", example: "men" },
                    type: { type: "string", example: "shirt" },
                    colors: { type: "array", items: { type: "string" }, example: ["red", "blue"] },
                    size: { type: "array", items: { type: "string" }, example: ["S", "M", "L"] },
                    images: { type: "array", items: { type: "string" }, example: ["https://res.cloudinary.com/..."] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Mahsulot yaratildi", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
            401: { description: "Avtorizatsiya kerak" },
            403: { description: "Admin huquqi yo'q" },
          },
        },
      },
      "/api/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Bitta mahsulotni ID bo'yicha olish",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Mahsulot ID si" }],
          responses: {
            200: { description: "Mahsulot", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
            404: { description: "Topilmadi" },
          },
        },
        patch: {
          tags: ["Products"],
          summary: "Mahsulotni yangilash — faqat admin",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Polo Shirt" },
                    price: { type: "number", example: 29.99 },
                    category: { type: "string", example: "men" },
                    type: { type: "string", example: "shirt" },
                    colors: { type: "array", items: { type: "string" }, example: ["red", "blue"] },
                    size: { type: "array", items: { type: "string" }, example: ["S", "M", "L"] },
                    images: { type: "array", items: { type: "string" }, example: ["https://res.cloudinary.com/..."] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Yangilangan mahsulot", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
            401: { description: "Avtorizatsiya kerak" },
            403: { description: "Admin huquqi yo'q" },
            404: { description: "Topilmadi" },
          },
        },
        delete: {
          tags: ["Products"],
          summary: "Mahsulotni o'chirish — faqat admin",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "O'chirildi", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
            401: { description: "Avtorizatsiya kerak" },
            403: { description: "Admin huquqi yo'q" },
            404: { description: "Topilmadi" },
          },
        },
      },
      "/api/products/upload": {
        post: {
          tags: ["Products"],
          summary: "Bitta rasm yuklash (Cloudinary) — faqat admin",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    image: { type: "string", format: "binary", description: "Rasm fayli" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Cloudinary URL",
              content: { "application/json": { schema: { type: "object", properties: { imageUrl: { type: "string", example: "https://res.cloudinary.com/..." } } } } },
            },
            400: { description: "Rasm yuklanmagan" },
          },
        },
      },
      "/api/products/with-images": {
        post: {
          tags: ["Products"],
          summary: "Rasm bilan birga mahsulot yaratish (max 3 rasm) — faqat admin",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["images", "name", "price"],
                  properties: {
                    images: { type: "array", items: { type: "string", format: "binary" }, description: "1-3 ta rasm fayli" },
                    name: { type: "string", example: "Polo Shirt" },
                    price: { type: "string", example: "29.99" },
                    category: { type: "string", example: "men" },
                    type: { type: "string", example: "shirt" },
                    colors: { type: "string", example: "red,blue", description: "Vergul bilan ajratilgan" },
                    size: { type: "string", example: "S,M,L", description: "Vergul bilan ajratilgan" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Mahsulot yaratildi", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
            400: { description: "Rasmlar yuklanmagan" },
          },
        },
      },
      "/api/products/{id}/comments": {
        post: {
          tags: ["Products"],
          summary: "Mahsulotga izoh qo'shish — login qilgan user",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["userRate", "comment"],
                  properties: {
                    userRate: { type: "number", example: 4, minimum: 1, maximum: 5 },
                    comment: { type: "string", example: "Zo'r mahsulot!" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Yangilangan mahsulot (comment bilan)", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
            401: { description: "Login kerak" },
            404: { description: "Mahsulot topilmadi" },
          },
        },
      },

      // ── TYPES ─────────────────────────────────────────────
      "/api/types": {
        get: {
          tags: ["Types"],
          summary: "Barcha mahsulot turlarini olish",
          responses: {
            200: {
              description: "Turlar ro'yxati",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        _id: { type: "string" },
                        name: { type: "string", example: "shirt" },
                        createdAt: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Types"],
          summary: "Yangi tur qo'shish — faqat admin",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: { name: { type: "string", example: "jacket" } },
                },
              },
            },
          },
          responses: {
            201: { description: "Yangi tur yaratildi" },
            400: { description: "Bu tur avval qo'shilgan" },
          },
        },
      },
      "/api/types/{id}": {
        delete: {
          tags: ["Types"],
          summary: "Turni o'chirish — faqat admin",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Type o'chirildi" },
            401: { description: "Avtorizatsiya kerak" },
            403: { description: "Admin huquqi yo'q" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
