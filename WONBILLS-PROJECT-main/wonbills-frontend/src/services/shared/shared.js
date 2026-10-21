import api from "../api";

const url = "/shared";



export const getAddressByPostcode = ({ postcode }) => {
    if (!postcode) return Promise.reject(new Error("Postcode required"));
    return api.get(`${url}/pincode-info/${postcode}`)
}

export const sendInvite = (payload) => {
    return api.post(`${url}/send/invite`, payload);
}

export const postImageToS3Bucket = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return api.post(`${url}/upload/image`, formData);
};

export const postRequestDemoWonBills = (payload) => {
    return api.post(`${url}/demo`, payload);
};