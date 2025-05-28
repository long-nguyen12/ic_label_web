import { API } from "@api";
import { convertParam, convertSnakeCaseToCamelCase, renderMessageError } from "@app/common/functionCommons";
import axios from "axios";
import {
  createBase,
  createBaseFromFormData,
  deleteByIdBase,
  getAllBase,
  getAllPaginationBase,
  getByIdBase,
  updateBase,
} from "../Base";

export function getAllSalebills(currentPage = 1, totalDocs = 0, query) {
  const config = { loading: true };
  const params = query && query.search ? `&sale_id[like]=${query.search}` : "";
  return axios
    .get(`${API.ALL_SALE_BILLS}?page=${currentPage}&limit=${totalDocs}${params}`, config)
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
  // return getAllPaginationBase(API.ALL_SALE_BILLS, currentPage, totalDocs, query);
}

export function getAllSalebillsByUserID(currentPage = 1, totalDocs = 0, query) {
  return getAllPaginationBase(API.ALL_SALE_BILLS, currentPage, totalDocs, query);
}

export function updateSalebills(id, data) {
  return updateBase(API.SALE_BILLS_ID, id, data);
}

export function getSalebillsById(id) {
  return getByIdBase(API.SALE_BILLS_ID, id);
}

export function deleteSalebills(id) {
  return deleteByIdBase(API.SALE_BILLS_ID, id);
}

export function getSalebillsByFilterId(id, query) {
  return getAllBase(`${API.SALE_BILLS_ID}`.format(id), query);
}

export function createSalebills(data) {
  return createBase(API.CREATE_SALE_BILLS, data);
}
