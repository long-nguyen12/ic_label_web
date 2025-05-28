import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Form, message, Row, Upload } from "antd";
import { useTranslation } from "react-i18next";

import CustomModal from "@components/CustomModal";
import CustomSkeleton from "@components/CustomSkeleton";
import { CONSTANTS, RULES } from "@constants";
import { cloneObj } from "@app/common/functionCommons";
import { formatNumber } from '@src/utils';
// import { getAllLabels } from '@app/services/Product';

const layoutCol = { xs: 24, md: 24 };
const labelCol = { xs: 24 };

function CreateProduct({ myInfo, isModalVisible, handleOk, handleCancel, createProductSelected, ...props }) {
  const [formCreateProduct] = Form.useForm();
  const [imgsUploadView, setImgsUploadView] = useState([]);
  const [imgsUpload, setImgsUpload] = useState([]);
  // const [dataLabels, setDataLabels] = useState([]);
  const { t } = useTranslation();
  const prototype = {
    name: "file",
    multiple: true,
    listType: "picture-card",
    fileList: imgsUploadView,
    showUploadList: { showPreviewIcon: false },
    onChange({ fileList }) {
      setImgsUploadView(fileList);
    },
    beforeUpload(file, fileList) {
      if (file.type !== "image/png" && file.type !== "image/jpeg") {
        message.error(t("CHON_DUNG_DINH_DANG_ANH"));
      } else if (file.size / 1024 / 1024 > 50) {
        message.error(t("CHON_DUNG_KICH_THUOC_ANH"));
      } else {
        const newList = imgsUpload.concat(fileList);
        setImgsUpload(newList);
      }
      return file.type === "image/jpeg" || file.type === "image/png" ? false : Upload.LIST_IGNORE;
    },
    onRemove(file) {
      const index = imgsUploadView.indexOf(file);
      const newFileList = imgsUpload.slice();
      newFileList.splice(index, 1);
      setImgsUpload(newFileList);
    },
  };

  useEffect(() => {
    // getDataLabels();
    if (isModalVisible) {
      formCreateProduct.resetFields();
      if (createProductSelected) {
        const dataField = cloneObj(createProductSelected);
        formCreateProduct.setFieldsValue(dataField);
      }
    }
    setImgsUpload([]);
    setImgsUploadView([]);
  }, [isModalVisible]);

  function onFinish(data) {
    const newData = {
      product_name: data.productName,
      product_description: data.productDescription ? data.productDescription : "",
      product_price: data.productPrice,
      product_discount: data.productDiscount,
      product_unit: data.productUnit,
      product_image: imgsUpload,
    };
    if (props.isLoading) return;
    handleOk(newData);
  }

  return (
    <>
      <CustomModal
        width="1200px"
        title={"Thêm mới sản phẩm"}
        visible={isModalVisible}
        onCancel={handleCancel}
        isLoadingSubmit={props.isLoading}
        isDisabledClose={props.isLoading}
        closeLabel={t("HUY")}
        submitLabel={t("LUU")}
      >
        <Form id="form-modal" form={formCreateProduct} onFinish={onFinish}>
          <Row gutter={15}>
            <CustomSkeleton
              label={t("TEN_SAN_PHAM")}
              name="productName"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formCreateProduct}
            />
            <CustomSkeleton
              min={0}
              label={t('GIA_SAN_PHAM')}
              name="productPrice"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.NUMBER}
              rules={[RULES.REQUIRED, RULES.NUMBER_FLOAT]}
              form={formCreateProduct}
              formatter={value => formatNumber(value)}
            />
            <CustomSkeleton
              label={"Đơn vị tính"}
              name="productUnit"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              form={formCreateProduct}
              rules={[RULES.REQUIRED,]}

            />
            <CustomSkeleton
              label={t('CHIET_KHAU_SAN_PHAM') + ' (%)'}
              name="productDiscount"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.NUMBER}
              form={formCreateProduct}
              defaultValue={0}
              min={0}
              max={100}
              // formatter={value => `${value}%`}
              // parser={value => value.replace('%', '')}
            />
            <CustomSkeleton
              label={t("MO_TA")}
              name="productDescription"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT_AREA}
              // rules={[RULES.REQUIRED]}
              autoSize={{ minRows: 2, maxRows: 3 }}
              form={formCreateProduct}
            />
            <CustomSkeleton
              label={t("TAI_ANH_LEN")}
              name="images"
              layoutCol={layoutCol}
              labelCol={labelCol}
              // rules={[RULES.REQUIRED]}
            >
              <Upload {...prototype}>+ {t("THEM_ANH")}</Upload>
            </CustomSkeleton>
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

export default connect(mapStateToProps)(CreateProduct);
