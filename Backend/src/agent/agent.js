const { randomUUID } = require("crypto")
const { askLLM, extractCriteria } = require("../services/llm");
const { getCriteria, updateCriteria } = require("./context");

async function processMessage(message, conversationId) {
    const id = conversationId || randomUUID();

    const current = getCriteria(id);
    const extracted = await extractCriteria(message, current);

    // enough_info y clarify_quest no son criterios, así que no se guardan
    const { enough_info, clarify_quest, ...criteria } = extracted;
    const changes = updateCriteria(id, criteria);

    const result = await askLLM(message, criteria);

    return {
        conversationId: id,
        message: result,
        criteria,
        changes,
        enough_info,
        clarify_quest
    };
}

module.exports = {
    processMessage
};