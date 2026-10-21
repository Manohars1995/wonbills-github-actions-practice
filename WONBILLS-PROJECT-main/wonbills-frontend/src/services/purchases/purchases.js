import api from "../api";

const baseUrl = '/payment';

export const getPurchases = (params) => {
    return api.get(`${baseUrl}`, { params })
};

export const createPurchase = ({ payload }) => {
    return api.post(`${baseUrl}/create`, payload)
};

export const updatePurchase = ({ id, payload }) => {
    return api.put(`${baseUrl}/update-purchase/${id}`, payload)
};

export const getPurchaseById = ({ id }) => {
    return api.get(`${baseUrl}/${id}`);
};

export const togglePurchaseStatus = (id) => {
    return api.patch(`${baseUrl}/toggle-purchase/${id}`);
};