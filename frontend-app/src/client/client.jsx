import {checkToken} from "../authorization/authorization";

const ourURL = ""
export default class OurClient {

    constructor(baseUrl) {
         if (!typeof URL) throw new Error("Type must be URL");
            this.baseUrl = baseUrl;
        }

    getProjectId(){
        return localStorage.getItem("selected_project-id")
    }

    async authenticate(data){
        const url = new URL(`${ourURL}/authenticate`,this.baseUrl)
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
        const url = new URL(`${ourURL}/create_account`,this.baseUrl)
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
        const url = new URL(`${ourURL}/project`,this.baseUrl)
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
        const url = new URL(`${ourURL}/project/${projectId}/deliverable/${id}`,this.baseUrl)

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
        const url = new URL(`${ourURL}/project/${projectId}/deliverable/${deliv_id}/subdeliverable/${sub_deliv_id}`,this.baseUrl)
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

    async postWorkPackage(work_package_id, data){
        const token = checkToken()
        const projectId = this.getProjectId()
        const url = (work_package_id !== "") ?
            new URL(`${ourURL}/project/${projectId}/work_package/${work_package_id}`,this.baseUrl)
            : new URL(`${ourURL}/project/${projectId}/work_package`,this.baseUrl)
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

    async postRelation(relation_ID, data){
        const token = checkToken()
        const projectId = this.getProjectId()
        const url = new URL(`${ourURL}/project/${projectId}/relation/${relation_ID}`,this.baseUrl)
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
        const url = new URL(`${ourURL}/projects`,this.baseUrl)
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
        const url = new URL(`${ourURL}/project/${project_id}`,this.baseUrl)
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
        const url = new URL(`${ourURL}/project/${project_id}/deliverables`,this.baseUrl)
        const resp = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });
        return handleResponse(resp);
    }

    async fetchWorkPackages(){
        const token = checkToken()
        const project_id = this.getProjectId()
        const url = new URL(`${ourURL}/project/${project_id}/work_packages/`,this.baseUrl)
        const resp = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });
        return handleResponse(resp);
    }

    async postTimePlanning(body){
        const token = checkToken()
        const project_id = this.getProjectId()
        const url = new URL(`${ourURL}/project/${project_id}/nodes`, this.baseUrl)
        const resp = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: body
        });
        return handleResponse(resp);
    }

    async fetchTimePlanning(){
        const token = checkToken()
        const project_id = this.getProjectId()
        const url = new URL(`${ourURL}/project/${project_id}/nodes`,this.baseUrl)
        const resp = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });
        return handleResponse(resp);
    }

    async fetchTimeSchedule(){
        const token = checkToken()
        const project_id = this.getProjectId()
        const url = new URL(`${ourURL}/project/${project_id}/time_schedule`,this.baseUrl)
        const resp = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });
        return handleResponse(resp);
    }

    async fetchRelations(){
        const token = checkToken()
        const project_id = this.getProjectId()
        const url = new URL(`${ourURL}/project/${project_id}/relations`,this.baseUrl)
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
            return response.json();
        case 204:
            return null
        case 404:
            return null
        default:
            return response
    }
}