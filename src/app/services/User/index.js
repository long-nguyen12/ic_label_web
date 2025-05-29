import axios from "axios";

import { API } from "@api";
import {
  convertCamelCaseToSnakeCase,
  convertSnakeCaseToCamelCase,
  renderMessageError,
} from "@app/common/functionCommons";
import { deleteByIdBase, getAllPaginationBase, getByIdBase } from "@app/services/Base";

export function login(data) {
  return axios
    .post(`${API.LOGIN}`, data)
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function getAllUser(currentPage = 1, totalDocs = 0, query, loading) {
  return getAllPaginationBase(API.USERS, currentPage, totalDocs, query, loading);
}

export function getUserByToken() {
  return axios
    .get(API.MY_INFO)
    .then((response) => {
      if (response?.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function updateMyInfo(dataUpdate) {
  return axios
    .put(API.UPDATE_MY_INFO, dataUpdate)
    .then((response) => {
      if (response?.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

// export function updateMyInfo(id, dataUpdate) {
//   return axios
//     .put(API.UPDATE_MY_INFO.format(id), dataUpdate)
//     .then((response) => {
//       if (response?.status === 200) return convertSnakeCaseToCamelCase(response?.data);
//       return null;
//     })
//     .catch((err) => {
//       renderMessageError(err);
//       return null;
//     });
// }

export function createUser(data) {
  return axios
    .post(API.CREATE_USER, data)
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function getUserById(id) {
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

export function updateUserById(id, dataForm) {
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

export function deleteUserById(id) {
  return deleteByIdBase(API.DELETE_USER, id);
}

export function requestResetPassword(token, data) {
  return axios
    .put(API.USER_RESET_PASSWORD, data, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      if (res.data) {
        return res.data;
      } else {
        renderMessageError(err);
        return null;
      }
    })
    .catch((error) => {
      renderMessageError(error);
      return null;
    });
}

export function requestChangePassword(data) {
  return axios
    .put(API.USER_CHANGE_PASSWORD, convertCamelCaseToSnakeCase(data))
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function requestForgetPassword(data) {
  return axios
    .post(API.USER_FORGET_PASSWORD, data)
    .then((res) => {
      if (res.data) {
        return res.data;
      } else {
        return res.data;
      }
    })
    .catch((error) => {
      return error.message;
    });
}

export function getAccessToken(refreshToken) {
  return axios
    .post(API.REFRESH_TOKEN, { refreshToken: refreshToken })
    .then((response) => {
      if (response?.status === 200) return response?.data;
      return null;
    })
    .catch((err) => {
      console.log("err", err);
      return null;
    });
}

