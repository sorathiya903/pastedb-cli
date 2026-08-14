class PasteDBError extends Error {
    constructor(message) {
        super(message);
        this.name = "PasteDBError";
    }
}

class Client {
    constructor(apiKey = null, baseUrl = "https://pastedb-rw62.onrender.com") {
        this.baseUrl = baseUrl.replace(/\/$/, "");
        this.headers = {
            "Content-Type": "application/json"
        };

        if (apiKey) {
            this.headers["x-api-key"] = apiKey;
            this.headers["Authorization"] = `Bearer ${apiKey}`;
        }
    }

    async _request(method, endpoint, options = {}) {
        let url = `${this.baseUrl}${endpoint}`;

        if (options.params) {
            const query = new URLSearchParams(options.params).toString();
            if (query) url += `?${query}`;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    ...this.headers,
                    ...(options.headers || {})
                },
                body:
                    method === "GET" || method === "DELETE"
                        ? undefined
                        : JSON.stringify(options.json || {}),
                signal: controller.signal
            });

            clearTimeout(timeout);

            const text = await response.text();

            let data;
            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }

            if (!response.ok) {
                throw new PasteDBError(`${response.status}: ${JSON.stringify(data)}`);
            }

            return data;
        } catch (err) {
            if (err.name === "AbortError") {
                throw new PasteDBError("Request timed out.");
            }
            throw err;
        }
    }

    // ---------- Public ----------

    async me() {
        return this._request("GET", "/api/me");
    }

    async createPaste(data) {
        return this._request("POST", "/create", {
            json: data
        });
    }

    async getPaste(pasteId) {
        return this._request("GET", `/p/${pasteId}`);
    }

    async updatePaste(pasteId, data) {
        return this._request("PUT", `/api/paste/${pasteId}`, {
            json: data
        });
    }

    async explore() {
        return this._request("GET", "/explore");
    }

    async runCode(language, code) {
        return this._request("POST", "/run", {
            json: { language, code }
        });
    }

    async getImages(pasteId) {
        return this._request("GET", `/images/${pasteId}`);
    }

    async pasteStats(pasteId) {
        return this._request("GET", `/stats/${pasteId}`);
    }

    async checkCustomId(customId) {
        return this._request("GET", "/check-id", {
            params: {
                id: customId
            }
        });
    }

    async generateApiKey(name) {
        return this._request("POST", "/generate-api-key", {
            json: { name }
        });
    }

    async myApiKeys() {
        return this._request("GET", "/my-api-keys");
    }

    async deleteApiKey(apiKey) {
        return this._request("DELETE", `/delete-api-key/${apiKey}`);
    }

    // ---------- API ----------

    async apiMe() {
        return this._request("GET", "/api/me");
    }

    async apiCreatePaste(data) {
        return this._request("POST", "/api/create", {
            json: data
        });
    }

    async apiGetPaste(pasteId) {
        return this._request("GET", `/api/paste/${pasteId}`);
    }

    async apiDeletePaste(pasteId) {
        return this._request("DELETE", `/api/paste/${pasteId}`);
    }

    async apiUpdatePaste(pasteId, data) {
        return this._request("PUT", `/api/paste/${pasteId}`, {
            json: data
        });
    }

    async apiUserPastes() {
        return this._request("GET", "/api/pastes");
    }
}

module.exports = {
    Client,
    PasteDBError
};
