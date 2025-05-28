import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Form, message, Row, Upload } from "antd";
import { useTranslation } from "react-i18next";

import CustomModal from "@components/CustomModal";
import CustomSkeleton from "@components/CustomSkeleton";
import { CONSTANTS, RULES } from "@constants";
import { cloneObj } from "@app/common/functionCommons";
// import { getAllLabels } from '@app/services/Customer';

const layoutCol = { xs: 24, md: 24 };
const labelCol = { xs: 24 };

function CreateSalebills({ myInfo, isModalVisible, handleOk, handleCancel, createCustomerSelected, ...props }) {
  const [formCreateCustomer] = Form.useForm();
  const { t } = useTranslation();

  useEffect(() => {
    // getDataLabels();
    if (isModalVisible) {
      formCreateCustomer.resetFields();
      if (createCustomerSelected) {
        const dataField = cloneObj(createCustomerSelected);
        formCreateCustomer.setFieldsValue(dataField);
      }
    }
  }, [isModalVisible]);

  function onFinish(data) {
    const newData = {
      customer_full_name: data.customerFullName,
      customer_mobi: data.customerMobi,
      customer_email: data.customerEmail,
      customer_add: data.customerAddress,
      customer_bank_account_number: data.customerBankAccountNumber,
      customer_tax_code: data.customerTaxCode,
    };
    if (props.isLoading) return;
    handleOk(newData);
  }

  return (
    <>
      <CustomModal
        width="1200px"
        title={t("Tạo khách hàng mới")}
        visible={isModalVisible}
        onCancel={handleCancel}
        isLoadingSubmit={props.isLoading}
        isDisabledClose={props.isLoading}
        closeLabel={t("HUY")}
        submitLabel={t("LUU")}
      >
        <Form id="form-modal" form={formCreateCustomer} onFinish={onFinish}>
          <Row gutter={15}>
            <CustomSkeleton
              label={t("Tên khách hàng")}
              name="customerFullName"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formCreateCustomer}
            />
            <CustomSkeleton
              label={t("Điện thoại")}
              name="customerMobi"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formCreateCustomer}
            />
            <CustomSkeleton
              label={t("Email")}
              name="customerEmail"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED, RULES.EMAIL]}
              form={formCreateCustomer}
            />
            <CustomSkeleton
              label={t("Địa chỉ")}
              name="customerAddress"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formCreateCustomer}
            />
            <CustomSkeleton
              label={t("Tài khoản ngân hàng")}
              name="customerBankAccountNumber"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED, RULES.NUMBER]}
              form={formCreateCustomer}
            />
            <CustomSkeleton
            label={t("Mã số thuế")}
            name="customerTaxCode"
            layoutCol={layoutCol}
            labelCol={labelCol}
            type={CONSTANTS.TEXT}
            rules={[RULES.REQUIRED, RULES.NUMBER]}
            form={formCreateCustomer}
          />
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

export default connect(mapStateToProps)(CreateSalebills);
