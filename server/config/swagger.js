import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Alumni Association Platform API",
    version: "1.0.0",
    description: "API documentation for the Alumni Association Platform",
  },
  servers: [
    {
      url: "/api/v1",
      description: "Versioned API",
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
  },
  security: [{ bearerAuth: [] }],
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
