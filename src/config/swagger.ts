// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const swaggerDocument: any = {
  openapi: "3.0.0",
  info: {
    title: "Food Delivery API",
    version: "1.0.0",
    description: "Backend API for food delivery application",
  },
  servers: [{ url: "http://localhost:3001", description: "Development" }],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        tags: ["Health"],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    timestamp: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        summary: "Register",
        tags: ["Auth"],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string", minLength: 6 },
                  name: { type: "string" },
                  role: { type: "string", enum: ["USER", "ADMIN"] },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
          "400": { description: "Bad request" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login",
        tags: ["Auth"],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "OK" },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        summary: "Refresh tokens",
        tags: ["Auth"],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: { refreshToken: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "New tokens" },
          "401": { description: "Invalid refresh token" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        summary: "Logout",
        tags: ["Auth"],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { refreshToken: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "Logged out" } },
      },
    },
    "/api/restaurants": {
      get: {
        summary: "List restaurants (paginated)",
        tags: ["Restaurants"],
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "isActive", in: "query", schema: { type: "boolean" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["name", "createdAt"] } },
          { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
        ],
        responses: { "200": { description: "Paginated list" } },
      },
    },
    "/api/restaurants/{id}": {
      get: {
        summary: "Get restaurant by ID",
        tags: ["Restaurants"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/categories": {
      get: {
        summary: "List categories",
        tags: ["Categories"],
        parameters: [
          { name: "restaurantId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "isActive", in: "query", schema: { type: "boolean" } },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/orders": {
      get: {
        summary: "List my orders (auth)",
        tags: ["Orders"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "OK" },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        summary: "Create order (auth)",
        tags: ["Orders"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["restaurantId", "items"],
                properties: {
                  restaurantId: { type: "string", format: "uuid" },
                  deliveryFee: { type: "number" },
                  paymentStatus: { type: "string", enum: ["PENDING", "PAID", "FAILED", "REFUNDED"] },
                  paymentProvider: { type: "string", enum: ["STRIPE", "MOMO", "VNPAY"] },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        menuItemId: { type: "string", format: "uuid" },
                        quantity: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/addresses": {
      get: {
        summary: "List my addresses (auth)",
        tags: ["Addresses"],
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "OK" } },
      },
      post: {
        summary: "Create address (auth)",
        tags: ["Addresses"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["address", "latitude", "longitude"],
                properties: {
                  address: { type: "string" },
                  latitude: { type: "number" },
                  longitude: { type: "number" },
                  isDefault: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/payments/order/{orderId}": {
      get: {
        summary: "List payments for order (auth)",
        tags: ["Payments"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "orderId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not found" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Access token from login/register/refresh",
      },
    },
  },
};
