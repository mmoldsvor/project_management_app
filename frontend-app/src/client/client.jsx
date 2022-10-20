
export default class OurClient {
    constructor(baseUrl) {
         if (!typeof URL) throw new Error("Type must be URL");
            this.baseUrl = baseUrl;
        }

    async authenticate(data){
        const url = new URL(`/authenticate`,this.baseUrl)
            const resp = await fetch(url, {
                         method: "POST",
                         headers: {
                            "Content-Type": "application/json"
                            },
                body: data
            });
        // return resp
        return handleResponse(resp);
    }
    async postDeliverable(token, id, data){
        const url = new URL(`/project/db3fda13-08e6-4b7e-a926-4d9c466e2050/deliverable/${id}`,this.baseUrl)
        const resp = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: data
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
            return response
    }
}