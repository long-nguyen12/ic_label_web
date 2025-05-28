import axios from "axios";
import fileDownload from "js-file-download";

import { API } from "@api";
import { toast, renderMessageError, convertSnakeCaseToCamelCase } from "@app/common/functionCommons";
import { CONSTANTS } from "@constants";

export function downloadByFileId(fileId, fileName) {
  return axios
    .get(API.FILE_ID.format(fileId), { responseType: "blob" })
    .then((res) => {
      if (res.data) fileDownload(res.data, fileName);
      return null;
    })
    .catch(() => {
      return toast(CONSTANTS.ERROR, "File đã bị xóa hoặc không tồn tại. Vui lòng kiểm tra và thử lại");
    });
}

export function uploadImages(files) {
  const config = {
    headers: { "content-type": "multipart/form-data" },
  };
  let path = API.UPLOAD_IMAGES;
  let dataRes = [];
  const uploaders = files.map((file, index) => {
    const formData = new FormData();
    formData.append("image", file);
    return axios
      .post(path, formData, config)
      .then((response) => {
        const data = convertSnakeCaseToCamelCase(response?.data);
        if (data) dataRes = [...dataRes, data.fileId];
      })
      .catch((error) => {
        renderMessageError(error);
        return null;
      });
  });

  return axios.all(uploaders).then(
    axios.spread(function (res1, res2) {
      return dataRes;
    })
  );
}
