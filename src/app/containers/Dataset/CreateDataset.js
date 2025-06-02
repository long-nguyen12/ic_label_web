import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Form, message, Row, Upload } from "antd";
import { useTranslation } from "react-i18next";
import CustomModal from "@components/CustomModal";
import CustomSkeleton from "@components/CustomSkeleton";
import { CONSTANTS, RULES } from "@constants";
import { cloneObj } from "@app/common/functionCommons";
// import { getAllLabels } from '@app/services/Customer';
import { getAllPositionNoQuery } from "../../services/Position";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";
const layoutCol = { xs: 24, md: 12, xl: 12, xxl: 12 };
const labelCol = { xs: 24 };

const { Dragger } = Upload;

const props = {
  name: "file",
  multiple: false,
  // action: API.API_HOST + API.FILE,
  onChange(info) {
    const { status } = info.file;
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

function CreateCustomer({ myInfo, isModalVisible, handleOk, handleCancel, createCustomerSelected, ...props }) {
  const [formCreateCustomer] = Form.useForm();
  const [listPosition, setlistPosition] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    getData();
    if (isModalVisible) {
      formCreateCustomer.resetFields();
      if (createCustomerSelected) {
        const dataField = cloneObj(createCustomerSelected);
        formCreateCustomer.setFieldsValue(dataField);
      }
    }
  }, [isModalVisible]);

  async function getData() {
    const apiPosition = await getAllPositionNoQuery();
    if (apiPosition) {
      setlistPosition(apiPosition.docs);
    }
  }

  function onFinish(data) {
    const newData = {
      user_full_name: data.customerFullName,
      user_mobi: data.customerMobi,
      user_email: data.customerEmail,
      user_add: data.customerAddress,
      user_bank_account_number: data.customerBankAccountNumber,
      user_bank_account_info: data.customerBankAccountInfo,
      user_tax_code: data.customerTaxCode,
      user_note: data.customerBankAccountNote,
      position_id: data.positionId,
      user_discount: data.customerDiscount,
    };
    if (props.isLoading) return;
    handleOk(newData);
  }
  function convertDataSelect(list) {
    let arrConvert = [];
    list.map((data) => {
      let objConvert = {};
      objConvert.label = data.positionName;
      objConvert.value = data._id;
      arrConvert.push(objConvert);
    });
    return arrConvert;
  }

  function onChangeForm(fieldSelected, dataSelected) {
    if (fieldSelected["positionId"]) {
      let _idSelected = fieldSelected["positionId"];
      listPosition.map((data) => {
        if (data._id === _idSelected) {
          formCreateCustomer.setFieldsValue({
            customerDiscount: data.positionDiscount,
          });
        }
      });
    }
  }

  const handleUpload = async (options) => {
    // const { file, onSuccess, onError, onProgress } = options;

    // try {
    //   const formData = new FormData();
    //   formData.append("file", file);

    //   const config = {
    //     headers: {
    //       "content-type": "multipart/form-data",
    //     },
    //     onUploadProgress: (progressEvent) => {
    //       // Calculate percentage of file upload progress
    //       const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    //       // Call onProgress callback to update progress
    //       onProgress({ percent: percentCompleted });
    //     },
    //   };

    //   // Make a POST request to the server with the file
    //   const response = await request.post(API.FILE, formData, config);

    //   // If the request is successful, call onSuccess callback
    //   onSuccess(response.data, file);
    // } catch (error) {
    //   // If there's an error, call onError callback
    //   // console.log("error",error)
    //   onError(error);
    // }
  };

  return (
    <>
      <CustomModal
        width="1200px"
        title={t("Tạo người dùng mới")}
        visible={isModalVisible}
        onCancel={handleCancel}
        isLoadingSubmit={props.isLoading}
        isDisabledClose={props.isLoading}
        closeLabel={t("HUY")}
        submitLabel={t("LUU")}
      >
        <Form
          id="form-modal"
          form={formCreateCustomer}
          onFinish={onFinish}
          onValuesChange={(fieldSelected, dataSelected) => onChangeForm(fieldSelected, dataSelected)}
        >
          <Row gutter={15}>
            <CustomSkeleton
              label={t("Tên bộ dữ liệu")}
              name="datasetName"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formCreateCustomer}
            />
            <CustomSkeleton
              label={t("Mô tả")}
              name="datasetNote"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formCreateCustomer}
            />
            <Row>
              <Dragger
              {...props}
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

export default connect(mapStateToProps)(CreateCustomer);

