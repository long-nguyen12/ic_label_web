import React, { useEffect, useState } from "react";
import CustomBreadcrumb from "@components/CustomBreadcrumb";
import { Divider, Typography, Row, Button, Upload, message } from "antd";
const { Title, Paragraph, Text, Link } = Typography;
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { NavLink, useHistory } from "react-router-dom";
import Loading from "@components/Loading";

import { CONSTANTS, USER_TYPE } from "@constants";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { API } from "../../../constants/API";
import { getDocumentFile } from "../../services/File";

const permitted_roles = [USER_TYPE.ADMIN.code, USER_TYPE.UPLOAD.code];

function Information({ myInfo }) {
  let history = useHistory();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [document, setDocument] = useState(null);

  useEffect(() => {
    getDocument();
  }, []);

  async function getDocument() {
    try {
      setLoading(true);
      const response = getDocumentFile();
      if (response.status === 200) {
        setDocument(response.data);
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      message.error("Không thể tải tài liệu hướng dẫn!");
    } finally {
      setLoading(false);
    }
  }

  function uploadPermission(role) {
    if (!permitted_roles.includes(role)) return false;
    return true;
  }

  const handleRemove = () => {
    setPdfUrl(null);
    setFileList([]);
  };

  const handleChange = ({ fileList }) => {
    setFileList(fileList.slice(-1));
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const url = URL.createObjectURL(fileList[0].originFileObj);
      setPdfUrl(url);
    } else {
      setPdfUrl(null);
    }
  };

  const beforeUpload = (file) => {
    const isPdf = file.type === "application/pdf";
    if (!isPdf) {
      message.error("Chỉ cho phép upload file PDF!");
    }
    return isPdf || Upload.LIST_IGNORE;
  };

  const handleUpload = async (options) => {
    const { file, onSuccess, onError, onProgress } = options;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const config = {
        headers: {
          "content-type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({ percent: percentCompleted });
        },
      };
      const response = await axios.post(API.UPLOAD_DOCUMENT, formData, config);
      onSuccess(response.data, file);
      if (response.status === 200) {
        message.success("Đã tải lên hướng dẫn thành công thành công!");
        setDocument(response.data);
      }
      setLoading(false);
    } catch (error) {
      onError(error);
    }
  };

  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={"Hướng dẫn sử dụng"}>
        <Row>
          {uploadPermission(myInfo.role) && (
            <Upload
              accept=".pdf"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              onRemove={handleRemove}
              customRequest={handleUpload}
              maxCount={1}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Chọn file PDF</Button>
            </Upload>
          )}
        </Row>
      </CustomBreadcrumb>
      <Loading active={loading} layoutBackground></Loading>
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps)(Information);
