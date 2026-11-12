const OpenAI = require("openai");
const { searchPlaces } = require("./places");
//const { StrictMode } = require("react");

let client;

function getClient() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error(
            "Falta configurar OPENAI_API_KEY en el archivo .env"
        );
    }

    if (!client) {
        client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    return client;
}

async function extractCriteria(message, currentCriteria) {
    const openai = getClient();
    const response = await openai.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
        instructions:`Extrae los criterios de búsqueda de lugares del mensaje del usuario.
            Pon el dato en null cuando no lo encuentres.
            Si falta un dato esencial, pon "enough_info" en false
            y escribe en "clarify_quest" la pregunta para pedir esa información
            (en el mismo idioma que el usuario).`,

        // Esborrar això quan tot funcioni!!
        
        input: `Criterios actuales: ${JSON.stringify(currentCriteria)}
Mensaje del usuario: ${message}`,
        text: {
            format: {
                type: "json_schema",
                name: "search_criteria",
                schema: {
                    type: "object",
                    properties:{
                        place_type: { type: ["string", "null"]},
                        place_ubi: { type: ["string", "null"]},
                        place_max_distance: { type: ["number", "null"]},
                        place_schedule: { type: ["string", "null"]},
                        place_preferencies: {type: "array", items: {type: "string"}},
                        enough_info: { type: "boolean"},
                        clarify_quest: {type: ["string", "null"]}

                    },
                    required: [
                        "place_type", "place_ubi", "place_max_distance", "place_schedule", "place_preferencies",
                        "enough_info", "clarify_quest"
                    ],
                    additionalProperties: false,
                },
                strict: true,
            }
        }
    });
    return JSON.parse(response.output_text);
}


const tools = [{
    type: "function",
    name: "search_places",
    description: "Busca lugares (cafeterías, restaurantes, tiendas...) según los criterios del usuario",
    parameters: {
        type: "object",
        properties: {
            place_type: { type: "string" },
            place_ubi: { type: "string" },
            place_max_distance: { type: ["number", "null"] },
            place_preferencies: { type: "array", items: { type: "string" } }
        },
        required: ["place_type", "place_ubi", "place_max_distance", "place_preferencies"],
        additionalProperties: false
    },
    strict: true
}];

async function askLLM(message, criteria) {
    const openai = getClient();
    const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";

    const instructions = `
        Eres un asistente conversacional que ayuda a encontrar
        lugares de interés, como cafeterías, restaurantes y tiendas.

        Responde en el mismo idioma que utiliza el usuario.
        Cuando tengas suficientes datos, usa la herramienta search_places.
        Basa tu respuesta SOLO en los resultados de la herramienta, no inventes lugares.
        Si la herramienta no devuelve resultados, dilo claramente.
        Sé amable con el usuario en un tono fresco.

        Criterios actuales de búsqueda: ${JSON.stringify(criteria)}
    `;

    const input = [{ role: "user", content: message }];

    let response = await openai.responses.create({ model, instructions, input, tools });

    // Mientras el modelo pida tools, las ejecutamos (máximo 3 vueltas por seguridad)
    for (let i = 0; i < 3; i++) {
        const calls = response.output.filter(item => item.type === "function_call");
        if (calls.length === 0) break;

        input.push(...response.output);

        for (const call of calls) {
            const args = JSON.parse(call.arguments);
            const places = await searchPlaces(args);

            input.push({
                type: "function_call_output",
                call_id: call.call_id,
                output: JSON.stringify(places)
            });
        }

        response = await openai.responses.create({ model, instructions, input, tools });
    }

    return response.output_text;
}

module.exports = { askLLM, extractCriteria };