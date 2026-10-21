import api from "../api";

const baseUrl = '/item';

export const getItems = (params) => {
    return api.get(`${baseUrl}`, { params })
}

export const createItem = ({ payload }) => {
    return api.post(`${baseUrl}/create`, payload)
}

export const updateItem = ({ id, payload }) => {
    return api.put(`${baseUrl}/update-item/${id}`, payload)
}

export const getItemById = ({ id }) => {
    return api.get(`${baseUrl}/${id}`)
}

export const getValidActiveItems = () => {
    return api.get(`${baseUrl}/valid-active/items`)
}

export const downloadItemExcelTemp = () => {
    return api.post(`${baseUrl}/download/excel`, null, {
        responseType: "blob",
        isDownload: true,
    })
}

export const importItemsExcelData = (data, onUploadProgress) => {
    return api.put(
        `${baseUrl}/import/data`,
        { newData: data },
        {
            onUploadProgress,
        }
    );
};

export const toggleItemStatus = (id) => {
    return api.patch(`${baseUrl}/toggle-item/${id}`);
};
