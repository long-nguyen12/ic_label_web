import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Form, message, Row, Upload } from "antd";
import { useTranslation } from "react-i18next";
import CustomModal from "@components/CustomModal";
import CustomSkeleton from "@components/CustomSkeleton";
import { CONSTANTS, RULES } from "@constants";
import { cloneObj } from "@app/common/functionCommons";
import { getAllPositionNoQuery } from "../../services/Position";
import axios from "axios";
const layoutCol = { xs: 24, md: 12, xl: 12, xxl: 12 };
const labelCol = { xs: 24 };

function CreateUser({ myInfo, isModalVisible, handleOk, handleCancel, createUserSelected, ...props }) {
  const [formCreateUser] = Form.useForm();
  const [listPosition, setlistPosition] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    getData();
    if (isModalVisible) {
      formCreateUser.resetFields();
      if (createUserSelected) {
        const dataField = cloneObj(createUserSelected);
        formCreateUser.setFieldsValue(dataField);
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
    if (data?.userRole !== undefined || data?.userRole !== null) {
      data.userClassify = data.userRole;
      let roleName = listPosition.filter((item) => {
        if (item._id === data.userRole) {
          return item.tenvaitro;
        }
      });
      data.role = roleName[0].tenvaitro;
      delete data.userRole;
    }
    const newData = {
      user_name: data.userName,
      user_full_name: data.userFullName,
      user_mobi: data.userMobi,
      user_email: data.userEmail,
      user_add: data.userAddress,
      role: data.role,
      user_classify: data.userClassify,
      user_password: "123456", // default password
    };
    if (props.isLoading) return;
    handleOk(newData);
  }
  function convertDataSelect(list) {
    let arrConvert = [];
    list.map((data) => {
      let objConvert = {};
      objConvert.label = data.tenvaitro;
      objConvert.value = data._id;
      arrConvert.push(objConvert);
    });
    return arrConvert;
  }

  function onChangeForm(fieldSelected, dataSelected) {
    if (fieldSelected["userRole"]) {
      let _idSelected = fieldSelected["userRole"];
      listPosition.map((data) => {
        if (data._id === _idSelected) {
          formCreateUser.setFieldsValue({
            role: data.userRole,
          });
        }
      });
    }
  }

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
          form={formCreateUser}
          onFinish={onFinish}
          onValuesChange={(fieldSelected, dataSelected) => onChangeForm(fieldSelected, dataSelected)}
        >
          <Row gutter={15}>
            <CustomSkeleton
              label={t("Tên đăng nhập")}
              name="userName"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formCreateUser}
            />
            <CustomSkeleton
              label={t("Tên người dùng")}
              name="userFullName"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formCreateUser}
            />
            <CustomSkeleton
              label={t("Điện thoại")}
              name="userMobi"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formCreateUser}
            />
            {listPosition && (
              <CustomSkeleton
                label={"Chọn chức vụ"}
                name="userRole"
                layoutCol={layoutCol}
                labelCol={labelCol}
                options={convertDataSelect(listPosition)}
                type={CONSTANTS.SELECT}
                rules={[RULES.REQUIRED]}
                form={formCreateUser}
              />
            )}
            <CustomSkeleton
              label={t("Địa chỉ")}
              name="userAddress"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formCreateUser}
            />
            <CustomSkeleton
              label={t("Email")}
              name="userEmail"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              // rules={[RULES.REQUIRED, RULES.EMAIL]}
              form={formCreateUser}
            />
            <CustomSkeleton label={t()} />
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

export default connect(mapStateToProps)(CreateUser);

