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
    .get(API.GET_USER.format(id))
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
    .put(API.UPDATE_USER.format(id), dataForm)
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
  return deleteByIdBase(API.DELETE_USER, id);
}