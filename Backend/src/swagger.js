// src/swagger.js
module.exports = {
  openapi: "3.0.0",
  info: {
    title: "API del agente de lugares",
    version: "1.0.0",
    description: "Backend conversacional para recomendar lugares"
  },
  servers: [{ url: "http://localhost:3000" }],
  paths: {
    "/api/chat": {
      post: {
        summary: "Envía un mensaje al agente",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["message"],
                properties: {
                  message: { type: "string", example: "Busco una cafetería con wifi en Cerdanyola" },
                  conversationId: {
                    type: "string",
                    description: "Opcional. Si lo omites, se crea una conversación nueva.",
                    example: "74defc91-6db4-411e-a351-fd652770d3bc"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Respuesta del agente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    conversationId: { type: "string" },
                    message: { type: "string" },
                    places: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          address: { type: "string" },
                          lat: { type: "number" },
                          lng: { type: "number" },
                          rating: { type: "number" },
                          reviews: { type: "integer" },
                          maps_url: { type: "string" }
                        }
                      }
                    },
                    criteria: { type: "object" },
                    changes: { type: "object" },
                    enough_info: { type: "boolean" },
                    clarify_quest: { type: "string", nullable: true }
                  }
                }
              }
            }
          },
          400: { description: "Falta el campo message" },
          500: { description: "Error interno del servidor" }
        }
      }
    }
  }
};