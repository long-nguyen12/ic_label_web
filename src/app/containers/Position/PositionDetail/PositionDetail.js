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
import './PositionDetail.scss';
import { getPositionById, updatePosition, deletePosition } from '@app/services/Position';
import { uploadImages } from '@app/services/File';
import axios from 'axios';
import { formatNumber } from '@src/utils';


const layoutCol = { xs: 24, md: 24 };
const labelCol = { xs: 24 };

function PositionDetail({ myInfo }) {
  let history = useHistory();
  let { id } = useParams();
  const { t } = useTranslation();

  const [formCreatePosition] = Form.useForm();
  const [imgsUpload, setImgsUpload] = useState([]);
  const [positionDetail, setPositionDetail] = useState(null);
  const isMyPosition = positionDetail?.userId?._id === myInfo._id;
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    getPositionDetail();
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);
  const isMobile = width <= 768;

  console.log(isMobile);

  async function getPositionDetail() {
    const apiResponse = await getPositionById(id);
    if (apiResponse) {
      formCreatePosition.setFieldsValue({
        positionName: apiResponse?.positionName,
        positionDescription: apiResponse?.positionDescription,
        positionDiscount: apiResponse?.positionDiscount,

      });
      setPositionDetail(apiResponse);
      setImgsUpload(convertUrlToImagesList(apiResponse?.positionImage));
    }
  }

  async function handleDelete() {
    const api = await deletePosition(id);
    if (api) {
      toast(CONSTANTS.SUCCESS, 'Xoá chức vụ thành công');
      history.replace(URL.POSITION);
    }
  }

  async function handleUpdatePosition(data) {
    let [originImageNm, imageUpload] = getfileDetail(imgsUpload);
    if (imageUpload.length) {
      let images = await uploadImages(imageUpload);
      if (images && images.length) {
        originImageNm = [...originImageNm, ...images];
      }
    }
    data.positionImage = originImageNm;
    const api = await updatePosition(id, convertCamelCaseToSnakeCase(data));
    if (api) {
      toast(CONSTANTS.SUCCESS, 'Cập nhật dữ liệu thành công!');
      await getPositionDetail();
    }
  }

  function handleImage(value) {
    setImgsUpload(value);
  }


  return (
    <>
      {isMobile ? (
        <Col>
          <CustomBreadcrumb breadcrumbLabel={'CHI TIẾT CHỨC VỤ'}> </CustomBreadcrumb>
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
            {(isMyPosition || myInfo.role === CONSTANTS.ADMIN) && (
              <Popconfirm
                title={"Xoá chức vụ"}
                onConfirm={handleDelete}
                okText={t('XOA')}
                cancelText={t('HUY')}
                okButtonProps={{ type: 'danger' }}
              >
                <Button danger icon={<DeleteOutlined style={{ fontSize: 15 }}/>}>
                  {"Xoá chức vụ"}
                </Button>
              </Popconfirm>
            )}
          </Row>
        </Col>) : (<CustomBreadcrumb breadcrumbLabel={'CHI TIẾT CHÚC VỤ'}>
        <Button
          className="mr-2"
          type="primary"
          ghost
          icon={<i className="fa fa-arrow-left mr-1"/>}
          onClick={() => history.goBack()}
        >
          {t('QUAY_LAI')}
        </Button>
        {(isMyPosition || myInfo.role === CONSTANTS.ADMIN) && (
          <Popconfirm
            title={"Xoá chức vụ"}
            onConfirm={handleDelete}
            okText={t('XOA')}
            cancelText={t('HUY')}
            okButtonProps={{ type: 'danger' }}
          >
            <Button danger icon={<DeleteOutlined style={{ fontSize: 15 }}/>}>
              {"Xoá chức vụ"}
            </Button>
          </Popconfirm>
        )}
      </CustomBreadcrumb>)
      }


      {positionDetail && (
        <div className="site-layout-background">
          <Form id="form-modal" form={formCreatePosition} onFinish={handleUpdatePosition}>
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
                label={"Chiết khấu chức vụ" + ' (%)'  }
                name="positionDiscount"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.NUMBER}
                rules={[RULES.REQUIRED]}
                form={formCreatePosition}
                defaultValue={0}
                min={0}
                max={100}
                // formatter={value => `${value}%`}
                // parser={value => value.replace('%', '')}
              />
              <CustomSkeleton
                label={t('MO_TA')}
                name="positionDescription"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT_AREA}
                autoSize={{ minRows: 2, maxRows: 3 }}
                form={formCreatePosition}
              />
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

export default connect(mapStateToProps, null)(PositionDetail);
