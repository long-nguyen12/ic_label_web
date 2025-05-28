import { Button, Popconfirm, Row, Form, Col } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { convertUrlToImagesList, getfileDetail } from '@components/Upload/imageUtil';
import CustomSkeleton from '@components/CustomSkeleton';
import CustomBreadcrumb from '@components/CustomBreadcrumb';
import UploadImg from '@components/Upload/UploadImg';
import { URL } from '@url';
import { toast, convertCamelCaseToSnakeCase } from '@app/common/functionCommons';
import { CONSTANTS, RULES } from '@constants';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined } from '@ant-design/icons';
import './ProductDetail.scss';
import { getProductById, updateProduct, deleteProduct } from '@app/services/Product';
import { uploadImages } from '@app/services/File';
import axios from 'axios';
import { formatNumber } from '@src/utils';


const layoutCol = { xs: 24, md: 24 };
const labelCol = { xs: 24 };

function ProductDetail({ myInfo }) {
  let history = useHistory();
  let { id } = useParams();
  const { t } = useTranslation();

  const [formCreateProduct] = Form.useForm();
  const [imgsUpload, setImgsUpload] = useState([]);
  const [productDetail, setProductDetail] = useState(null);
  const isMyProduct = productDetail?.userId?._id === myInfo._id;
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    getProductDetail();
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);
  const isMobile = width <= 768;
  async function getProductDetail() {
    const apiResponse = await getProductById(id);
    if (apiResponse) {
      formCreateProduct.setFieldsValue({
        productName: apiResponse?.productName,
        productDescription: apiResponse?.productDescription,
        productPrice: apiResponse?.productPrice,
        productDiscount: apiResponse?.productDiscount,
        productImage: apiResponse?.productImage,
        productUnit: apiResponse?.productUnit,

      });
      setProductDetail(apiResponse);
      setImgsUpload(convertUrlToImagesList(apiResponse?.productImage));
    }
  }

  async function handleDelete() {
    const api = await deleteProduct(id);
    if (api) {
      toast(CONSTANTS.SUCCESS, t('XOA_SAN_PHAM_THANH_CONG'));
      history.replace(URL.PRODUCT_MANAGEMENT);
    }
  }

  async function handleUpdateProduct(data) {
    let [originImageNm, imageUpload] = getfileDetail(imgsUpload);
    if (imageUpload.length) {
      let images = await uploadImages(imageUpload);
      if (images && images.length) {
        originImageNm = [...originImageNm, ...images];
      }
    }
    data.productImage = originImageNm;
    const api = await updateProduct(id, convertCamelCaseToSnakeCase(data));
    if (api) {
      toast(CONSTANTS.SUCCESS, 'Cập nhật dữ liệu thành công!');
      await getProductDetail();
    }
  }

  function handleImage(value) {
    setImgsUpload(value);
  }


  return (
    <>
      {isMobile ? (
        <Col>
          <CustomBreadcrumb breadcrumbLabel={'CHI TIẾT SẢN PHẨM'}> </CustomBreadcrumb>
          <Row>
            <Button
              className="mr-2"
              type="primary"
              ghost
              icon={<i className="fa fa-arrow-left mr-1"/>}
              onClick={() => history.goBack()}
            >
              {t('QUAY_LAI')}
            </Button>
            {(isMyProduct || myInfo.role === CONSTANTS.ADMIN) && (
              <Popconfirm
                title={t('XOA_SAN_PHAM')}
                onConfirm={handleDelete}
                okText={t('XOA')}
                cancelText={t('HUY')}
                okButtonProps={{ type: 'danger' }}
              >
                <Button danger icon={<DeleteOutlined style={{ fontSize: 15 }}/>}>
                  {t('XOA_SAN_PHAM')}
                </Button>
              </Popconfirm>
            )}
          </Row>
        </Col>) : (<CustomBreadcrumb breadcrumbLabel={'CHI TIẾT SẢN PHẨM'}>
        <Button
          className="mr-2"
          type="primary"
          ghost
          icon={<i className="fa fa-arrow-left mr-1"/>}
          onClick={() => history.goBack()}
        >
          {t('QUAY_LAI')}
        </Button>
        {(isMyProduct || myInfo.role === CONSTANTS.ADMIN) && (
          <Popconfirm
            title={t('XOA_SAN_PHAM')}
            onConfirm={handleDelete}
            okText={t('XOA')}
            cancelText={t('HUY')}
            okButtonProps={{ type: 'danger' }}
          >
            <Button danger icon={<DeleteOutlined style={{ fontSize: 15 }}/>}>
              {t('XOA_SAN_PHAM')}
            </Button>
          </Popconfirm>
        )}
      </CustomBreadcrumb>)
      }


      {productDetail && (
        <div className="site-layout-background">
          <Form id="form-modal" form={formCreateProduct} onFinish={handleUpdateProduct}>
            <Row gutter={15}>
              <CustomSkeleton
                label={t('TEN_SAN_PHAM')}
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
                label={'Đơn vị tính'}
                name="productUnit"
                layoutCol={layoutCol}
                labelCol={labelCol}
                rules={[RULES.REQUIRED]}
                type={CONSTANTS.TEXT}
                form={formCreateProduct}
              />
              <CustomSkeleton
                label={t('CHIET_KHAU_SAN_PHAM') + ' (%)'  }
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
                label={t('MO_TA')}
                name="productDescription"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT_AREA}
                autoSize={{ minRows: 2, maxRows: 3 }}
                form={formCreateProduct}
              />
              <CustomSkeleton
                label="Tải ảnh lên"
                name="productImage"
                layoutCol={layoutCol}
                labelCol={labelCol}
                // rules={[RULES.REQUIRED]}
              >
                <UploadImg fileListOrg={imgsUpload} onChange={(data) => handleImage(data)}>+ Thêm ảnh</UploadImg>
              </CustomSkeleton>
            </Row>
            <Row gutter={24}>
              <Button
                size="default"
                type="primary"
                htmlType="submit"
                className="btn"
                // disabled={false}
                // {...(onOk ? { onClick: onOk } : null)}
                // loading={isLoading && !isDisabledSubmit}
                // icon={submitIcon}
              >
                {/* {submitLabel} */}
                Lưu
              </Button>
            </Row>
          </Form>
        </div>
      )}
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps, null)(ProductDetail);
