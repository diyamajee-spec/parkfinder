export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SmartPark API",
      version: "1.0.0",
      description: "Interactive API documentation for the SmartPark application.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development Server",
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
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["user", "manager", "admin"] },
            isTwoFactorEnabled: { type: "boolean" },
          },
        },
        Parking: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            location: { type: "string" },
            pricePerHour: { type: "number" },
            status: { type: "string" },
            capacity: { type: "number" },
            availableSlots: { type: "number" },
          },
        },
        Booking: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
            parking: { $ref: "#/components/schemas/Parking" },
            startTime: { type: "string", format: "date-time" },
            endTime: { type: "string", format: "date-time" },
            totalPrice: { type: "number" },
            status: { type: "string", enum: ["active", "completed", "cancelled"] },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Path to the API docs (all files in routes folder)
};
