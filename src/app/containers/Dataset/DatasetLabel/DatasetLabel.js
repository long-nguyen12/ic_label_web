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
import "./DatasetLabel.scss";
import { getDatasetById, updateDataset, deleteDataset } from "@app/services/Dataset";
import { uploadImages } from "@app/services/File";
import axios from "axios";
import { formatNumber } from "@src/utils";

const layoutCol = { xs: 24, md: 24 };
const labelCol = { xs: 24 };

function DatasetLabel({ myInfo }) {
  let history = useHistory();
  let { id } = useParams();
  const { t } = useTranslation();

  const [formCreateDataset] = Form.useForm();
  const [datasetDetail, setDatasetDetail] = useState(null);
  const isMyDataset = datasetDetail?.userId?._id === myInfo._id;
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    getDatasetDetail();
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);
  const isMobile = width <= 768;

  async function getDatasetDetail() {
    const apiResponse = await getDatasetById(id);
    if (apiResponse) {
      formCreateDataset.setFieldsValue({
        datasetName: apiResponse?.tenvaitro,
        datasetDescription: apiResponse?.mota,
      });
      setDatasetDetail(apiResponse);
    }
  }

  async function handleDelete() {
    const api = await deleteDataset(id);
    if (api) {
      toast(CONSTANTS.SUCCESS, "Xoá chức vụ thành công");
      history.replace(URL.POSITION);
    }
  }

  async function handleUpdateDataset(data) {
    let dataPost = {
      tenvaitro: data.datasetName,
      mota: data.datasetDescription,
    };
    const api = await updateDataset(id, convertCamelCaseToSnakeCase(dataPost));
    if (api) {
      toast(CONSTANTS.SUCCESS, "Cập nhật dữ liệu thành công!");
      await getDatasetDetail();
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
            {(isMyDataset || myInfo.role === CONSTANTS.ADMIN) && (
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
          {(isMyDataset || myInfo.role === CONSTANTS.ADMIN) && (
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

      {datasetDetail && (
        <div className="site-layout-background">
          <Form id="form-modal" form={formCreateDataset} onFinish={handleUpdateDataset}>
            <Row gutter={15}>
              <CustomSkeleton
                label={"Tên chức vụ"}
                name="datasetName"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                rules={[RULES.REQUIRED]}
                form={formCreateDataset}
              />
              <CustomSkeleton
                label={t("MO_TA")}
                name="datasetDescription"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT_AREA}
                autoSize={{ minRows: 2, maxRows: 3 }}
                form={formCreateDataset}
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

export default connect(mapStateToProps, null)(DatasetLabel);

