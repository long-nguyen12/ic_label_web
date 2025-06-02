import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Form, message, Row, Upload } from "antd";
import { useTranslation } from "react-i18next";

import CustomModal from "@components/CustomModal";
import CustomSkeleton from "@components/CustomSkeleton";
import { CONSTANTS, RULES } from "@constants";
import { cloneObj } from "@app/common/functionCommons";
import { formatNumber } from '@src/utils';
// import { getAllLabels } from '@app/services/Position';

const layoutCol = { xs: 24, md: 24 };
const labelCol = { xs: 24 };

function CreatePosition({ myInfo, isModalVisible, handleOk, handleCancel, createPositionSelected, ...props }) {
  const [formCreatePosition] = Form.useForm();
  const { t } = useTranslation();

  useEffect(() => {
    if (isModalVisible) {
      formCreatePosition.resetFields();
      if (createPositionSelected) {
        const dataField = cloneObj(createPositionSelected);
        formCreatePosition.setFieldsValue(dataField);
      }
    }
  }, [isModalVisible]);

  function onFinish(data) {
    const newData = {
      position_name: data.positionName,
      position_description: data.positionDescription ? data.positionDescription : "",
    };
    if (props.isLoading) return;
    handleOk(newData);
  }

  return (
    <>
      <CustomModal
        width="800px"
        title={"Thêm mới chức vụ"}
        visible={isModalVisible}
        onCancel={handleCancel}
        isLoadingSubmit={props.isLoading}
        isDisabledClose={props.isLoading}
        closeLabel={t("HUY")}
        submitLabel={t("LUU")}
      >
        <Form id="form-modal" form={formCreatePosition} onFinish={onFinish}>
          <Row gutter={15}>
            <CustomSkeleton
              label={"Tên chức vụ"}
              name="positionName"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formCreatePosition}
            />
            <CustomSkeleton
              label={t("MO_TA")}
              name="positionDescription"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT_AREA}
              // rules={[RULES.REQUIRED]}
              autoSize={{ minRows: 2, maxRows: 3 }}
              form={formCreatePosition}
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

export default connect(mapStateToProps)(CreatePosition);
