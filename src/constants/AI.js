export const THU_VIEN = {
  YOLO: { label: 'Yolo', value: 'yolo' },
  RESNET: { label: 'Resnet', value: 'resnet' },
  MOBILEFACE: { label: 'Mobileface', value: 'mobileface' },
};

export const THU_VIEN_OBJECT_DETECTION = {
  YOLO: { label: 'Yolo', value: 'yolo' },
  MOBILEFACE: { label: 'Mobileface', value: 'mobileface' },
};

export const THU_VIEN_IMAGE_CLASSIFICATION = {
  RESNET: { label: 'Resnet', value: 'resnet' },
};

export const ATTACK_METHODS = {
  FGSM: { label: 'Fast Gradient Sign Method', value: 'fgsm' },
};

export const MODEL_TYPE = {
  OBJECT_DETECTION: { label: 'Phát hiện đối tượng - Object detection', value: 'objects_detection' },
  IMAGE_CLASSIFICATION: {
    label: 'Phân loại đối tượng - classification ',
    value: 'classification',
  },
};

export const THAM_SO = {
  HIGH: { value: 'high', label: 'Cao - High' },
  MEDIUM: { value: 'medium', label: 'Trung bình - Medium' },
};

export const LOG_MODEL = {
  TRAIN: { value: 'Train loss' },
  VAL: { value: 'Val loss' },
};

export const MODEL_STATUS = {
  INIT: { value: 'init', label: 'DANG_KHOI_TAO', color: 'pink' },
  TRAINING: { value: 'training', label: 'DANG_HUAN_LUYEN', color: 'purple' },
  FAILED: { value: 'failed', label: 'LOI_HUAN_LUYEN', color: 'error' },
  TRAINED: {
    value: 'trained',
    label: 'DA_HUAN_LUYEN',
    color: 'blue',
    suffix: { label: 'CHUA_HOAT_DONG', color: 'orange' },
  },
  DEPLOY_ACTIVE: {
    value: 'deploy_active',
    label: 'DANG_HOAT_DONG',
    color: 'green',
    prefix: { label: 'DA_HUAN_LUYEN', color: 'blue' },
  },
  DEPLOY_INACTIVE: {
    value: 'deploy_inactive',
    label: 'DANG_TAM_DUNG',
    color: 'warning',
    prefix: { label: 'DA_HUAN_LUYEN', color: 'blue' },
  },
};
