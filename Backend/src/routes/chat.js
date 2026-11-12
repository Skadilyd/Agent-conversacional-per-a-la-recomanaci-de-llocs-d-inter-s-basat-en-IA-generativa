const express = require("express");
const router = express.Router();

const { processMessage } = require("../agent/agent");

router.post("/", async (req, res) => {
    try {
        const { message, conversationId } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const result = await processMessage(
            message,
            conversationId
        );

        res.json(result);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Internal server error"
        });
    }
});

module.exports = router;