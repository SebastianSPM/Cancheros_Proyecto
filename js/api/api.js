import { API_URL } from "./config.js";

export async function apiFetch(endpoint, options = {}) {

    const headers = {
        ...(options.headers || {})
    };

    if (options.body && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            credentials: "include",
            headers
        }
    );

    if (response.status === 204) {
        return null;
    }

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.error ||
            `Error HTTP ${response.status}`
        );
    }

    return data;
}