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

export function getAllLabel(currentPage = 1, totalDocs = 0, query) {
  const config = { loading: true };
  const api =
    query && Object.keys(query).length === 0 && Object.getPrototypeOf(query) === Object.prototype
      ? `${API.LABEL_ALL}?page=${currentPage}&limit=${totalDocs}`
      : `${API.LABEL_ALL}?page=${currentPage}&limit=${totalDocs}&label_name[like]=${query.search}`;
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

export function getAllLabelNoQuery(currentPage = 1, totalDocs = 0, query) {
  return getAllPaginationBase(API.LABEL_ALL, currentPage, totalDocs, query);
}

export function updateLabel(id, data) {
  return updateBase(API.LABEL_ID, id, data);
}

export function getLabelById(id) {
  return getByIdBase(API.LABEL_ID, id);
}

export function deleteLabel(id) {
  return deleteByIdBase(API.LABEL_ID, id);
}

export function getLabelByFilterId(id, query) {
  return getAllBase(`${API.LABEL_ID}`.format(id), query);
}

export function importLabel(id, formData) {
  return createBaseFromFormData(API.IMPORT_DATASET.format(id), formData);
}

export function createLabel(data) {
  return createBase(API.LABEL_ALL, data);
}

export async function getLabelRelate(id, query) {
  const params = convertParam(query);
  return getByIdBase(API.DATASET_ID + "/files" + params, id);
}

export async function getDetailImage(idImg) {
  return getAllBase(API.IMG_DETAIL.format(idImg));
}

export async function getLabelByLabelId(id) {
  return getAllBase(API.LABEL_BY_DATASET_ID.format(id));
}

export async function changeLabelName(id, data) {
  return updateBase(API.LABEL_BY_DATASET_ID.format(id), data);
}

export async function createLabelImage(id, user_id, data) {
  return updateBase(API.IMG_DETAIL.format(id, user_id), data);
}

export async function getLabelIdFiles(id, query, loading) {
  return getAllBase(`${API.DATASET_ID}/files`.format(id), query, loading);
}

export async function getLabelIdFilterAll(query) {
  return getAllBase(`${API.DATASET_IMAGE}`, query);
}

export function uploadImg(id, formData) {
  return updateBase(API.UPLOAD_IMG.format(id), formData);
}

export async function getAllLabels(id, query, loading) {
  return getAllBase(API.ALL_LABELS.format(id), query, loading);
}

export function deleteLabelID(id) {
  return deleteByIdBase(API.DELETE_LABELS.format(id));
}

export function createLabelbyFile(formData) {
  return createBaseFromFormData(API.LABEL_IMPORT, formData);
}