import api from "../api";

const baseUrl = '/invoice';

export const getInvoices = (params) => {
    return api.get(`${baseUrl}`, { params })
};

export const createInvoice = ({ payload }) => {
    return api.post(`${baseUrl}/create`, payload)
};

export const updateInvoice = ({ id, payload }) => {
    return api.put(`${baseUrl}/update-invoice/${id}`, payload)
};

export const getInvoiceById = ({ id }) => {
    return api.get(`${baseUrl}/inv/${id}`);
};

export const getActiveInvoices = (invoiceId) => {
    return api.get(`${baseUrl}/active/invs`, {
        params: invoiceId ? { invoiceId } : {}
    });
};


export const getClientVenderDetails = (clientID) => {
    return api.get(`${baseUrl}/client-vendor/details/${clientID}`);
}

export const toggleInvoiceStatus = (id) => {
    return api.patch(`${baseUrl}/toggle-invoice/${id}`);
};