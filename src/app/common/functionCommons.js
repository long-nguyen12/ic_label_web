import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { message, Tooltip, TreeSelect } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { camelCase, isEqual, isObject, kebabCase, snakeCase, transform } from 'lodash';
import queryString from 'query-string';
import i18next from 'i18next';

import { CONSTANTS, KIEU_DU_LIEU, PAGINATION_CONFIG, TOAST_MESSAGE } from '@constants';
import { COLOR } from '../common/CanvasCommon/ColorConstants';

export function cloneObj(input = {}) {
  return JSON.parse(JSON.stringify(input));
}

function renderQuery(queryInput, queryAdd, firstCharacter) {
  let queryOutput = queryInput ? '&' : firstCharacter;
  queryOutput += queryAdd;
  return queryOutput;
}

export function handleReplaceUrlSearch(history, page, limit, query) {
  const queryObj = cloneObj(query);
  delete queryObj.page;
  delete queryObj.limit;
  let search = '';
  if (page || page === 0) {
    search += search ? '&' : '';
    search += `page=${page}`;
  }
  if (limit || limit === 0) {
    search += search ? '&' : '';
    search += `limit=${limit}`;
  }
  if (Object.values(queryObj).length) {
    search += search.length > 1 ? '&' : '';
    search += convertObjectToQuery(queryObj);
  }
  history.replace({ search });
}

export function convertObjectToQuery(queryObj) {
  let query = '';
  const sortable = Object.fromEntries(Object.entries(queryObj).sort(([, a], [, b]) => a - b));
  Object.entries(sortable).forEach(([key, value]) => {
    query += query ? '&' : '';
    query += `${kebabCase(key)}=${value}`;
  });
  return query;
}

export function convertQueryToObject(queryStr) {
  return convertSnakeCaseToCamelCase(queryString.parseUrl(queryStr).query);
}

export function convertParam(queryObj, firstCharacter = '?') {
  if (typeof queryObj !== 'object') return '';
  queryObj = convertObjectToSnakeCase(queryObj);
  let query = '';
  const sortable = Object.fromEntries(Object.entries(queryObj).sort(([, a], [, b]) => a - b));
  Object.entries(sortable).forEach(([key, value]) => {
    if (value) {
      if (['number', 'string', 'boolean'].includes(typeof value) || Array.isArray(value)) {
        query += query ? '&' : firstCharacter || '';
        if (!key.includes(CONSTANTS.HIDDEN.toLowerCase())) {
          query += `${key}=${value}`;
        } else {
          query += value;
        }
      } else if (typeof value === 'object') {
        if (value.hasOwnProperty('lt')) {
          query += renderQuery(query, `${key}<${value.lt}`, firstCharacter);
        }
        if (value.hasOwnProperty('lte')) {
          query += renderQuery(query, `${key}<=${value.lte}`, firstCharacter);
        }
        if (value.hasOwnProperty('gt')) {
          query += renderQuery(query, `${key}>${value.gt}`, firstCharacter);
        }
        if (value.hasOwnProperty('gte')) {
          query += renderQuery(query, `${key}>=${value.gte}`, firstCharacter);
        }
      }
    }
  });
  return query;
}

export function convertFileName(str) {
  if (!str) return '';

  str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a');
  str = str.replace(/[èéẹẻẽêềếệểễ]/g, 'e');
  str = str.replace(/[ìíịỉĩ]/g, 'i');
  str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o');
  str = str.replace(/[ùúụủũưừứựửữ]/g, 'u');
  str = str.replace(/[ỳýỵỷỹ]/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A');
  str = str.replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E');
  str = str.replace(/[ÌÍỊỈĨ]/g, 'I');
  str = str.replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O');
  str = str.replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U');
  str = str.replace(/[ỲÝỴỶỸ]/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  str = str.replace(/\s+/g, ' ');
  str.trim();
  return str;
}

export function findMax(data) {
  if (!Array.isArray(data) || !data.length) return null;
  let max = typeof data[0] === 'number' ? data[0] : Array.isArray(data[0]) && data[0][0] ? data[0][0] : 0;
  data.forEach((item) => {
    if (typeof item === 'number') {
      max = max < item ? item : max;
    }
    if (Array.isArray(item)) {
      item.forEach((itemChild) => {
        max = max < itemChild ? itemChild : max;
      });
    }
  });
  return max;
}

export function setCookieToken(authToken) {
  const tokenDecode = jwtDecode(authToken);
  if (tokenDecode.exp) {
    Cookies.set('token', authToken, { expires: new Date(new Date(tokenDecode.exp * 1000)) });
  }
}

export function setRefreshToken(refreshToken) {
  Cookies.set('refreshToken', refreshToken);
}

export function randomKey() {
  return Math.floor(Math.random() * 100000000000);
}

export function checkTokenExp(authToken) {
  if (!authToken) return;
  try {
    const exp = jwtDecode(authToken).exp;
    const now = Date.now().valueOf() / 1000;
    return now < exp;
  } catch (e) {
    return null;
  }
}

export function checkRefeshToken(authToken) {
  if (!authToken) return;
  try {
    const exp = jwtDecode(authToken).exp;
    const now = Date.now().valueOf() / 1000;
    return exp - now;
  } catch (e) {
    return null;
  }
}

export function hexToRgb(hex) {
  if (!hex) return null;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return result ? `rgb(${r}, ${g}, ${b})` : null;
}

export function getMessageError(err, method) {
  const t = i18next.t.bind(i18next);
  if (err && err.message === CONSTANTS.CANCEL) return null;
  return err && err.response && err.response.data && err.response.data.message
    ? err.response.data.message
    : t(TOAST_MESSAGE.ERROR[method]);
}

export function renderMessageError(err, method) {
  const t = i18next.t.bind(i18next);
  if (err && err.message === CONSTANTS.CANCEL) return null;
  const errorMethod = method || err?.response?.config?.method || CONSTANTS.DEFAULT;
  const messageString = err?.response?.data?.message || t(TOAST_MESSAGE.ERROR[errorMethod]) || t(TOAST_MESSAGE.ERROR.DEFAULT);
  toast(CONSTANTS.ERROR, messageString, t(TOAST_MESSAGE.ERROR.DESCRIPTION));
}

//
export function toast(type, label = '') {
  if (!type) return;
  message[type.toLowerCase()](label);
}

export function columnIndex(pageSize, currentPage) {
  return {
    title: 'STT',
    align: 'center',
    render: (value, row, index) => index + 1 + pageSize * (currentPage - 1),
    width: 50,
  };
}

export function difference(object, base) {
  return transform(object, (result, value, key) => {
    if (!isEqual(value, base[key])) {
      result[key] = isObject(value) && isObject(base[key]) ? difference(value, base[key]) : value;
    }
  });
}

export function convertMoment(dateTime) {
  try {
    return dateTime && moment(new Date(dateTime)).isValid() ? moment(new Date(dateTime)) : '';
  } catch (e) {
    return null;
  }
}

export function formatDate(dateTime) {
  try {
    return dateTime && moment(dateTime).isValid() ? moment(dateTime).format('DD/MM/YYYY') : '';
  } catch (e) {
    return null;
  }
}

export function formatDateTime(dateTime) {
  try {
    return dateTime && moment(dateTime).isValid() ? moment(dateTime).format('DD/MM/YYYY HH:mm') : '';
  } catch (e) {
    return null;
  }
}

export function formatTimeDate(dateTime) {
  try {
    return dateTime && moment(dateTime).isValid() ? moment(dateTime).format('HH:mm DD/MM/YYYY') : '';
  } catch (e) {
    return null;
  }
}

export function renderRowData(label, value, labelWidth = '100px') {
  return (
    <div className="clearfix" style={{ lineHeight: '20px' }}>
      <strong style={{ fontSize: '12px', fontStyle: 'italic', width: labelWidth }} className="float-left">
        {label}:
      </strong>
      <div className="ml-3">{value}</div>
    </div>
  );
}

export function renderRowDataIdentified(label, value, labelWidth = '100px') {
  return (
    <div className="clearfix" style={{ lineHeight: '20px' }}>
      <strong style={{ fontSize: '14px', fontStyle: 'italic', width: labelWidth }} className="float-left">
        {label}:
      </strong>
      <div className="ml-3">{value}</div>
    </div>
  );
}

export function renderCard(label, value, className, disabled) {
  return (
    <div className={className} style={{ borderRadius: 5, color: 'white' }} disabled={disabled}>
      <span style={{ fontSize: disabled ? '22px' : '20px', textAlign: 'center' }}>{label}</span>
      <br/>
      <strong style={{ fontSize: '20px', textAlign: 'center' }}>{value}</strong>
    </div>
  );
}

export function capitalizeFirstLetter(string) {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatQueryOneDay(time) {
  const gte = moment(time).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  const lt = moment(gte).add({ days: 1 });
  return { gte: gte.toISOString(), lt: lt.toISOString() };
}

export function convertArrayObjToCamelCase(objInput) {
  objInput = JSON.parse(JSON.stringify(objInput));
  return objInput.map((obj) => {
    return convertObjToCamelCase(obj);
  });
}

export function convertObjToCamelCase(objInput) {
  if (!objInput) return;
  objInput = JSON.parse(JSON.stringify(objInput));
  const objOutput = {};
  Object.entries(objInput).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value = value.map((item) => {
        if (typeof item === 'string') {
          return item;
        } else if (Array.isArray(item)) {
          return convertArrayObjToCamelCase(item);
        } else {
          return convertObjToCamelCase(item);
        }
      });
    } else if (typeof value === 'object') {
      value = convertObjToCamelCase(value);
    }
    if (key === '_id') {
      objOutput._id = value;
      objOutput.key = value;
    } else {
      objOutput[camelCase(key)] = value;
    }
  });
  return objOutput;
}

export function convertObjToSnakeCase(objInput) {
  if (!objInput) return;
  objInput = JSON.parse(JSON.stringify(objInput));
  const objOutput = {};
  Object.entries(objInput).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value = value.map((item) => {
        if (typeof item === 'string') {
          return item;
        } else {
          return convertObjToSnakeCase(item);
        }
      });
    } else if (typeof value === 'object') {
      value = convertObjToSnakeCase(value);
    }
    if (key === '_id') {
      objOutput._id = value;
      objOutput.key = value;
    } else {
      objOutput[snakeCase(key)] = value;
    }
  });
  return objOutput;

  // if (!objInput) return;
  // objInput = JSON.parse(JSON.stringify(objInput));
  // const objOutput = {};
  // Object.entries(objInput).forEach(([key, value]) => {
  //   if (key === '_id') {
  //     objOutput._id = value;
  //   } else {
  //     objOutput[snakeCase(key)] = value;
  //   }
  // });
  // return objOutput;
}

export function paginationConfig(onChange, state, paginationConfig = PAGINATION_CONFIG) {
  const pagination = Object.assign({}, paginationConfig);
  if (onChange) {
    pagination.onChange = onChange;
  }
  if (state) {
    pagination.current = state.currentPage;
    pagination.total = state.totalDocs;
    pagination.pageSize = state.pageSize;
  }
  return pagination;
}

export function cloneDevice(device = {}, options = {}) {
  const deviceReturn = cloneObj(device);
  deviceReturn.key = deviceReturn.key || deviceReturn._id;
  deviceReturn.isLoading = false;
  deviceReturn.isEditing = false;
  deviceReturn.isDeleted = false;
  deviceReturn.help = {};
  return Object.assign({}, deviceReturn, options);
}

//--------------------------------------------------------------------
export function convertSnakeCaseToCamelCase(dataInput) {
  if (typeof dataInput === 'object') {
    if (Array.isArray(dataInput)) {
      let objOutput = [];
      dataInput.forEach((item) => {
        objOutput = [...objOutput, convertSnakeCaseToCamelCase(item)];
      });
      return objOutput;
    } else {
      return convertObjectToCamelCase(dataInput);
    }
  }
  return dataInput;
}

export function convertObjectToCamelCase(objInput) {
  if (!objInput) return objInput;
  const objOutput = {};
  Object.entries(objInput).forEach(([key, value]) => {
    if (key === 'extra') {
      objOutput[key] = value;
    } else {
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          // array
          objOutput[camelCase(key)] = convertSnakeCaseToCamelCase(value);
        } else {
          // object
          objOutput[camelCase(key)] = convertObjectToCamelCase(value);
        }
      } else {
        if (key === '_id') {
          objOutput._id = value;
          objOutput.key = value;
        } else {
          objOutput[camelCase(key)] = value;
        }
      }
    }
  });
  return objOutput;
}

//--------------------------------------------------------------------
export function convertCamelCaseToSnakeCase(dataInput) {
  dataInput = cloneObj(dataInput);
  if (typeof dataInput === 'object') {
    if (Array.isArray(dataInput)) {
      let objOutput = [];
      dataInput.forEach((item) => {
        objOutput = [...objOutput, convertCamelCaseToSnakeCase(item)];
      });
      return objOutput;
    } else {
      return convertObjectToSnakeCase(dataInput);
    }
  }
  return dataInput;
}

export function convertObjectToSnakeCase(objInput) {
  if (!objInput) return objInput;
  objInput = cloneObj(objInput);
  const objOutput = {};
  Object.entries(objInput).forEach(([key, value]) => {
    if (key === 'extra') {
      objOutput[key] = value;
    } else {
      if (typeof value === 'object') {
        if (moment.isMoment(value)) {
          objOutput[snakeCase(key)] = value;
        } else if (Array.isArray(value)) {
          // array
          objOutput[snakeCase(key)] = convertCamelCaseToSnakeCase(value);
        } else {
          // object
          objOutput[snakeCase(key)] = convertObjectToSnakeCase(value);
        }
      } else {
        if (key === '_id') {
          objOutput._id = value;
        } else {
          objOutput[snakeCase(key)] = value;
        }
      }
    }
  });
  return objOutput;
}

//--------------------------------------------------------------------
export function genPolygonFromRectangle({ x, y, width, height, polygons }) {
  if (Array.isArray(polygons) && polygons.length) return polygons;

  return [
    { offsetX: x, offsetY: y },
    { offsetX: x + width, offsetY: y },
    { offsetX: x + width, offsetY: y + height },
    { offsetX: x, offsetY: y + height },
  ];
}

export function checkPointInsideObject(point, polygon) {
  let x = point.offsetX,
    y = point.offsetY;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].offsetX,
      yi = polygon[i].offsetY;
    let xj = polygon[j].offsetX,
      yj = polygon[j].offsetY;
    let intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function convertObjectToArray(objectInput) {
  let arrayOutput = [];

  if (typeof objectInput === 'object' && !Array.isArray(objectInput)) {
    Object.entries(objectInput).forEach(([, value]) => {
      arrayOutput = [...arrayOutput, value];
    });
  }
  return arrayOutput;
}

export function formatUnique(arr) {
  return Array.from(new Set(arr)); //
}

export function calPageNumberAfterDelete({ docs, currentPage }) {
  if (!Array.isArray(docs) || !currentPage || currentPage === 1) return 1;
  return docs.length === 1 ? currentPage - 1 : currentPage;
}

export function renderTreeNode(children) {
  if (!Array.isArray(children)) return null;
  return children.map((child) => {
    return (
      <TreeSelect.TreeNode key={child.key} value={child._id} title={child?.tenDonVi} selectable={child?.selectable}>
        {renderTreeNode(child.children)}
      </TreeSelect.TreeNode>
    );
  });
}

export function renderFilterTreeUnit(orgUnitTree, defaultValue) {
  if (!Array.isArray(orgUnitTree) || !orgUnitTree) return;

  return (
    <TreeSelect
      size="small"
      showSearch
      style={{ width: '100%' }}
      className="select-label"
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      placeholder="Tất cả đơn vị"
      treeDefaultExpandAll
      allowClear
      {...(defaultValue ? { defaultValue } : null)}
    >
      {renderTreeNode(orgUnitTree)}
    </TreeSelect>
  );
}

export function checkLoaded() {
  return document.readyState === 'complete';
}

// export function formatFormDataExtra(dataInput = {}, modelExtraData = []) {
//   const dataOutput = cloneObj(dataInput);
//   if (dataOutput.extra) {
//     Object.entries(dataOutput.extra).forEach(([key, value]) => {
//       const fieldType = modelExtraData.find((extra) => extra.fieldKey === key)?.fieldType;
//       switch (fieldType) {
//         case KIEU_DU_LIEU.VAN_BAN.code:
//           dataOutput[`extra-${key}`] = value;
//           break;
//         case KIEU_DU_LIEU.THOI_GIAN.code:
//           dataOutput[`extra-${key}`] = convertMoment(value);
//           break;
//         case KIEU_DU_LIEU.DANH_SACH.code:
//           dataOutput[`extra-${key}`] = value?._id || value;
//           break;
//         default:
//           break;
//       }
//     });
//     delete dataOutput.extra;
//   }
//   return dataOutput;
// }

// export function formatQueryDataExtra(dataInput) {
//   const dataOutput = { ...dataInput };
//   Object.entries(dataOutput).forEach(([key, value]) => {
//     if (key.includes('extra-')) {
//       const extraFieldKey = key.substring(key.indexOf('-') + 1);
//       if (dataOutput.hasOwnProperty('extra')) {
//         dataOutput.extra[extraFieldKey] = value;
//       } else {
//         dataOutput.extra = { [extraFieldKey]: value };
//       }
//       delete dataOutput[key];
//     }
//   });
//   return dataOutput;
// }

export function formatTypeSkeletonExtraData(extra) {
  let type = null,
    options = null;
  switch (extra.fieldType) {
    case KIEU_DU_LIEU.VAN_BAN.code:
      type = CONSTANTS.TEXT;
      break;
    case KIEU_DU_LIEU.THOI_GIAN.code:
      type = CONSTANTS.DATE;
      break;
    case KIEU_DU_LIEU.DANH_SACH.code:
      type = CONSTANTS.SELECT;
      options = { data: extra.fieldOptions };
      break;
    default:
      break;
  }
  return { type, options };
}

export function checkIsValidDate(date) {
  return moment(new Date(parseInt(date))).isValid() ? moment(new Date(parseInt(date))) : '';
}

export function downloadFile(linkTo, label, title = 'Tải xuống tập tin') {
  return (
    <Tooltip title={title} placement="topRight">
      <Link
        to={linkTo}
        target="_blank"
        download
        style={{ alignSelf: 'center', color: 'geekblue' }}
        className="font-italic"
      >
        <DownloadOutlined/> {label}
      </Link>
    </Tooltip>
  );
}

export function formatCanvasData(dataInput) {
  if (!Array.isArray(dataInput)) return [];
  return dataInput.map((item) => formatCanvasItem(item));
}

export function formatCanvasItem(item) {
  item = cloneObj(item);
  item.type = Array.isArray(item.polygons) && item.polygons.length ? 'POLYGON' : 'RECTANGLE';
  item.polygons = Array.isArray(item.polygons) ? item.polygons : [];
  item.position = Array.isArray(item.polygons) && item.polygons.length ? item.polygons : {};
  item.position.offsetX = item.x;
  item.position.offsetY = item.y;
  item.position.width = item.width;
  item.position.height = item.height;
  item.active = false;
  item.drawing = false;
  item.display = true;
  item.disabled = !!item._id;
  // item.label = item?.dmThietBiId?.tenThietBi;
  item.strokeStyle = COLOR.THIET_BI;
  item.activeStrokeStyle = COLOR.ACTIVE;
  item.key = item.key || randomKey();
  item.x = item.xmin;
  item.y = item.ymin;
  item.width = item.xmax - item.xmin;
  item.height = item.ymax - item.ymin;
  return item;
}

export function revertDataset(array, itemArray) {
  const fromIndex = array.indexOf(itemArray);
  const elementArr = array.splice(fromIndex, 1)[0];
  array.splice(0, 0, elementArr);
  return array;
}
