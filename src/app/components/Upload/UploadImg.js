import React, {useRef, useState, useEffect} from 'react';
import {Button, Modal, Upload} from "antd";
import {DownloadOutlined, UploadOutlined} from "@ant-design/icons";
import {getBase64} from "./imageUtil";
export default function ImgUplMulti({ fileListOrg, onChange  }) {

  const [fileListShow, setFileList] = React.useState(fileListOrg);
  const [preview, setPreview] = useState({
    previewImage: '',
    previewVisible: false,
    previewTitle: '',
  })

  useEffect(() => {
    setFileList(fileListOrg)
  }, [fileListOrg]);

  const handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreview({
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.originFileObj.name,
    });
  };
  return <>
    <Upload
      accept="image/*"
      listType="picture-card"
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
      onPreview={handlePreview}
      showUploadList={{
        showPreviewIcon: true,
        showDownloadIcon: true,
        showRemoveIcon: true,
        downloadIcon: (file) => <a download href={file.url}><DownloadOutlined /></a>
      }}
    >
      <Button icon={<UploadOutlined />}>Upload</Button>
    </Upload>

    <Modal
      style={{top: 10}}
      visible={preview.previewVisible}
      title={preview.previewTitle}
      footer={null}
      onCancel={() => setPreview({...preview, previewVisible: false})}
    >
      <img alt="example" style={{ width: '100%' }} src={preview.previewImage} />
    </Modal>

  </>
}

ImgUplMulti.defaultProps = {
  fileListOrg: []
}
