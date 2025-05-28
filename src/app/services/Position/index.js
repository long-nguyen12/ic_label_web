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

export function getAllPosition(currentPage = 1, totalDocs = 0, query) {
  const config = { loading: true };
  const api =
    query && Object.keys(query).length === 0 && Object.getPrototypeOf(query) === Object.prototype
      ? `${API.ALL_POSITION}?page=${currentPage}&limit=${totalDocs}`
      : `${API.ALL_POSITION}?page=${currentPage}&limit=${totalDocs}&position_name[like]=${query.search}`;
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

export function getAllPositionNoQuery(currentPage = 1, totalDocs = 0, query) {
  return getAllPaginationBase(API.ALL_POSITION, currentPage, totalDocs, query);

}

export function updatePosition(id, data) {
  return updateBase(API.POSITION_ID, id, data);
}

export function getPositionById(id) {
  return getByIdBase(API.POSITION_ID, id);
}

export function deletePosition(id) {
  return deleteByIdBase(API.POSITION_ID, id);
}

export function getPositionByFilterId(id, query) {
  return getAllBase(`${API.DATASET_ID}`.format(id), query);
}

export function importPosition(id, formData) {
  return createBaseFromFormData(API.IMPORT_DATASET.format(id), formData);
}

export function createPosition(data) {
  return createBase(API.CREATE_POSITION, data);
}

export async function getPositionRelate(id, query) {
  const params = convertParam(query);
  return getByIdBase(API.DATASET_ID + "/files" + params, id);
}

export async function getDetailImage(idImg) {
  return getAllBase(API.IMG_DETAIL.format(idImg));
}

export async function getLabelByPositionId(id) {
  return getAllBase(API.LABEL_BY_DATASET_ID.format(id));
}

export async function changeLabelName(id, data) {
  return updateBase(API.LABEL_BY_DATASET_ID.format(id), data);
}

export async function deleteLabel(id, user_id, data) {
  return updateBase(API.IMG_DETAIL.format(id, user_id), data);
}

export async function createLabelImage(id, user_id, data) {
  return updateBase(API.IMG_DETAIL.format(id, user_id), data);
}

export async function deleteImg(id) {
  return axios
    .delete(API.IMG_DELETE.format(id))
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export async function statisticalDonvi(id, loading) {
  return getByIdBase(API.STATISTICAL_DONVI, id, loading);
}

export async function statisticalUser(id, loading) {
  return getByIdBase(API.STATISTICAL_USER, id, loading);
}

export async function getPositionIdFiles(id, query, loading) {
  return getAllBase(`${API.DATASET_ID}/files`.format(id), query, loading);
}

export async function getPositionIdFilterAll(query) {
  return getAllBase(`${API.DATASET_IMAGE}`, query);
}

export async function getUserFilters(id, value, loading) {
  return getAllBase(API.USERS_FILTER.format(id, value), {}, loading);
}

export async function getDonViByPositionId(id) {
  return getAllBase(API.DONVIS.format(id));
}

export async function getUserSharePosition(id, loading) {
  return getByIdBase(API.USER_SHARE, id, loading);
}

export async function getAllUsers(id, query, loading) {
  return getAllBase(API.ALL_USER.format(id), query, loading);
}

export async function createAugmentationByPositionId(id, data) {
  return createBase(API.CREATE_AUGMENTATION.format(id), data);
}

export async function createModelByPositionId(id, data, loading) {
  return createBase(API.MODEL_BY_DATASET_ID.format(id), data, loading);
}

export async function createOppositeByPositionId(data, loading) {
  return createBase(API.OPPOSITE_BY_DATASET_ID, data, loading);
}

export function uploadImg(id, formData) {
  return updateBase(API.UPLOAD_IMG.format(id), formData);
}

export async function createUserShare(id, data, loading) {
  return createBase(API.USER_SHARE.format(id), data, loading);
}

export async function mergePosition(user_id, data) {
  return createBase(API.MERGE_DATASET.format(user_id), data);
}

export async function getAllLabels(id, query, loading) {
  return getAllBase(API.ALL_LABELS.format(id), query, loading);
}

export function createLabel(user_id, data) {
  return createBase(API.CREATE_LABELS.format(user_id), data);
}

export function deleteLabelID(id) {
  return deleteByIdBase(API.DELETE_LABELS.format(id));
}
