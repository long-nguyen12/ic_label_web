import { Button, Popconfirm, Row, Form, Col } from "antd";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { convertUrlToImagesList, getfileDetail } from "@components/Upload/imageUtil";
import CustomSkeleton from "@components/CustomSkeleton";
import CustomBreadcrumb from "@components/CustomBreadcrumb";
import UploadImg from "@components/Upload/UploadImg";
import { URL } from "@url";
import { toast, convertCamelCaseToSnakeCase } from "@app/common/functionCommons";
import { CONSTANTS, RULES } from "@constants";
import { useTranslation } from "react-i18next";
import { DeleteOutlined } from "@ant-design/icons";
import "./PositionDetail.scss";
import { getPositionById, updatePosition, deletePosition } from "@app/services/Position";
import { uploadImages } from "@app/services/File";
import axios from "axios";
import { formatNumber } from "@src/utils";

const layoutCol = { xs: 24, md: 24 };
const labelCol = { xs: 24 };

function PositionDetail({ myInfo }) {
  let history = useHistory();
  let { id } = useParams();
  const { t } = useTranslation();

  const [formCreatePosition] = Form.useForm();
  const [positionDetail, setPositionDetail] = useState(null);
  const isMyPosition = positionDetail?.userId?._id === myInfo._id;
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    getPositionDetail();
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);
  const isMobile = width <= 768;

  async function getPositionDetail() {
    const apiResponse = await getPositionById(id);
    if (apiResponse) {
      formCreatePosition.setFieldsValue({
        positionName: apiResponse?.tenvaitro,
        positionDescription: apiResponse?.mota,
      });
      setPositionDetail(apiResponse);
    }
  }

  async function handleDelete() {
    const api = await deletePosition(id);
    if (api) {
      toast(CONSTANTS.SUCCESS, "Xoá chức vụ thành công");
      history.replace(URL.POSITION);
    }
  }

  async function handleUpdatePosition(data) {
    let dataPost = {
      tenvaitro: data.positionName,
      mota: data.positionDescription,
    };
    const api = await updatePosition(id, convertCamelCaseToSnakeCase(dataPost));
    if (api) {
      toast(CONSTANTS.SUCCESS, "Cập nhật dữ liệu thành công!");
      await getPositionDetail();
    }
  }

  return (
    <>
      {isMobile ? (
        <Col>
          <CustomBreadcrumb breadcrumbLabel={"CHI TIẾT CHỨC VỤ"}> </CustomBreadcrumb>
          <Row>
            <Button
              className="mr-2"
              type="primary"
              ghost
              icon={<i className="fa fa-arrow-left mr-1" />}
              onClick={() => history.goBack()}
            >
              {t("QUAY_LAI")}
            </Button>
            {(isMyPosition || myInfo.role === CONSTANTS.ADMIN) && (
              <Popconfirm
                title={"Xoá chức vụ"}
                onConfirm={handleDelete}
                okText={t("XOA")}
                cancelText={t("HUY")}
                okButtonProps={{ type: "danger" }}
              >
                <Button danger icon={<DeleteOutlined style={{ fontSize: 15 }} />}>
                  {"Xoá chức vụ"}
                </Button>
              </Popconfirm>
            )}
          </Row>
        </Col>
      ) : (
        <CustomBreadcrumb breadcrumbLabel={"CHI TIẾT CHÚC VỤ"}>
          <Button
            className="mr-2"
            type="primary"
            ghost
            icon={<i className="fa fa-arrow-left mr-1" />}
            onClick={() => history.goBack()}
          >
            {t("QUAY_LAI")}
          </Button>
          {(isMyPosition || myInfo.role === CONSTANTS.ADMIN) && (
            <Popconfirm
              title={"Xoá chức vụ"}
              onConfirm={handleDelete}
              okText={t("XOA")}
              cancelText={t("HUY")}
              okButtonProps={{ type: "danger" }}
            >
              <Button danger icon={<DeleteOutlined style={{ fontSize: 15 }} />}>
                {"Xoá chức vụ"}
              </Button>
            </Popconfirm>
          )}
        </CustomBreadcrumb>
      )}

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
                label={t("MO_TA")}
                name="positionDescription"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT_AREA}
                autoSize={{ minRows: 2, maxRows: 3 }}
                form={formCreatePosition}
              />
            </Row>
            <Row gutter={24} className="m-2 pt-2" align="middle" justify="center">
              <Button size="default" type="primary" htmlType="submit">
                <i className="fa fa-save mr-1"></i>
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
