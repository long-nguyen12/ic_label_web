export const API = {
  LOGIN: '/api/users/login',
  USERS: '/api/users',
  MY_INFO: '/api/users/me',
  UPDATE_MY_INFO: '/api/users/info',
  REFRESH_TOKEN: '/api/auth/refreshtoken',
  USER_CHANGE_PASSWORD: '/api/users/change-password',

  NOTIFICATION: '/api/notification',
  NOTIFICATION_ID: '/api/notification/{0}',

  UPLOAD_IMAGES: '/api/files',

  ALL_PRODUCT: '/api/products',
  PRODUCT_ID: '/api/products/{0}',
  CREATE_PRODUCT: '/api/products/',

  ALL_CUSTOMER: '/api/customers',
  CUSTOMER_ID: '/api/customers/{0}',
  CREATE_CUSTOMER: '/api/customers/',
  // DATASET_IMAGE: '/backend/api/image',
  // ALL_DATASET_NO_PAGINATION: '/backend/api/dataset',

  ALL_DATASET: '/backend/api/dataset?count=1',
  DATASET_ID: '/backend/api/dataset/{0}',
  CREATE_DATASET: '/backend/api/dataset',
  DATASET_IMAGE: '/backend/api/image',
  ALL_DATASET_NO_PAGINATION: '/backend/api/dataset',

  IMG_DETAIL: '/backend/api/image/{0}',
  LABEL_BY_DATASET_ID: '/backend/api/label/{0}',
  IMG_DELETE: '/backend/api/image/{0}',
  IMG_DELETE_MANY: '/backend/api/image/delete/deleteMany',

  MODEL_BY_DATASET_ID: '/model/train',
  OPPOSITE_BY_DATASET_ID: '/model/noise',

  REINFORCED_MODEL: '/model/train_improvement',
  ALL_REINFORCED_MODEL: '/model/model_improvement',
  DETAIL_REINFORCED_MODEL: '/model/model_improvement/{0}',
  STOP_REINFORCED: '/model/stop_improvement',

  UPLOAD_IMG: '/backend/api/dataset/addimages/{0}',

  ALL_MODEL: '/model/models',

  DETAIL_MODEL: '/model/models/{0}',
  DEVICE: '/model/device',
  STOP_TRAIN: '/model/stop',
  DEPLOY: '/model/deploy',
  TEST: '/model/detect',

  // ALL_USER: '/backend/api/user',
  // CREATE_USER: '/backend/api/auth/signup',
  // UPDATE_USER: '/backend/api/user/{0}',
  // DELETE_USER: '/backend/api/user/{1}',
  CHANGE_PWS: '/backend/api/user/change-password',
  CREATE_CAMERA_CATE: '/backend/api/cameracate',
  ALL_CAMERA_CATE: '/backend/api/cameracate?count=1',
  FIND_CAMERA_CATE: '/backend/api/cameracate/{0}',

  ALL_LABELS: '/backend/api/label',
  CREATE_LABELS: '/backend/api/label',
  DELETE_LABELS: '/backend/api/label/{0}',

  ALL_DATAOPPOSITE: '/backend/api/datanoise?count=1',
  DATAOPPOSITE_ID: '/backend/api/datanoise/{0}',
  DATAOPPOSITE_IMAGE: '/backend/api/image',

  ALL_CAMERA: '/backend/api/camera?count=1',
  CREATE_CAMERA: '/backend/api/camera',
  UPDATE_CAMERA: '/backend/api/camera/{0}',
  DELETE_CAMERA: '/backend/api/camera/{1}',
  STOP_STREAM: '/backend/api/camera/stream/stop-stream',
  PLAY_STREAM: '/backend/api/camera/stream/start-stream',
  CAMERA_CATE: '/backend/api/cameracate?count=1',
  CREATE_CAPTURE: '/backend/api/camera/captureFrame',
  FILTER_CAPTURE: '/backend/api/image',

  DOWNLOAD_DATASET: '/backend/api/image/download/downloadDataset/{0}',

  CREATE_WIZARD: '/backend/api/process',
  DELETE_WIZARD: '/backend/api/process/{0}',
  UPDATE_WIZARD: '/backend/api/process/{0}',
  ALL_WIZARD: '/backend/api/process?count=1',
  WIZARD_ID: '/backend/api/process/{0}',

  // QUẢN LÝ BÁN HÀNG
  FILES: '/api/files/{0}',
  IMAGES: '/api/files/image/{0}',
  AVATAR: '/api/files/avatar/{0}',

  ALL_USER: '/api/users',
  CREATE_USER: '/api/users/',
  GET_USER: '/api/users/{0}',
  UPDATE_USER: '/api/users/{0}',
  DELETE_USER: '/api/users/{1}',

  ALL_SALE_BILLS: '/api/salebills',
  ALL_SALE_BILLS_EXPORT: '/api/report/export',
  SALE_BILLS_ID: '/api/salebills/{0}',
  CREATE_SALE_BILLS: '/api/salebills/',

  ALL_SALE_BILLS_DETAIL: '/api/salebills-detail',
  SALE_BILLS_DETAIL_ID: '/api/salebills-detail/{0}',
  CREATE_SALE_BILLS_DETAIL: '/api/salebills-detail/',

  REPORT_QUERY: '/api/report?limit=0',

  POSITION: '/api/phan-quyen-vai-tro',
  POSITION_ID: '/api/phan-quyen-vai-tro/{0}',
  ALL_POSITION: '/api/phan-quyen-vai-tro',
  CREATE_POSITION: '/api/phan-quyen-vai-tro/',
};
