import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Form, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../../utils';
import CustomModal from '@components/CustomModal';
import CustomSkeleton from '@components/CustomSkeleton';
import { CONSTANTS, RULES } from '@constants';
import { cloneObj } from '@app/common/functionCommons';

const labelCol = { xs: 24 };
const layoutCol2 = { xs: 24, md: 12, xl: 12, xxl: 12 };

function CreateProductOfBill({
                               listProduct,
                               myInfo,
                               typeAction,
                               isModalVisible,
                               handleOk,
                               handleCancel,
                               createProductOfBillSelected,
                               customerDetail,
                               ...props
                             }) {
  const [formCreateProductOfBill] = Form.useForm();
  const { t } = useTranslation();
  const [productSelected, setProductSelected] = useState(null);
  const [stt, setStt] = useState(0);
  useEffect(() => {
    if (isModalVisible) {
      formCreateProductOfBill.resetFields();
      if (createProductOfBillSelected) {
        const dataField = cloneObj(createProductOfBillSelected);
        formCreateProductOfBill.setFieldsValue(dataField);
      }
    }
  }, [isModalVisible]);

  function onFinish(data) {
    if (typeAction === 'ADD') setStt(stt + 1);
    const newData = {
      _id: typeAction === 'ADD' ? stt + 1 : createProductOfBillSelected._id,
      productId: data.productId,
      productName: data.productName,
      productPrice: data.productPrice,
      productUnit: data.productUnit,
      productNumber: data.productNumber,
      totalMoney: data.totalMoney,
      productDiscount: data.productDiscount,
      totalMoneyAfterDiscount: data.totalMoneyAfterDiscount,
    };
    if (props.isLoading) return;
    handleOk(newData);
  }

  function onChangeForm(fieldSelected, dataSelected) {
    if (fieldSelected['productId']) {
      let _idSelected = fieldSelected['productId'];
      listProduct.map(data => {
        if (data._id === _idSelected) {
          setProductSelected(data);
          let productDiscount = customerDetail.customerDiscount ? parseInt(customerDetail.customerDiscount) : data.productDiscount ? parseInt(data.productDiscount) : 0
          let moneyDiscount = parseInt(data.productPrice) * productDiscount / 100
          formCreateProductOfBill.setFieldsValue({
            productPrice: data.productPrice,
            productUnit: data.productUnit,
            productNumber: 1,
            totalMoney: data.productPrice * 1,
            productDiscount: productDiscount,
            totalMoneyAfterDiscount: parseInt(data.productPrice) - moneyDiscount,
          });
        }
      });
    }


    if (fieldSelected['productNumber']) {
      let productNumber = fieldSelected['productNumber'];
      let totalMoney = dataSelected.productPrice * productNumber
      let moneyDiscount = totalMoney * dataSelected.productDiscount / 100;
      let totalMoneyAfterDiscount = dataSelected.productPrice * productNumber - moneyDiscount;
      formCreateProductOfBill.setFieldsValue({
        totalMoney: totalMoney,
        totalMoneyAfterDiscount: totalMoneyAfterDiscount,
      });
    }

    if (fieldSelected['productPrice']) {
      let productPrice = fieldSelected['productPrice'];
      let totalMoney = dataSelected.productNumber * productPrice;
      let moneyDiscount = totalMoney * dataSelected.productDiscount / 100;
      let totalMoneyAfterDiscount = dataSelected.productPrice * dataSelected.productNumber - moneyDiscount;
      formCreateProductOfBill.setFieldsValue({
        totalMoney: totalMoney,
        totalMoneyAfterDiscount: totalMoneyAfterDiscount,
      });
    }
    if (fieldSelected['productDiscount'] >= 0) {
      let moneyDiscount = dataSelected.totalMoney * dataSelected.productDiscount / 100;
      let totalMoneyAfterDiscount = dataSelected.productPrice * dataSelected.productNumber - moneyDiscount;
      formCreateProductOfBill.setFieldsValue({
        totalMoneyAfterDiscount: totalMoneyAfterDiscount,
      });
    }
  }

  function convertDataSelect(list) {
    let arrConvert = [];
    list.map(data => {
      let objConvert = {};
      objConvert.label = data.productName;
      objConvert.value = data._id;
      arrConvert.push(objConvert);
    });
    return arrConvert;
  }

  return (
    <>
      <CustomModal
        width="800px"
        title={t('TAO_SAN_PHAM_MOI')}
        visible={isModalVisible}
        onCancel={handleCancel}
        isLoadingSubmit={props.isLoading}
        isDisabledClose={props.isLoading}
        closeLabel={t('HUY')}
        submitLabel={t('LUU')}
      >
        <Form id="form-modal" form={formCreateProductOfBill}
              onValuesChange={(fieldSelected, dataSelected) => onChangeForm(fieldSelected, dataSelected)}
              onFinish={onFinish}>
          <Row gutter={15}>
            <CustomSkeleton
              label={'Chọn sản phẩm'}
              name="productId"
              layoutCol={layoutCol2}
              labelCol={labelCol}
              options={convertDataSelect(listProduct)}
              type={CONSTANTS.SELECT}
              rules={[RULES.REQUIRED]}
              form={formCreateProductOfBill}
            />

            <CustomSkeleton
              label={'Đơn vị tính'}
              name="productUnit"
              layoutCol={layoutCol2}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              form={formCreateProductOfBill}
              disable={true}
            />
            <CustomSkeleton
              label={'Đơn giá (VND)'}
              name="productPrice"
              layoutCol={layoutCol2}
              labelCol={labelCol}
              type={CONSTANTS.NUMBER}
              rules={[RULES.REQUIRED, RULES.NUMBER_FLOAT]}
              form={formCreateProductOfBill}
              min={1000}
              formatter={value => formatNumber(value)}
            />

            <CustomSkeleton
              label={'Số lượng'}
              name="productNumber"
              layoutCol={layoutCol2}
              labelCol={labelCol}
              type={CONSTANTS.NUMBER}
              rules={[RULES.REQUIRED, RULES.NUMBER_FLOAT]}
              form={formCreateProductOfBill}
              initialValues={1}
              min={1}
            />
            <CustomSkeleton
              label={'Thành tiền ( VND = SL x Đơn giá)'}
              name="totalMoney"
              layoutCol={layoutCol2}
              labelCol={labelCol}
              type={CONSTANTS.NUMBER}
              rules={[RULES.REQUIRED]}
              form={formCreateProductOfBill}
              disabled={true}
              formatter={value => formatNumber(value)}
            />
            <CustomSkeleton
              label={"Chiết khấu (%)"}
              name="productDiscount"
              layoutCol={layoutCol2}
              labelCol={labelCol}
              type={CONSTANTS.NUMBER}
              rules={[RULES.REQUIRED, RULES.NUMBER_FLOAT]}
              form={formCreateProductOfBill}
              initialValues={0}
              min={0}
              max={100}
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
            />
            <CustomSkeleton
              label={'Thành tiền sau chiết khấu (VND)'}
              name="totalMoneyAfterDiscount"
              layoutCol={layoutCol2}
              labelCol={labelCol}
              type={CONSTANTS.NUMBER}
              // rules={[RULES.REQUIRED, RULES.NUMBER]}
              form={formCreateProductOfBill}
              formatter={value => formatNumber(value)}
              disabled={true}
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

export default connect(mapStateToProps)(CreateProductOfBill);
