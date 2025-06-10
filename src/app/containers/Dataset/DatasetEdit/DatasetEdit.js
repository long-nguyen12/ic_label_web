import { Button, Popconfirm, Row, Form, Col } from "antd";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { convertUrlToImagesList, getfileDetail } from "@components/Upload/imageUtil";
import CustomSkeleton from "@components/CustomSkeleton";
import CustomBreadcrumb from "@components/CustomBreadcrumb";
import Loading from "@components/Loading";
import { URL } from "@url";
import { toast, convertCamelCaseToSnakeCase } from "@app/common/functionCommons";
import { CONSTANTS, RULES } from "@constants";
import { useTranslation } from "react-i18next";
import { DeleteOutlined } from "@ant-design/icons";
import "./DatasetEdit.scss";
import { getDatasetById, updateDatasetById, deleteDataset } from "@app/services/Dataset";
import { uploadImages } from "@app/services/File";
import axios from "axios";
import { formatNumber } from "@src/utils";
import { get } from "jquery";
import { getAllUserNoQuery } from "../../../services/User";

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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    getDatasetDetail();
    getData();
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);
  const isMobile = width <= 768;

  async function getData() {
    try {
      setLoading(true);
      const data = await getAllUserNoQuery();
      if (data) {
        setUsers(data.docs);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching labels:", error);
    }
  }

  async function getDatasetDetail() {
    setLoading(true);
    const apiResponse = await getDatasetById(id);
    if (apiResponse) {
      formCreateDataset.setFieldsValue({
        datasetName: apiResponse?.datasetName,
        datasetNote: apiResponse?.datasetNote,
        annotatorId: apiResponse?.annotatorId?._id || null,
      });
      setDatasetDetail(apiResponse);
    }
    setLoading(false);
  }

  async function handleUpdateDataset(data) {
    setLoading(true);
    const api = await updateDatasetById(id, convertCamelCaseToSnakeCase(data));
    if (api) {
      toast(CONSTANTS.SUCCESS, "Cập nhật dữ liệu thành công!");
      await getDatasetDetail();
    }
    setLoading(false);
  }

  function convertDataSelect(list) {
    let arrConvert = [];
    list.map((data) => {
      let objConvert = {};
      objConvert.label = data.userFullName || data.userName;
      objConvert.value = data._id;
      arrConvert.push(objConvert);
    });
    return arrConvert;
  }

  return (
    <>
      {isMobile ? (
        <Col>
          <CustomBreadcrumb breadcrumbLabel={"CHI TIẾT DATASET"}> </CustomBreadcrumb>
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
          </Row>
        </Col>
      ) : (
        <CustomBreadcrumb breadcrumbLabel={"CHI TIẾT DATASET"}>
          <Button
            className="mr-2"
            type="primary"
            ghost
            icon={<i className="fa fa-arrow-left mr-1" />}
            onClick={() => history.goBack()}
          >
            {t("QUAY_LAI")}
          </Button>
        </CustomBreadcrumb>
      )}
      <Loading active={loading} layoutBackground>

      {datasetDetail && (
          <Form id="form-modal" form={formCreateDataset} onFinish={handleUpdateDataset}>
            <Row gutter={15}>
              <CustomSkeleton
                label={"Tên dataset"}
                name="datasetName"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                rules={[RULES.REQUIRED]}
                form={formCreateDataset}
              />
              <CustomSkeleton
                label={t("MO_TA")}
                name="datasetNote"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT_AREA}
                rules={[RULES.REQUIRED]}
                autoSize={{ minRows: 2, maxRows: 3 }}
                form={formCreateDataset}
              />
              {users && (
                <CustomSkeleton
                  label={"Chọn người gán nhãn bộ dữ liệu"}
                  name="annotatorId"
                  layoutCol={layoutCol}
                  labelCol={labelCol}
                  options={convertDataSelect(users)}
                  type={CONSTANTS.SELECT}
                  rules={[RULES.REQUIRED]}
                  form={formCreateDataset}
                />
              )}
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
      )}
        </Loading>
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps, null)(DatasetLabel);
