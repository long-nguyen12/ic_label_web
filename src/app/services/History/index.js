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

export function getAllHistory(currentPage = 1, totalDocs = 0, query) {
  const config = { loading: true };
  const api =
    query && Object.keys(query).length === 0 && Object.getPrototypeOf(query) === Object.prototype
      ? `${API.HISTORY}?page=${currentPage}&limit=${totalDocs}`
      : `${API.HISTORY}?page=${currentPage}&limit=${totalDocs}&position_name[like]=${query.search}`;
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

export function getAllHistoryNoQuery(currentPage = 1, totalDocs = 0, query) {
  return getAllPaginationBase(API.ALL_POSITION, currentPage, totalDocs, query);
}

export function getHistoryById(id) {
  return getByIdBase(API.POSITION_ID, id);
}

export function deleteHistory(id) {
  return deleteByIdBase(API.POSITION_ID, id);
}

export function getHistoryByFilterId(id, query) {
  return getAllBase(`${API.DATASET_ID}`.format(id), query);
}

export async function getHistoryIdFiles(id, query, loading) {
  return getAllBase(`${API.DATASET_ID}/files`.format(id), query, loading);
}

export async function getHistoryIdFilterAll(query) {
  return getAllBase(`${API.DATASET_IMAGE}`, query);
}

export async function getUserFilters(id, value, loading) {
  return getAllBase(API.USERS_FILTER.format(id, value), {}, loading);
}

export async function getDonViByHistoryId(id) {
  return getAllBase(API.DONVIS.format(id));
}

export async function getUserShareHistory(id, loading) {
  return getByIdBase(API.USER_SHARE, id, loading);
}

export async function getAllUsers(id, query, loading) {
  return getAllBase(API.ALL_USER.format(id), query, loading);
}
