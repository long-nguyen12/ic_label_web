import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Form, message, Row, Upload } from "antd";
import { useTranslation } from "react-i18next";
import CustomModal from "@components/CustomModal";
import CustomSkeleton from "@components/CustomSkeleton";
import { CONSTANTS, RULES } from "@constants";
import { cloneObj } from "@app/common/functionCommons";
// import { getAllLabels } from '@app/services/Customer';
import { getAllPositionNoQuery } from '../../services/Position';
import { getCustomerById } from '@app/services/Customer';
import { getAllSalebillsByUserID } from '@app/services/Salebills';
import { getAllProductNoQuery } from '@app/services/Product';
import axios from 'axios';
const layoutCol = { xs: 24, md: 12, xl: 12, xxl: 12 };
const labelCol = { xs: 24 };

function CreateCustomer({ myInfo, isModalVisible, handleOk, handleCancel, createCustomerSelected, ...props }) {
  const [formCreateCustomer] = Form.useForm();
  const [listPosition, setlistPosition] = useState([])
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
      setlistPosition(apiPosition.docs)
    }
  }

  function onFinish(data) {
    const newData = {
      customer_full_name: data.customerFullName,
      customer_mobi: data.customerMobi,
      customer_email: data.customerEmail,
      customer_add: data.customerAddress,
      customer_bank_account_number: data.customerBankAccountNumber,
      customer_bank_account_info: data.customerBankAccountInfo,
      customer_tax_code: data.customerTaxCode,
      customer_note: data.customerBankAccountNote,
      position_id: data.positionId,
      customer_discount: data.customerDiscount
    };
    if (props.isLoading) return;
    handleOk(newData);
  }
  function convertDataSelect(list) {
    let arrConvert = []
    list.map(data => {
      let objConvert = {}
      objConvert.label = data.positionName;
      objConvert.value = data._id;
      arrConvert.push(objConvert)
    })
    return arrConvert
  }

  function onChangeForm(fieldSelected, dataSelected) {
    if (fieldSelected['positionId']) {
      let _idSelected = fieldSelected['positionId'];
      listPosition.map(data => {
        if (data._id === _idSelected) {
          formCreateCustomer.setFieldsValue({
            customerDiscount: data.positionDiscount,
          });
        }
      });
    }

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
        <Form id="form-modal" form={formCreateCustomer} onFinish={onFinish}
          onValuesChange={(fieldSelected, dataSelected) => onChangeForm(fieldSelected, dataSelected)}
        >
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
            {listPosition && <CustomSkeleton
              label={'Chọn chức vụ'}
              name="positionId"
              layoutCol={layoutCol}
              labelCol={labelCol}
              options={convertDataSelect(listPosition)}
              type={CONSTANTS.SELECT}
              rules={[RULES.REQUIRED]}
              form={formCreateCustomer}
            />
            }
            <CustomSkeleton
              label={t('Chiết khấu')}
              name="customerDiscount"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
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
              label={t("Email")}
              name="customerEmail"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              // rules={[RULES.REQUIRED, RULES.EMAIL]}
              form={formCreateCustomer}
            />
            <CustomSkeleton
              label={t("Tài khoản ngân hàng")}
              name="customerBankAccountNumber"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              // rules={[RULES.REQUIRED, RULES.NUMBER]}
              form={formCreateCustomer}
            />
            <CustomSkeleton
              label={t('Thông tin tài khoản')}
              name="customerBankAccountInfo"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              // rules={[RULES.REQUIRED]}
              form={formCreateCustomer}
            />
            <CustomSkeleton
              label={t('Mã số thuế')}
              name="customerTaxCode"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              form={formCreateCustomer}
            />
            <CustomSkeleton
              label={t('Ghi chú')}
              name="customerNote"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              form={formCreateCustomer}
            />
            <CustomSkeleton
              label={t()}
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

export default connect(mapStateToProps)(CreateCustomer);
