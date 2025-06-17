export const API = {
  LOGIN: "/api/users/login",
  USERS: "/api/users",
  MY_INFO: "/api/users/me",
  UPDATE_MY_INFO: "/api/users/info",
  REFRESH_TOKEN: "/api/auth/refreshtoken",
  USER_CHANGE_PASSWORD: "/api/users/change-password",

  NOTIFICATION: "/api/notification",
  NOTIFICATION_ID: "/api/notification/{0}",

  UPLOAD_IMAGES: "/api/files",
  UPLOAD_FILE: "/api/files/upload-file",

  UPLOAD_IMG: "/backend/api/dataset/addimages/{0}",

  ALL_MODEL: "/model/models",

  DETAIL_MODEL: "/model/models/{0}",
  DEVICE: "/model/device",
  STOP_TRAIN: "/model/stop",
  DEPLOY: "/model/deploy",
  TEST: "/model/detect",

  DOWNLOAD_DATASET: "/backend/api/image/download/downloadDataset/{0}",

  CREATE_WIZARD: "/backend/api/process",
  DELETE_WIZARD: "/backend/api/process/{0}",
  UPDATE_WIZARD: "/backend/api/process/{0}",
  ALL_WIZARD: "/backend/api/process?count=1",
  WIZARD_ID: "/backend/api/process/{0}",

  FILES: "/api/files/{0}",
  IMAGES: "/api/files/image/{0}",
  AVATAR: "/api/files/avatar/{0}",

  ALL_USER: "/api/users",
  CREATE_USER: "/api/users/",
  GET_USER: "/api/users/{0}",
  UPDATE_USER: "/api/users/{0}",
  DELETE_USER: "/api/users/{0}",
  GENERATE_USER_PASSWORD: "/api/users/generate-password/{0}",

  POSITION: "/api/phan-quyen-vai-tro",
  POSITION_ID: "/api/phan-quyen-vai-tro/{0}",
  ALL_POSITION: "/api/phan-quyen-vai-tro",
  CREATE_POSITION: "/api/phan-quyen-vai-tro/",

  HISTORY: "/api/lich-su-hoat-dong",

  DATASET: "/api/dataset",
  DATASET_ID: "/api/dataset/{0}",
  DATASET_ANNOTATION: "/api/dataset/{0}/download",
  DATASET_IMAGE: "/api/dataset/images",

  GALLERY: "/api/gallery",
  GENERATE_GALLERY_AI: "/api/gallery/generate-ai-image/{0}",

  GALLERY_CAPTION: "/api/gallery/all",
  GALLERY_ID: "/api/gallery/{0}",
  GALLERY_ROTATE_LEFT: "/api/gallery/rotate-left/{0}?angle={1}",
  GALLERY_ROTATE_RIGHT: "/api/gallery/rotate-right/{0}?angle={1}",
};
