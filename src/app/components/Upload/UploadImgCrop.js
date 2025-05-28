import React, {useRef, useState, useEffect} from 'react';
import {Button, Modal, Upload} from "antd";
import {DownloadOutlined, UploadOutlined} from "@ant-design/icons";
import {getBase64} from "./imageUtil";
import ImgCrop from "antd-img-crop";
export default function ImgUplMultiCrop({ fileListOrg, aspect=2, onChange, multiple  }) {

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
    <ImgCrop rotate modalTitle="Tải ảnh lên" aspect={aspect}>
      <Upload
        accept="image/*"
        listType="picture-card"
        fileList={fileListShow}
        beforeUpload={(file, fileList) => {
          // then upload `file` from the argument manually
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            let arrFile = [{
              originFileObj: file,
              thumbUrl: reader.result
            }]
            if(multiple){
               arrFile = [...fileListShow, ...arrFile]
            }
            console.log(arrFile, 'arrFilearrFilearrFilearrFile')
            setFileList(arrFile);
            onChange(arrFile);
          };

          return false;
        }}
        onRemove={(file) => {
          let arrFile = fileListShow.filter(data => {
            return data.uid !== file.uid
          })
          setFileList(arrFile)
          onChange(arrFile);
        }}
        onPreview={handlePreview}
        showUploadList={{
          showPreviewIcon: true,
          showDownloadIcon: true,
          downloadIcon: (file) => <a download href={file.url}><DownloadOutlined /></a>
        }}
      >
        <Button icon={<UploadOutlined />}>Upload</Button>
      </Upload>
    </ImgCrop>

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

ImgUplMultiCrop.defaultProps = {
  fileListOrg: []
}
