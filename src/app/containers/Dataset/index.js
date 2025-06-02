import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";
import { Button, message, Row, Table, Tag } from "antd";
import { CheckCircleOutlined, MobileOutlined, MailOutlined } from "@ant-design/icons";

import CustomBreadcrumb from "@components/CustomBreadcrumb";
import Loading from "@components/Loading";
import { createUser, getAllDataset } from "@app/services/Dataset";
import Filter from "@components/Filter";

import {
  convertQueryToObject,
  formatDateTime,
  handleReplaceUrlSearch,
  paginationConfig,
} from "@app/common/functionCommons";
import CreateDataset from "@containers/Dataset/CreateDataset";
import { useTranslation } from "react-i18next";
import { CONSTANTS } from "@constants";

function Dataset({ myInfo }) {
  let history = useHistory();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState({
    dataRes: [],
    currentPage: 1,
    pageSize: 10,
    totalDocs: 0,
    query: {},
  });

  const [stateCreateDataset, setStateCreateDataset] = useState({
    isShowModal: false,
    createUserSelected: null,
  });

  let dataSearch = [
    { name: "search", label: t("Tên dataset"), type: CONSTANTS.TEXT },
  ];

  useEffect(() => {
    (async () => {
      const { page, limit, ...queryObj } = convertQueryToObject(history.location.search);
      await getDataset(page, limit, queryObj);
    })();
  }, []);

  function handleShowModalCreateDataset(isShowModal, createUserSelected = null) {
    if (isShowModal) {
      setStateCreateDataset({ isShowModal, createUserSelected });
    } else {
      setStateCreateDataset({ ...stateCreateDataset, createUserSelected });
    }
  }

  async function getDataset(page = users.currentPage, limit = users.pageSize, query = users.query) {
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    handleReplaceUrlSearch(history, page, limit, query);
    setLoading(true);
    const apiResponse = await getAllDataset(page, limit, query);
    if (apiResponse) {
      setUsers({
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
    await getDataset(1, users.pageSize, query);
  }

  async function handleCreateDataset(dataForm) {
    setLoading(true);
    let data = {
      user_id: myInfo._id,
      user_full_name: dataForm.user_full_name,
      user_mobi: dataForm.user_mobi,
      user_email: dataForm.user_email,
      user_add: dataForm.user_add,
      user_note: dataForm.user_note,
      position_id: dataForm.position_id,
    };

    const apiResponse = await createUser(data);
    if (apiResponse) {
      setStateCreateDataset({ isShowModal: false, createUserSelected: null });
      message.success("Đã tạo người dùng mới thành công!");
      await getDataset();
    }
    setLoading(false);
  }

  const columnsUser = [
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
      title: <div style={{ textTransform: "capitalize" }}>{t("THAO_TAC")}</div>,
      key: "action",
      align: "center",
      width: "40%",
      fixed: "right",
      render: (record) => {
        return (
          <NavLink
            to={{
              pathname: "/user/" + record._id,
              aboutProps: {
                id: record._id,
                name: record.datasetName,
              },
            }}
          >
            <Button type="primary" ghost>
              {t("XEM")}
            </Button>
          </NavLink>
        );
      },
    },
  ];

  async function handleShowModalCreateDataset() {
    setStateCreateDataset({ isShowModal: true, createUserSelected: null });
  }

  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={"DATASET"}>
      <Row>
                <Button type="primary" icon={<i className="fa fa-plus mr-1" />} onClick={handleShowModalCreateDataset}>
                  {t("TAO_MOI")}
                </Button>
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
          columns={columnsUser}
          dataSource={users.dataRes}
          pagination={paginationConfig(handleChangePagination, users)}
          scroll={{ x: 1200 }}
        />
      </Loading>

      <CreateDataset
        isModalVisible={stateCreateDataset.isShowModal}
        handleOk={handleCreateDataset}
        handleCancel={() => setStateCreateDataset({ isShowModal: false, createUserSelected: null })}
        createUserSelected={stateCreateDataset.createUserSelected}
      />
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps)(Dataset);
