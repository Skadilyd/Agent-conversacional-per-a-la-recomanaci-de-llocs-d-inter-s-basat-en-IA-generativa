// Crear Express
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
require("dotenv").config();

const express = require('express');
const chat = require("./routes/chat");
const app = express()

const cors = require("cors");
app.use(cors());

app.use(express.json());

//Per connectar amb swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/chat", chat);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening to port ${PORT}`);
});