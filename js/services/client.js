class ClientService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
    }

    async getAllClients() {
        try {
            const response = await fetch(`${this.baseUrl}/clients`);
            if (!response.ok) {
                throw new Error('Erro ao buscar clientes');
            }
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }

    async createClient(clientData) {
        try {
            const response = await fetch(`${this.baseUrl}/clients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clientData)
            });
            if (!response.ok) {
                throw new Error('Erro ao criar cliente');
            }
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }

    async updateClient(id, clientData) {
        try {
            const response = await fetch(`${this.baseUrl}/clients/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clientData)
            });
            if (!response.ok) {
                throw new Error('Erro ao atualizar cliente');
            }
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }

    async deleteClient(id) {
        try {
            const response = await fetch(`${this.baseUrl}/clients/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Erro ao deletar cliente');
            }
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }

    async getClient(id) {
        try {
            const response = await fetch(`${this.baseUrl}/clients/${id}`);
            if (!response.ok) {
                throw new Error('Erro ao buscar cliente');
            }
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }

    async searchClients(query) {
        try {
            const response = await fetch(`${this.baseUrl}/clients/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Erro ao pesquisar clientes');
            }
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }
}
