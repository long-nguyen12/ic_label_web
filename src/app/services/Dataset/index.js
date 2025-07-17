import axios from "axios";
import { AI_BASE_URL } from "../../../constants/BASE_URL";
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

export function generateGalleryAI(id) {
  return axios
    .get(API.GENERATE_GALLERY_AI.format(id))
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function updateGalleryById(id, data) {
  return axios
    .put(API.GALLERY_ID.format(id), data)
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function deleteGalleryById(id) {
  return deleteByIdBase(API.GALLERY_ID, id);
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

export function getAllImageNoQuery(currentPage = 1, totalDocs = 0, query) {
  return getAllPaginationBase(API.GALLERY, currentPage, totalDocs, query);
}

export function getAllCaptionImages() {
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

export function getAllActiveImages() {
  return axios
    .get(API.GALLERY_IMAGES)
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function downloadAnnotationById(id) {
  return axios
    .get(API.DATASET_ANNOTATION.format(id), {
      responseType: "blob",
    })
    .then((response) => {
      if (response.status === 200) {
        const fileName = `annotation_${Date.now()}.json`;
        const blob = new Blob([response.data], { type: "application/json" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        return true;
      }
      return false;
    })
    .catch((err) => {
      renderMessageError(err);
      return false;
    });
}

export function rotateImageLeftById(id, angle) {
  return axios
    .get(API.GALLERY_ROTATE_LEFT.format(id, angle))
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function rotateImageRightById(id, angle) {
  return axios
    .get(API.GALLERY_ROTATE_RIGHT.format(id, angle))
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function generateCaptionById(url) {
  return axios
    .post(AI_BASE_URL + API.GALLERY_GENERATE_CAPTION, convertCamelCaseToSnakeCase({ url }))
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}