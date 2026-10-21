/**
 * Generates a random digit string between minDigits and maxDigits in length.
 * @param {number} minDigits Minimum number of digits (e.g., 6)
 * @param {number} maxDigits Maximum number of digits (e.g., 8)
 * @returns {string} A numeric string (e.g., "439201")
 */
function generateRandomDigits(minDigits, maxDigits) {
    const length = Math.floor(Math.random() * (maxDigits - minDigits + 1)) + minDigits;
    let result = '';
    result += Math.floor(Math.random() * 9) + 1; // First digit: 1–9
    for (let i = 1; i < length; i++) {
        result += Math.floor(Math.random() * 10); // Next digits: 0–9
    }
    return result;
}

/**
 * Generates a custom_id string using a given prefix and random digits.
 * @param {string} prefix Prefix for ID (e.g., "AD", "MG")
 * @returns {string} A custom ID (e.g., "AD-439201")
 */
function generateCustomId(prefix) {
    return `${prefix}-${generateRandomDigits(6, 8)}`;
}

/**
 * Generates a unique custom_id for any entity using a prefix and Mongoose model.
 * Retries until a unique ID is found or maxAttempts is reached.
 *
 * @param {string} prefix Prefix for the custom ID (e.g., "AD", "MG")
 * @param {object} Model Mongoose model (Admin, Manager, etc.)
 * @param {number} maxAttempts Maximum number of retries
 * @returns {Promise<string>} Resolves to a unique custom_id
 */
async function generateUniqueCustomId(prefix, Model, maxAttempts = 10) {
    let custom_id;
    let attempts = 0;

    while (attempts < maxAttempts) {
        custom_id = generateCustomId(prefix);
        try {
            const exists = await Model.findOne({ custom_id });
            if (!exists) return custom_id;
            console.warn(`[Custom ID Generator] Duplicate ID (${custom_id}) found for ${prefix}. Retrying...`);
        } catch (err) {
            console.error(`[Custom ID Generator] Error checking ${prefix} custom_id:`, err);
            throw new Error(`Error checking ${prefix} ID uniqueness.`);
        }
        attempts++;
    }

    throw new Error(`Could not generate unique ${prefix} ID after ${maxAttempts} attempts.`);
}

module.exports = {
    generateUniqueCustomId
};
