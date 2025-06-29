import { Button, Popconfirm, Row, Form, Col } from "antd";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import CustomSkeleton from "@components/CustomSkeleton";
import CustomBreadcrumb from "@components/CustomBreadcrumb";
import { URL } from "@url";
import { toast, convertCamelCaseToSnakeCase } from "@app/common/functionCommons";
import { CONSTANTS, RULES } from "@constants";
import { useTranslation } from "react-i18next";
import { DeleteOutlined } from "@ant-design/icons";
import "./LabelDetail.scss";
import { getLabelById, updateLabel, deleteLabel } from "@app/services/Label";
import { SketchPicker } from "react-color";

const layoutCol = { xs: 24, md: 24 };
const labelCol = { xs: 24 };

function LabelDetail({ myInfo }) {
  let history = useHistory();
  let { id } = useParams();
  const { t } = useTranslation();
  const isMyPosition = myInfo.role === CONSTANTS.ADMIN;
  const [background, setBackground] = useState("#fff");

  const [formCreateLabel] = Form.useForm();
  const [positionDetail, setLabelDetail] = useState(null);
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    getLabelDetail();
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);
  const isMobile = width <= 768;

  async function getLabelDetail() {
    const apiResponse = await getLabelById(id);
    if (apiResponse) {
      setBackground(apiResponse?.labelColor || "#fff");
      formCreateLabel.setFieldsValue({
        labelName: apiResponse?.labelName,
        labelVietnamese: apiResponse?.labelVietnamese,
        labelColor: apiResponse?.labelColor,
      });
      setLabelDetail(apiResponse);
    }
  }

  async function handleDelete() {
    const api = await deleteLabel(id);
    if (api) {
      toast(CONSTANTS.SUCCESS, "Xoá nhãn thành công");
      history.replace(URL.POSITION);
    }
  }

  async function handleUpdateLabel(data) {
    const api = await updateLabel(id, convertCamelCaseToSnakeCase(data));
    if (api) {
      toast(CONSTANTS.SUCCESS, "Cập nhật dữ liệu thành công!");
      await getLabelDetail();
    }
  }

  function handleChangeColor(color) {
    setBackground(color.hex);
    formCreateLabel.setFieldsValue({ labelColor: color.hex });
  }

  function isHexColor(str) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(str);
  }

  return (
    <>
      {isMobile ? (
        <Col>
          <CustomBreadcrumb breadcrumbLabel={"CHI TIẾT NHÃN"}> </CustomBreadcrumb>
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
                title={"Xoá nhãn"}
                onConfirm={handleDelete}
                okText={t("XOA")}
                cancelText={t("HUY")}
                okButtonProps={{ type: "danger" }}
              >
                <Button danger icon={<DeleteOutlined style={{ fontSize: 15 }} />}>
                  {"Xoá nhãn"}
                </Button>
              </Popconfirm>
            )}
          </Row>
        </Col>
      ) : (
        <CustomBreadcrumb breadcrumbLabel={"CHI TIẾT NHÃN"}>
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
              title={"Xoá nhãn"}
              onConfirm={handleDelete}
              okText={t("XOA")}
              cancelText={t("HUY")}
              okButtonProps={{ type: "danger" }}
            >
              <Button danger icon={<DeleteOutlined style={{ fontSize: 15 }} />}>
                {"Xoá nhãn"}
              </Button>
            </Popconfirm>
          )}
        </CustomBreadcrumb>
      )}

      {positionDetail && (
        <div className="site-layout-background">
          <Form id="form-modal" form={formCreateLabel} onFinish={handleUpdateLabel}>
            <Row gutter={15}>
              <CustomSkeleton
                label={"Nhãn"}
                name="labelName"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                rules={[RULES.REQUIRED]}
                form={formCreateLabel}
              />
              <CustomSkeleton
                label={"Nhãn tiếng Việt"}
                name="labelVietnamese"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                rules={[RULES.REQUIRED]}
                form={formCreateLabel}
              />
              <CustomSkeleton
                label={"Màu sắc"}
                name="labelColor"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                form={formCreateLabel}
              />
            </Row>
            <Row justify="center" align="middle" className="mb-2">
              <SketchPicker color={background} onChangeComplete={handleChangeColor} />
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

export default connect(mapStateToProps, null)(LabelDetail);
