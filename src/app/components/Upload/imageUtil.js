import {API} from '@api';
import { BASE_URL } from '@src/constants/BASE_URL';

export function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}


export const convertUrlToImagesList = (list) => {
  let arr = list.map((data, idx) => {
    return {
      uid: idx,
      name: data,
      status: 'done',
      url: `${API.IMAGES}`.format(data),
      fileNm: data,
    };
  });
  return arr;
};

export const getfileDetail = (listFile) => {
  let originFileNm = [];
  let fileUpload = [];
  listFile.filter(data => {
    if (data.url) {
      originFileNm = [...originFileNm, data.name];
    } else {
      fileUpload = [...fileUpload, data.originFileObj];
    }
  });
  return [originFileNm, fileUpload];
};
