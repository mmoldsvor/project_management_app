import {checkToken} from "../authorization/authorization";

export default class OurClient {

    constructor(baseUrl) {
         if (!typeof URL) throw new Error("Type must be URL");
            this.baseUrl = baseUrl;
        }

    getProjectId(){
        return localStorage.getItem("selected_project-id")
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
        return handleResponse(resp);
    }

    async createUser(data){
        const url = new URL(`/create_account`,this.baseUrl)
        const resp = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: data
        });
        return handleResponse(resp);
    }
    async createProject(data){
        const url = new URL(`/project`,this.baseUrl)
        const token = checkToken()
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

    async postDeliverable(id, data){
        const token = checkToken()
        const projectId = this.getProjectId()
        const url = new URL(`/project/${projectId}/deliverable/${id}`,this.baseUrl)

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
    async postSubDeliverable(deliv_id, sub_deliv_id, data){
        const token = checkToken()
        const projectId = this.getProjectId()
        const url = new URL(`/project/${projectId}/deliverable/${deliv_id}/subdeliverable/${sub_deliv_id}`,this.baseUrl)
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

    async fetchProjects(){
        const token = checkToken()
        const url = new URL(`/projects`,this.baseUrl)
        const resp = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });
        return handleResponse(resp);
    }

    async fetchProjectInfo(){
        const token = checkToken()
        const project_id = this.getProjectId()
        const url = new URL(`/project/${project_id}`,this.baseUrl)
        const resp = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });
        return handleResponse(resp);
    }

    async fetchDeliverables(){
        const token = checkToken()
        const project_id = this.getProjectId()
        const url = new URL(`/project/${project_id}/deliverables`,this.baseUrl)
        const resp = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
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