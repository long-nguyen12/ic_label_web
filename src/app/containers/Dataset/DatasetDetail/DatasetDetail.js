import { Button, Popconfirm, Row, Form, Col, List, Image, Pagination } from "antd";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory, useParams, NavLink } from "react-router-dom";
import { convertUrlToImagesList, getfileDetail } from "@components/Upload/imageUtil";
import CustomSkeleton from "@components/CustomSkeleton";
import CustomBreadcrumb from "@components/CustomBreadcrumb";
import UploadImg from "@components/Upload/UploadImg";
import { URL } from "@url";
import { toast, convertCamelCaseToSnakeCase } from "@app/common/functionCommons";
import { CONSTANTS, RULES } from "@constants";
import { useTranslation } from "react-i18next";
import { CheckCircleTwoTone } from "@ant-design/icons";
import "./DatasetDetail.scss";
import { getDatasetById, updateDataset, deleteDataset } from "@app/services/Dataset";
import { uploadImages } from "@app/services/File";
import axios from "axios";
import { formatNumber } from "@src/utils";
import { downloadAnnotationById, getAllImageNoQuery, getAllImages } from "../../../services/Dataset";
import { BASE_URL } from "../../../../constants/BASE_URL";

import {
  convertQueryToObject,
  formatDateTime,
  handleReplaceUrlSearch,
  paginationConfig,
} from "@app/common/functionCommons";

const layoutCol = { xs: 24, md: 24 };
const labelCol = { xs: 24 };

function DatasetDetail({ myInfo }) {
  let history = useHistory();
  let { id } = useParams();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [datasets, setDatasets] = useState({
    dataRes: [],
    currentPage: 1,
    pageSize: 24,
    totalDocs: 0,
    query: { datasetId: id },
  });
  const [datasetNoPage, setDatasetNoPage] = useState({
    dataRes: [],
    currentPage: 1,
    pageSize: 24,
    totalDocs: 0,
    query: { datasetId: id },
  });

  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    (async () => {
      const { page, limit, ...queryObj } = convertQueryToObject(history.location.search);
      await getDataset(page, limit, queryObj);
      await getGallery();
    })();
  }, []);
  const isMobile = width <= 768;

  async function getGallery(page = datasets.currentPage, limit = datasets.pageSize, query = datasets.query) {
    page = page ? parseInt(page) : 1;
    setLoading(true);
    query = convertCamelCaseToSnakeCase(query);
    query.dataset_id = id;
    const apiResponse = await getAllImages(page, 0, query);
    if (apiResponse) {
      console.log("image list", apiResponse);

      setDatasetNoPage({
        dataRes: apiResponse.docs,
        currentPage: page,
        pageSize: limit,
        totalDocs: apiResponse.totalDocs,
        query: query,
      });
    }
    setLoading(false);
  }

  async function getDataset(page = datasets.currentPage, limit = datasets.pageSize, query = datasets.query) {
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 24;
    handleReplaceUrlSearch(history, page, limit, query);
    setLoading(true);
    query = convertCamelCaseToSnakeCase(query);
    query.dataset_id = id;
    const apiResponse = await getAllImages(page, limit, query);
    if (apiResponse) {
      console.log("paginate image list", apiResponse);
      setDatasets({
        dataRes: apiResponse.docs,
        currentPage: page,
        pageSize: limit,
        totalDocs: apiResponse.totalDocs,
        query: query,
      });
    }
    setLoading(false);
  }

  async function handleChangePagination(current, pageSize) {
    await getDataset(current, pageSize);
  }

  async function handleDownload() {
    const apiRes = await downloadAnnotationById(id);
    if (apiRes) {
      toast.success("Tải về nhãn thành công");
    } else {
      toast.error("Tải về nhãn thất bại");
    }
  }

  return (
    <>
      {isMobile ? (
        <Col>
          <CustomBreadcrumb breadcrumbLabel={"GÁN NHÃN DỮ LIỆU"}> </CustomBreadcrumb>
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
            <Button
              className="mr-2"
              type="primary"
              ghost
              icon={<i className="fa fa-download mr-1" />}
              onClick={handleDownload}
            >
              Tải về nhãn
            </Button>
          </Row>
          <List
            grid={{ gutter: 16, xs: 2, sm: 3, md: 4, lg: 4, xl: 6, xxl: 6 }}
            dataSource={datasets.dataRes}
            loading={loading}
            renderItem={(item, index) => {
              const datasetPath = item.datasetId?.datasetPath?.replace(/\\/g, "/");
              const imgUrl = `${BASE_URL}/${datasetPath}/${item.imageName}?t=${Date.now()}`;
              const isEnoughCaptions = Array.isArray(item.imageCaption) && item.imageCaption.length === 5;
              const currentIndex = datasets.pageSize * (datasets.currentPage - 1) + index;
              return (
                <List.Item key={item._id}>
                  <NavLink
                    to={{
                      pathname: "/gallery/" + item._id + "?index=" + currentIndex,
                      state: {
                        id: item._id,
                        id_folder: item.datasetId?._id,
                        image_list: datasetNoPage?.dataRes,
                      },
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      {isEnoughCaptions && (
                        <CheckCircleTwoTone
                          twoToneColor="#52c41a"
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            fontSize: 28,
                            zIndex: 2,
                          }}
                        />
                      )}
                      <Image
                        width="100%"
                        src={imgUrl}
                        alt="dataset-img"
                        style={{ objectFit: "cover", borderRadius: 8 }}
                        preview={false}
                      />
                    </div>
                  </NavLink>
                </List.Item>
              );
            }}
          />
          <Pagination
            current={datasets.currentPage}
            pageSize={datasets.pageSize}
            total={datasets.totalDocs}
            onChange={handleChangePagination}
            style={{ marginTop: 16, textAlign: "center" }}
          />
        </Col>
      ) : (
        <>
          <CustomBreadcrumb breadcrumbLabel={"GÁN NHÃN DỮ LIỆU"}>
            <Button
              className="mr-2"
              type="primary"
              ghost
              icon={<i className="fa fa-arrow-left mr-1" />}
              onClick={() => history.goBack()}
            >
              {t("QUAY_LAI")}
            </Button>
            <Button
              className="mr-2"
              type="primary"
              ghost
              icon={<i className="fa fa-download mr-1" />}
              onClick={handleDownload}
            >
              Tải về nhãn
            </Button>
          </CustomBreadcrumb>
          <div className="site-layout-background">
            <List
              grid={{ gutter: 16, xs: 2, sm: 3, md: 4, lg: 4, xl: 6, xxl: 6 }}
              dataSource={datasets.dataRes}
              loading={loading}
              renderItem={(item, index) => {
                const datasetPath = item.datasetId?.datasetPath?.replace(/\\/g, "/");
                const imgUrl = `${BASE_URL}/${datasetPath}/${item.imageName}?t=${Date.now()}`;
                const isEnoughCaptions = item.haveCaption;
                const currentIndex = datasets.pageSize * (datasets.currentPage - 1) + index;
                return (
                  <List.Item key={item._id}>
                    <NavLink
                      to={{
                        pathname: "/gallery/" + item._id + "?index=" + currentIndex,
                        state: {
                          id: item._id,
                          id_folder: item.datasetId?._id,
                          image_list: datasetNoPage?.dataRes,
                        },
                      }}
                      onClick={() => {
                        // Your custom logic here
                        console.log("Clicked image:", item._id);
                        // You can also call a function or dispatch an action here
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        {isEnoughCaptions && (
                          <CheckCircleTwoTone
                            twoToneColor="#52c41a"
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              fontSize: 28,
                              zIndex: 2,
                            }}
                          />
                        )}
                        <Image
                          width="100%"
                          src={imgUrl}
                          alt="dataset-img"
                          style={{ objectFit: "cover", borderRadius: 8 }}
                          preview={false}
                        />
                      </div>
                    </NavLink>
                  </List.Item>
                );
              }}
            />
            <Pagination
              current={datasets.currentPage}
              pageSize={datasets.pageSize}
              total={datasets.totalDocs}
              onChange={handleChangePagination}
              style={{ marginTop: 16, textAlign: "center" }}
            />
          </div>
        </>
      )}
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps, null)(DatasetDetail);
