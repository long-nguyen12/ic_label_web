import React from 'react';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import i18next from 'i18next';

export const SIDER_WIDTH = 270;

export const CONSTANTS = {
  LANG_VI: 'vi',
  LANG_EN: 'en',
  ALL: 'ALL',
  BARS: 'BARS',
  PREV: 'PREV',
  NEXT: 'NEXT',
  HIDDEN: 'HIDDEN',
  INITIAL: 'INITIAL',
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  LOGIN: 'LOGIN',
  DEFAULT: 'DEFAULT',
  DELETE: 'DELETE',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  SAVE: 'SAVE',
  CONFIRM: 'CONFIRM',
  CANCEL: 'CANCEL',
  CLOSE: 'CLOSE',

  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  YEAR: 'YEAR',
  DATE: 'DATE',
  TIME: 'TIME',
  DATE_TIME: 'DATE_TIME',
  TIME_DATE: 'TIME_DATE',
  FORMAT_DATE: 'DD/MM/YYYY',
  FORMAT_DATE_TIME: 'DD/MM/YYYY HH:mm',
  FORMAT_TIME_DATE: 'HH:mm DD/MM/YYYY',
  INPUT: 'INPUT',
  CHECK_BOX: 'CHECK_BOX',
  SELECT: 'SELECT',
  MULTI_SELECT: 'MULTI_SELECT',
  TEXT_AREA: 'TEXT_AREA',
  SELECT_MULTI: 'SELECT_MULTI',
  PASSWORD: 'PASSWORD',
  SWITCH: 'SWITCH',
  LABEL: 'LABEL',
  SELECT_LABEL: 'SELECT_LABEL',
  TREE_SELECT: 'TREE_SELECT',
  FILE: 'FILE',
  ONE_DAY: 'ONE_DAY',
  SLIDER: "SLIDER",

  DESTROY: 'DESTROY',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  INFO: 'INFO',
  WARNING: 'WARNING',

  NOT_IN: 'NOT_IN',
  NOT_UPLOADED: 'NOT_UPLOADED',
  UPLOADING: 'UPLOADING',
  UPLOADED: 'UPLOADED',
  UPLOAD_ERROR: 'UPLOAD_ERROR',

  NOT_FOUND: 'NOT_FOUND',
  RECTANGLE: 'RECTANGLE',
  POLYGON: 'POLYGON',
  POINT_SIZE: 8,
  ON_BLUR: 'onBlur',

  START: 'START',
  END: 'END',

  ADMIN: 'admin',
  MANAGE: 'manage',
  USER: 'user',
  UPLOAD: 'upload',
  ANNOTATE: 'annotate',

  TIME_REFRESH: 10,

  MAXIMUM_NUMBER_OF_PHOTOS: 15,
  NUMBER_OF_PHOTOS_PER_PICTURE: 5,
  TEST_PARAMETER: 10,
};

export const PAGINATION_INIT = Object.assign(
  {},
  {
    docs: [],
    currentPage: 1,
    pageSize: 10,
    totalDocs: 0,
    query: {},
  },
);

export const GENDER_OPTIONS = [
  { label: 'Nam', value: 'MALE' },
  { label: 'Nữ', value: 'FEMALE' },
  { label: 'Khác', value: 'OTHER' },
];

export const TOAST_MESSAGE = {
  SUCCESS: {
    DEFAULT: 'Thành công',
  },
  ERROR: {
    DEFAULT: 'MES_DEFAULT',
    LOGIN: 'MES_LOGIN',
    GET: 'MES_GET',
    POST: 'MES_POST',
    PUT: 'MES_PUT',
    DELETE: 'MES_DELETE',
    DESCRIPTION: 'MES_DESCRIPTION',
  },
  ICON: {
    SUCCESS: <CheckCircleOutlined className="float-left" style={{ fontSize: '24px', color: '#fff' }}/>,
    ERROR: <CloseCircleOutlined className="float-left" style={{ fontSize: '24px', color: '#fff' }}/>,
    INFO: <InfoCircleOutlined className="float-left" style={{ fontSize: '24px', color: '#fff' }}/>,
    WARNING: <WarningOutlined className="float-left" style={{ fontSize: '24px', color: '#fff' }}/>,
  },
};

export const RULES = {
  REQUIRED: { required: true, message: 'Không được để trống', langCode: 'REQUIRED' },
  NUMBER: { pattern: '^[0-9]+$', message: 'Không phải là số', langCode: 'NUMBER' },
  PHONE: { pattern: '^[0-9]+$', len: 10, message: 'Số điện thoại không hợp lệ', langCode: 'PHONE' },
  CMND: { required: true, pattern: '^[0-9]+$', message: 'Số CMND/CCCD không hợp lệ' },
  EMAIL: { type: 'email', message: 'Email không hợp lệ', langCode: 'EMAIL' },
  NUMBER_FLOAT: {
    pattern: new RegExp('^[- +]?[0-9]+[.]?[0-9]*([eE][-+]?[0-9]+)?$'),
    message: 'Không phải là số',
    langCode: 'NUMBER',
  },
  PASSWORD_FORMAT: {
    pattern: new RegExp('^(?=.*[a-z])(?=.*[0-9])(?!.* )(?=.{6,14})'),
    message: 'Mật khẩu phải có ít nhất một chữ cái và một chữ số, độ dài 6 đến 14 ký tự và không có khoảng trắng',
    langCode: 'PASSWORD_FORMAT',
  },
  USERNAME_RANGER: {
    pattern: new RegExp('^([a-zA-Z0-9_-]){6,32}$'),
    message: 'Tên tài khoản chỉ chấp nhận độ dài 6 đến 32 ký tự',
    langCode: 'USERNAME_RANGER',
  },
  USERNAME_LENGTH: {
    pattern: new RegExp('^(?!.* )(?=.{6,32})'),
    message: 'Tên tài khoản chỉ chấp nhận độ dài 6 đến 32 ký tự và không có khoảng trắng',
    langCode: 'USERNAME_LENGTH',
  },
  EVEN_NUMBER: {
    pattern: new RegExp('^[0-9]*[02468]$'),
    message: 'Phải là giá trị nguyên chia hết cho 2',
    langCode: 'EVEN_NUMBER',
  },
  URL_FORMAT: {
    pattern: '(http|ftp|https)://[\\w-]+(\\.[\\w-]+)+([\\w.,@?^=%&amp;:/~+#-]*[\\w@?^=%&amp;/~+#-])?',
    message: 'Đường dẫn không phù hợp',
    langCode: 'URL_FORMAT',
  },
};

export const PAGINATION_CONFIG = Object.assign(
  {},
  {
    pageSizeOptions: ['10', '20', '50', '100'],
    showSizeChanger: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} ${(i18next.t.bind(i18next))('CUA')} ${total}`,
  },
);

export const KIEM_TRA = 'KIEM_TRA';
export const SUA_CHUA_BAO_DUONG = 'SUA_CHUA_BAO_DUONG';
export const DO_THONG_SO = 'DO_THONG_SO';

export const KIEU_DU_LIEU = {
  VAN_BAN: { code: 'VAN_BAN', label: 'Văn bản' },
  THOI_GIAN: { code: 'THOI_GIAN', label: 'Thời gian' },
  DANH_SACH: { code: 'DANH_SACH', label: 'Danh sách' },
};

export const COLOR = {
  DEFAULT: '#00003c',
  THIET_BI: '#91FC02',
  BAT_THUONG: '#f5222d',
  REVERSE_BAT_THUONG: '#FFFFFF',
  ACTIVE: '#2f54eb',
  REVERSE_ACTIVE: '#FFFFFF',
  MID_POINT: 'rgba(47,84,235,0.4)',
};

export const USER_TYPE = {
  USER: { code: 'user', label: 'Nhân viên' },
  MANAGE: { code: 'manage', label: 'Quản lý đơn vị' },
  ADMIN: { code: 'admin', label: 'Quản trị hệ thống' },
  UPLOAD: {code: 'upload', label: 'Người thu thập dữ liệu'},
  ANNOTATE: {code: 'annotate', label: 'Người gán nhãn dữ liệu'},
};

export const USER_STATUS = {
  ACTIVE: { code: true, label: 'Hoạt động' },
  INACTIVE: { code: false, label: 'Tạm khóa' },
};

export const SHARE_PERMISSION = {
  SHARE_FULL: { code: 'share_full', label: 'Toàn quyền' },
  SHARE_PART: { code: 'share_part', label: 'Thêm sửa xóa tất cả ảnh' },
  SHARE_VIEW: { code: 'share_view', label: 'Thêm sửa xóa ảnh của mình' },
  NO_SHARE: { code: 'no_share', label: 'Hủy chia sẻ' },
};

export const DATASET_STATUS = {
  SUCCESS: { label: 'Tạo thành công', color: 'success' },
  INIT: { label: 'Đang tạo', color: 'purple' },
};
