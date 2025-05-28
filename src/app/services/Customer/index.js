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

export function getAllCustomer(currentPage = 1, totalDocs = 0, query) {
  const config = { loading: true };
  let queryMobi = query?.customer_mobi ?  `&customer_mobi[like]=${query.customer_mobi}` : ``;
  let queryName = query?.search ?  `&customer_full_name[like]=${query.search}` : ``;
  const api =
    query && Object.keys(query).length === 0 && Object.getPrototypeOf(query) === Object.prototype
      ? `${API.ALL_CUSTOMER}?page=${currentPage}&limit=${totalDocs}`
      : `${API.ALL_CUSTOMER}?page=${currentPage}&limit=${totalDocs}${queryName}${queryMobi}`;
  return axios
    .get(api, config)
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function updateCustomer(id, data) {
  return updateBase(API.CUSTOMER_ID, id, data);
}

export function getCustomerById(id) {
  return getByIdBase(API.CUSTOMER_ID, id);
}

export function deleteCustomer(id) {
  return deleteByIdBase(API.CUSTOMER_ID, id);
}

export function getCustomerByFilterId(id, query) {
  return getAllBase(`${API.DATASET_ID}`.format(id), query);
}

export function importCustomer(id, formData) {
  return createBaseFromFormData(API.IMPORT_DATASET.format(id), formData);
}

export function createCustomer(data) {
  return createBase(API.CREATE_CUSTOMER, data);
}

export async function getCustomerRelate(id, query) {
  const params = convertParam(query);
  return getByIdBase(API.DATASET_ID + "/files" + params, id);
}

export async function getDetailImage(idImg) {
  return getAllBase(API.IMG_DETAIL.format(idImg));
}

export async function getLabelByCustomerId(id) {
  return getAllBase(API.LABEL_BY_DATASET_ID.format(id));
}
