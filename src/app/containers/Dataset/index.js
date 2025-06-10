import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";
import { Button, message, Row, Table, Popconfirm } from "antd";
import { EyeOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

import CustomBreadcrumb from "@components/CustomBreadcrumb";
import Loading from "@components/Loading";
import { createDataset, getAllDataset, deleteDatasetById } from "@app/services/Dataset";
import Filter from "@components/Filter";

import {
  convertQueryToObject,
  formatDateTime,
  handleReplaceUrlSearch,
  paginationConfig,
} from "@app/common/functionCommons";
import CreateDataset from "@containers/Dataset/CreateDataset";
import { useTranslation } from "react-i18next";
import { CONSTANTS, USER_TYPE } from "@constants";

const permitted_roles = [USER_TYPE.ADMIN.code, USER_TYPE.UPLOAD.code];

function Dataset({ myInfo }) {
  let history = useHistory();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [datasets, setDatasets] = useState({
    dataRes: [],
    currentPage: 1,
    pageSize: 10,
    totalDocs: 0,
    query: {},
  });

  const [stateCreateDataset, setStateCreateDataset] = useState({
    isShowModal: false,
    createDatasetSelected: null,
  });

  let dataSearch = [{ name: "dataset_name", label: t("Tên dataset"), type: CONSTANTS.TEXT }];

  useEffect(() => {
    (async () => {
      const { page, limit, ...queryObj } = convertQueryToObject(history.location.search);
      await getDataset(page, limit, queryObj);
    })();
  }, []);

  function handleShowModalCreateDataset(isShowModal, createDatasetSelected = null) {
    if (isShowModal) {
      setStateCreateDataset({ isShowModal, createDatasetSelected });
    } else {
      setStateCreateDataset({ ...stateCreateDataset, createDatasetSelected });
    }
  }

  async function getDataset(page = datasets.currentPage, limit = datasets.pageSize, query = datasets.query) {
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    handleReplaceUrlSearch(history, page, limit, query);
    setLoading(true);
    const apiResponse = await getAllDataset(page, limit, query);
    if (apiResponse) {
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

  async function handleFilter(query) {
    await getDataset(1, datasets.pageSize, query);
  }

  async function handleCreateDataset(dataForm) {
    setLoading(true);
    let data = {
      dataset_name: dataForm.dataset_name,
      dataset_note: dataForm.dataset_note,
      dataset_path: dataForm.dataset_path,
      annotator_id: dataForm.annotator_id
    };

    const apiResponse = await createDataset(data);
    if (apiResponse) {
      setStateCreateDataset({ isShowModal: false, createDatasetSelected: null });
      message.success("Đã tạo dataset mới thành công!");
      await getDataset();
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    setLoading(true);
    const apiResponse = await deleteDatasetById(id);
    if (apiResponse) {
      message.success("Đã xoá dataset thành công!");
    }
    setLoading(false);
    await getDataset(datasets.currentPage, datasets.pageSize, datasets.query);
  }

  const columnsDataset = [
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Tên dataset"}</div>,
      dataIndex: "datasetName",
      width: "30%",
      align: "center",
      render: (value, record) => {
        return (
          <>
            <div align="center">{value}</div>
          </>
        );
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Mô tả"}</div>,
      dataIndex: "datasetNote",
      width: "30%",
      align: "center",
      render: (value, record) => {
        return (
          <>
            <div align="center">{value}</div>
          </>
        );
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Người gán nhãn"}</div>,
      dataIndex: "annotatorId",
      width: "30%",
      align: "center",
      render: (value, record) => {
        return (
          <>
            <div align="center">{value?.userFullName}</div>
          </>
        );
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{t("THAO_TAC")}</div>,
      key: "action",
      align: "center",
      width: "40%",
      fixed: "right",
      render: (record) => {
        return (
          <Row align="center">
            <NavLink
              to={{
                pathname: "/dataset-management/" + record._id,
                aboutProps: {
                  id: record._id,
                },
              }}
            >
              <Button type="primary" ghost icon={<EyeOutlined style={{ fontSize: 15 }} />} className="mr-1">
                {t("XEM")}
              </Button>
            </NavLink>
            {myInfo.role === USER_TYPE.ADMIN.code && (
              <>
                <NavLink
                  to={{
                    pathname: "/dataset/" + record._id,
                    aboutProps: {
                      id: record._id,
                    },
                  }}
                >
                  <Button type="primary" ghost icon={<EditOutlined style={{ fontSize: 15 }} />} className="mr-1">
                    {t("Sửa")}
                  </Button>
                </NavLink>
                <Popconfirm
                  title={t("Xoá dataset này?")}
                  onConfirm={() => handleDelete(record._id)}
                  okText={t("XOA")}
                  cancelText={t("HUY")}
                  okButtonProps={{ type: "danger" }}
                >
                  <Button type="primary" danger icon={<DeleteOutlined style={{ fontSize: 15 }} />}>
                    {t("Xoá")}
                  </Button>
                </Popconfirm>
              </>
            )}
          </Row>
        );
      },
    },
  ];

  async function handleShowModalCreateDataset() {
    setStateCreateDataset({ isShowModal: true, createDatasetSelected: null });
  }

  function uploadPermission(role) {
    if (!permitted_roles.includes(role)) return false;
    return true;
  }

  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={"DATASET"}>
        <Row>
          {uploadPermission(myInfo.role) && (
            <Button type="primary" icon={<i className="fa fa-plus mr-1" />} onClick={handleShowModalCreateDataset}>
              {t("TAO_MOI")}
            </Button>
          )}
        </Row>
      </CustomBreadcrumb>
      <Loading active={loading} layoutBackground>
        <Filter
          dataSearch={dataSearch}
          handleFilter={(query) => handleFilter(query)}
          layoutCol={{ xs: 24, sm: 24, md: 24, lg: 12, xl: 12, xxl: 12 }}
          labelCol={{ xs: 12, sm: 12, md: 12, lg: 66, xl: 6, xxl: 5 }}
        />
        <Table
          bordered
          rowKey="_id"
          size="small"
          columns={columnsDataset}
          dataSource={datasets.dataRes}
          pagination={paginationConfig(handleChangePagination, datasets)}
          scroll={{ x: 1200 }}
        />
      </Loading>

      <CreateDataset
        isModalVisible={stateCreateDataset.isShowModal}
        handleOk={handleCreateDataset}
        handleCancel={() => setStateCreateDataset({ isShowModal: false, createDatasetSelected: null })}
        createDatasetSelected={stateCreateDataset.createDatasetSelected}
      />
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps)(Dataset);
