import axios from "axios";

import { API } from "@api";
import {
  convertCamelCaseToSnakeCase,
  convertSnakeCaseToCamelCase,
  renderMessageError,
} from "@app/common/functionCommons";
import { deleteByIdBase, getAllPaginationBase, getByIdBase } from "@app/services/Base";

export function getAllDataset(currentPage = 1, totalDocs = 0, query, loading) {
  return getAllPaginationBase(API.DATASET, currentPage, totalDocs, query, loading);
}

export function createDataset(data) {
  return axios
    .post(API.DATASET, data)
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function getDatasetById(id) {
  return axios
    .get(API.DATASET_ID.format(id))
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function getGallery(id) {
  return axios
    .get(API.GALLERY_ID.format(id))
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function updateDatasetById(id, dataForm) {
  return axios
    .put(API.DATASET_ID.format(id), dataForm)
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function deleteDatasetById(id) {
  return deleteByIdBase(API.DATASET_ID, id);
}

export function getAllImages(currentPage = 1, totalDocs = 0, query, loading) {
  return getAllPaginationBase(API.GALLERY, currentPage, totalDocs, query, loading);
}

export function getAllCaptionImages(){
  return axios
    .get(API.GALLERY_CAPTION)
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}