import React, { useEffect } from 'react';
import {Button, Upload} from "antd";
import {DownloadOutlined, UploadOutlined} from "@ant-design/icons";
export default function UploadFile({ fileListOrg, onChange  }) {

  const [fileListShow, setFileList] = React.useState(fileListOrg);

  useEffect(() => {
    setFileList(fileListOrg)
  }, [fileListOrg]);

  return <>
    <Upload
      accept=".doc,.docx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,.pdf,.ppt,.pptx,"
      fileList={fileListShow}
      onChange={({file, fileList}) => {
        setFileList(fileList)
        onChange(fileList)
      }}
      beforeUpload={(file, fileList) => {
        // then upload `file` from the argument manually
        return false;
      }}
      multiple={true}
      showUploadList={{
        showPreviewIcon: true,
        showDownloadIcon: true,
        showRemoveIcon: true,
        downloadIcon: (file) => <a download href={file.url}><DownloadOutlined /></a>
      }}
    >
      <Button icon={<UploadOutlined />}>Upload</Button>
    </Upload>

  </>
}

UploadFile.defaultProps = {
  fileListOrg: []
}
