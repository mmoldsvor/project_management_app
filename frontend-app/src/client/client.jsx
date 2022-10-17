
export default class OurClient {
    constructor(baseUrl) {
         if (!typeof URL) throw new Error("Type must be URL");
            this.baseUrl = baseUrl;
        }

    async pingBackend(authToken){
        const url = new URL(``,this.baseUrl)
            const resp = await fetch(url, {
                         method: "GET",
                         headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + authToken
                 },
            });
        return handleResponse(resp);

    }
}

async function handleResponse(response){
    switch (response.status) {
        case 200:
            return response.json();
        case 201:
            return null
        case 204:
            return null
        case 404:
            return null
        default:
            throw Error()
    }
}