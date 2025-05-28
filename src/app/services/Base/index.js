import axios from "axios";
import { convertSnakeCaseToCamelCase, convertParam, renderMessageError } from "@app/common/functionCommons";

export function createBase(api, data, loading = true) {
  const config = { loading };
  return axios
    .post(`${api}`, data, config)
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err)
      return null;
    });
}

export function createBaseFromFormData(api, formData) {
  return axios
    .post(`${api}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function getAllBase(api, query, loading = true) {
  const config = { loading };
  const params = convertParam(query);
  return axios
    .get(`${api}${params}`, config)
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function getAllPaginationBase(api, currentPage = 1, totalDocs = 0, query, loading = true) {
  const config = { loading };
  const params = convertParam(query, "&");
  return axios
    .get(`${api}?page=${currentPage}&limit=${totalDocs}${params}`, config)
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function getByIdBase(api, id, loading = true) {
  const config = { loading };
  return axios
    .get(`${api.format(id)}`, config)
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function updateBase(api, id, data, loading = true) {
  const config = { loading };
  return axios
    .put(`${api.format(id)}`, data, config)
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function deleteByIdBase(api, id) {
  return axios
    .delete(api.format(id))
    .then((response) => {
      if (response.status === 200) return response?.data;
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}
