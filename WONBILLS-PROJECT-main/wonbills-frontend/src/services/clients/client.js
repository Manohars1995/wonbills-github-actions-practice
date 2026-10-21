import api from "../api";

const baseUrl = '/client'

export const getClients = (params) => {
    return api.get(`${baseUrl}`, { params })
}

export const downloadExcelTemp = () => {
    return api.post(`${baseUrl}/export/excel2`, null, {
        responseType: "blob",
        isDownload: true,
    })
}

export const importClientExcelData = (data, onUploadProgress) => {
    return api.put(
        `${baseUrl}/import/data`,
        { newData: data },
        {
            onUploadProgress,
        }
    );
};

export const downloadDuplicateRecords = ({ userId }) => {
    return api.post(`${baseUrl}/download-duplicate/${userId}`, null, {
        responseType: "blob",
        isDownload: true,
    })
}

export const createClient = ({ payload }) => {
    return api.post(`${baseUrl}/create`, payload)
}

export const updateClient = ({ cId, payload }) => {
    return api.put(`${baseUrl}/update-client/${cId}`, payload)
}

export const getClientById = ({ cId }) => {
    return api.get(`${baseUrl}/${cId}`)
}

export const getActiveClients = () => {
    return api.get(`${baseUrl}/active/clients`);
}

export const toggleClientStatus = (id) => {
    return api.patch(`${baseUrl}/toggle-client/${id}`);
};

