const conversations = new Map();

function emptyCriteria() {

    return {
        place_type: null,
        place_ubi: null,
        place_max_distance: null,
        place_schedule: null,
        place_preferencies: [],
    }
};

function getCriteria( conversationId ){
    return (conversations.get(conversationId) || emptyCriteria());
};

function isEmpty (val) {
    return val === null || (Array.isArray(val) && val.length ===0)
}

function diffCriteria(oldC, newC) {
    const changes = { added: [], modified: [], removed: [] };

    for (const key of Object.keys(newC)) {
        const before = oldC[key];
        const after = newC[key];

        if (JSON.stringify(before) === JSON.stringify(after)) continue;

        if (isEmpty(before) && !isEmpty(after)) changes.added.push(key);
        else if (!isEmpty(before) && isEmpty(after)) changes.removed.push(key);
        else changes.modified.push(key);
    }
    return changes;
}

function updateCriteria(conversationId, newCriteria) {
    const changes = diffCriteria(getCriteria(conversationId), newCriteria);
    conversations.set(conversationId, newCriteria);
    return changes;
}

module.exports = { getCriteria, updateCriteria };