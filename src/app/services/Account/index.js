import { API } from '@api';
import { createBase, deleteByIdBase, getAllBase, getAllPaginationBase, updateBase } from '../Base';

export function getAllUsers() {
  return getAllBase(API.ALL_USER);
}

export function createUser(data) {
  return createBase(API.CREATE_USER, data);
}

export function updateUser(id, data) {
  return updateBase(API.UPDATE_USER.format(id), id, data);
}

export function deleteUser(id, id_user) {
  return deleteByIdBase(API.DELETE_USER.format(id, id_user));
}

export function changePasswords(id, data, loading) {
  return updateBase(API.CHANGE_PW.format(id), data, loading);
}

export function changePws(id, data) {
  return updateBase(API.CHANGE_PWS.format(id), data);
}

export function createDonvis(id, data) {
  return createBase(API.ALL_DONVI.format(id), data);
}

//camera
export function getAllCamera(currentPage = 1, totalDocs = 0, query) {
  return getAllPaginationBase(API.ALL_CAMERA_CATE, currentPage, totalDocs, query);
}

export function createCamera(data) {
  return createBase(API.ALL_CAMERA_CATE, data);
}

export function updateCamera(id, data) {
  return updateBase(API.FIND_CAMERA_CATE.format(id), data);
}

export function deleteCamera(id) {
  return deleteByIdBase(API.FIND_CAMERA_CATE.format(id));
}


