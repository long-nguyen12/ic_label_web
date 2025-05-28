import { API } from '@api';
import { convertParam, convertSnakeCaseToCamelCase, renderMessageError } from '@app/common/functionCommons';
import axios from 'axios';
import {
  createBase,
  createBaseFromFormData,
  deleteByIdBase,
  getAllBase,
  getAllPaginationBase,
  getByIdBase,
  updateBase,
} from '../Base';

export function getAllSalebillsdetail(currentPage = 1, totalDocs = 0, query) {
  return getAllPaginationBase(API.ALL_SALE_BILLS_DETAIL, currentPage, totalDocs, query);
}

export function getAllSalebillsdetailByUserID(currentPage = 1, totalDocs = 0, query) {
  return getAllPaginationBase(API.ALL_SALE_BILLS_DETAIL, currentPage, totalDocs, query);
}

export function updateSalebillsdetail(id, data) {
  return updateBase(API.SALE_BILLS_DETAIL_ID, id, data);
}

export function getSalebillsdetailById(id) {
  return getByIdBase(API.SALE_BILLS_DETAIL_ID, id);
}

export function deleteSalebillsdetail(id) {
  return deleteByIdBase(API.SALE_BILLS_DETAIL_ID, id);
}

export function getSalebillsdetailByFilterId(id, query) {
  return getAllBase(`${API.SALE_BILLS_DETAIL_ID}`.format(id), query);
}

export function createSalebillsdetail(data) {
  return createBase(API.CREATE_SALE_BILLS_DETAIL, data);
}
