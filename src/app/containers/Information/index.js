import React from "react";
import CustomBreadcrumb from "@components/CustomBreadcrumb";
import Loading from "@components/Loading";
import { Button, Col, Row, Typography, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { connect } from "react-redux";

import { UploadOutlined } from "@ant-design/icons";
import { USER_TYPE } from "@constants";
import axios from "axios";
import { Document, Page, setOptions } from "react-pdf";
import { API } from "../../../constants/API";
import BASE_URL from "../../../constants/BASE_URL";
import { getDocumentFile } from "../../services/File";

setOptions({
  cMapUrl: "cmaps/",
  cMapPacked: true,
});
const permitted_roles = [USER_TYPE.ADMIN.code, USER_TYPE.UPLOAD.code];

function Information({ myInfo }) {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  useEffect(() => {
    getDocument();
  }, []);

  async function getDocument() {
    try {
      setLoading(true);
      const response = await getDocumentFile();
      if (response) {
        const pdf = `${BASE_URL.BASE_URL}/${response?.filePath}`;
        setPdfUrl(pdf);
      }
    } catch (error) {
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
    setLoading(true);
    setPdfUrl(null);
    try {
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
      // onSuccess(response.data, file);
      if (response.status === 200) {
        message.success("Đã tải lên hướng dẫn thành công thành công!");
        await getDocument();
      }
      setLoading(false);
    } catch (error) {
      message.error("Không thể tải lên tài liệu hướng dẫn!");
    } finally {
      setLoading(false);
    }
  };

  function onPageRenderSuccess(page) {}

  const pageProps = {
    className: "custom-classname-page",
    onClick: (event, page) => {},
    onRenderSuccess: onPageRenderSuccess,
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
      <Loading active={loading} layoutBackground>
        {pdfUrl && (
          <Col align="center">
            <Document file={pdfUrl} loading={"Đang tải dữ liệu"} onLoadSuccess={onDocumentLoadSuccess}>
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  {...pageProps}
                  inputRef={pageNumber === index + 1 ? (ref) => ref && ref.scrollIntoView() : null}
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                />
              ))}
            </Document>
          </Col>
        )}
      </Loading>
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps)(Information);
