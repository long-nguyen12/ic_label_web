import { put, select, takeLatest } from 'redux-saga/effects';
import Cookies from 'js-cookie';

import { message } from 'antd';

import { URL } from '@url';

import { getUserByToken, updateMyInfo } from '@app/services/User';
import { checkTokenExp } from '@app/common/functionCommons';

export const actionTypes = {
  RequestUser: 'User/RequestUser',
  UserLoaded: 'User/UserLoaded',
  UpdateMyInfo: 'User/UpdateMyInfo',
  ClearToken: 'App/ClearToken',
};

const initialState = {
  permissions: {},
  myInfo: {},
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.UserLoaded: {
      const { infoData } = action.payload;
      infoData.role = 'admin';
      return { ...state, myInfo: Object.assign({}, state.myInfo, infoData) };
    }
    default:
      return state;
  }
};

export const actions = {
  requestUser: (history) => ({ type: actionTypes.RequestUser, payload: { history } }),
  userLoaded: (infoData) => ({ type: actionTypes.UserLoaded, payload: { infoData } }),
  updateMyInfo: (myInfo) => ({ type: actionTypes.UpdateMyInfo, payload: { myInfo } }),
  clearToken: () => ({ type: actionTypes.ClearToken, payload: { token: null } }),
};

export function* saga() {
  yield takeLatest(actionTypes.RequestUser, function* requestUserSaga(data) {
    const { history } = data?.payload;
    const token = Cookies.get('token');
    if (checkTokenExp(token)) {
      const dataResponse = yield getUserByToken();
      if (dataResponse) {
        yield put(actions.userLoaded(dataResponse));
      }
    } else {
      yield put(actions.clearToken());
      history.push(URL.LOGIN);
    }
  });
  yield takeLatest(actionTypes.UpdateMyInfo, function* updateMyInfoSaga(data) {
    const dataResponse = yield updateMyInfo(data?.payload?.myInfo);
    if (dataResponse) {
      delete dataResponse.password;
      yield put(actions.userLoaded(dataResponse));
      message.success('Cập nhật thông tin thành công');
    }
  });
}
