class HttpError extends Error {
    constructor(message, errorCode, success = false) {
        super(message); // Add a "message" property
        this.success = success; 
        this.code = errorCode; // Adds a "code" property
        
    }
}

module.exports = HttpError;