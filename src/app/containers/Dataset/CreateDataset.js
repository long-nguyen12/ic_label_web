import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Form, message, Row, Upload } from "antd";
import { useTranslation } from "react-i18next";
import CustomModal from "@components/CustomModal";
import CustomSkeleton from "@components/CustomSkeleton";
import { CONSTANTS, RULES, BASE_URL } from "@constants";
import { API } from "@api";
import { cloneObj } from "@app/common/functionCommons";
// import { getAllLabels } from '@app/services/Dataset';
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAllUserNoQuery } from "../../services/User";
const layoutCol = { xs: 24, md: 12, xl: 12, xxl: 12 };
const labelCol = { xs: 24 };

const { Dragger } = Upload;

const uploadProps = {
  name: "file",
  multiple: false,
  // action: BASE_URL + API.UPLOAD_FILE,
  onChange(info) {
    const { status } = info.file;
    console.log("onChange", info.file, info.fileList);
    if (status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (status === "done") {
      message.success(`${info.file.name} file đã được upload thành công.`);
    }
    if (status === "error") {
      message.error(`${info.file.name} file tồn tại.`);
    }
  },
  onDrop(e) {
    console.log("Dropped files", e.dataTransfer.files);
  },
};

function CreateDataset({ myInfo, isModalVisible, handleOk, handleCancel, createDatasetSelected, ...props }) {
  const [formCreateDataset] = Form.useForm();
  const [datasetAvailable, setDatasetAvailable] = useState(null);
  const [users, setUsers] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (isModalVisible) {
      formCreateDataset.resetFields();
      if (createDatasetSelected) {
        const dataField = cloneObj(createDatasetSelected);
        formCreateDataset.setFieldsValue(dataField);
      }
    }
    getData();
  }, [isModalVisible]);

  async function getData() {
    try {
      const data = await getAllUserNoQuery();
      if (data) {
        setUsers(data.docs);
      }
    } catch (error) {
      console.error("Error fetching labels:", error);
    }
  }

  function onFinish(data) {
    const newData = {
      dataset_name: data.datasetName,
      dataset_note: data.datasetNote,
      dataset_path: data.datasetPath,
    };
    if (props.isLoading) return;
    handleOk(newData);
  }

  const handleUpload = async (options) => {
    const { file, onSuccess, onError, onProgress } = options;
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
      const response = await axios.post(API.UPLOAD_FILE, formData, config);
      onSuccess(response.data, file);
      if (response.status === 200) {
        setDatasetAvailable(response.data);
        formCreateDataset.setFieldsValue({
          datasetPath: response.data?.extractPath,
        });
      }
    } catch (error) {
      onError(error);
    }
  };

  function convertDataSelect(list) {
    let arrConvert = [];
    list.map((data) => {
      let objConvert = {};
      objConvert.label = data.userFullName || data.userName;
      objConvert.value = data._id;
      arrConvert.push(objConvert);
    });
    return arrConvert;
  }

  return (
    <>
      <CustomModal
        width="1200px"
        title={t("Tạo dataset mới")}
        visible={isModalVisible}
        onCancel={handleCancel}
        isLoadingSubmit={props.isLoading}
        isDisabledClose={props.isLoading}
        closeLabel={t("HUY")}
        submitLabel={t("LUU")}
      >
        <Form id="form-modal" form={formCreateDataset} onFinish={onFinish}>
          <Row gutter={15}>
            <CustomSkeleton
              label={t("Tên bộ dữ liệu")}
              name="datasetName"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formCreateDataset}
            />
            <CustomSkeleton
              label={t("Mô tả")}
              name="datasetNote"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formCreateDataset}
            />
            {users && (
              <CustomSkeleton
                label={"Chọn người gán nhãn bộ dữ liệu"}
                name="annotatorId"
                layoutCol={layoutCol}
                labelCol={labelCol}
                options={convertDataSelect(users)}
                type={CONSTANTS.SELECT}
                rules={[RULES.REQUIRED]}
                form={formCreateDataset}
              />
            )}
            <CustomSkeleton
              name="datasetPath"
              label={t("Đường dẫn bộ dữ liệu")}
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formCreateDataset}
              disabled={true}
              placeholder={t("Đường dẫn bộ dữ liệu sẽ được điền sau khi upload file thành công")}
            />
            <Dragger
              {...uploadProps}
              accept=".zip, .rar"
              customRequest={handleUpload}
              multiple={false}
              // showUploadList={{ showRemoveIcon: true }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Bấm hoặc kéo file vào để upload file</p>
              <p className="ant-upload-hint">Chỉ nhận file định dạng .zip hoặc .rar</p>
            </Dragger>
          </Row>
        </Form>
      </CustomModal>
    </>
  );
}

function mapStateToProps(store) {
  const { isLoading } = store.app;
  const { myInfo } = store.user;
  return { isLoading, myInfo };
}

export default connect(mapStateToProps)(CreateDataset);
