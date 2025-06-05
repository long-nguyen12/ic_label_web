import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";
import { Button, message, Row, Table, Tag } from "antd";
import { CheckCircleOutlined, MobileOutlined, MailOutlined } from "@ant-design/icons";

import CustomBreadcrumb from "@components/CustomBreadcrumb";
import Loading from "@components/Loading";

import {
  convertQueryToObject,
  formatDateTime,
  handleReplaceUrlSearch,
  paginationConfig,
} from "@app/common/functionCommons";
import { useTranslation } from "react-i18next";
import { CONSTANTS } from "@constants";
import { getAllHistory } from "../../services/History";

function History({ myInfo }) {
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

  useEffect(() => {
    (async () => {
      const { page, limit, ...queryObj } = convertQueryToObject(history.location.search);
      await getUser(page, limit, queryObj);
    })();
  }, []);

  async function getUser(page = users.currentPage, limit = users.pageSize, query = users.query) {
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    handleReplaceUrlSearch(history, page, limit, query);
    setLoading(true);
    const apiResponse = await getAllHistory(page, limit, query);
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
    await getUser(current, pageSize);
  }

  const columnsUser = [
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Thời gian"}</div>,
      dataIndex: "createdAt",
      width: "15%",
      align: "center",
      render: (value, record) => {
        return (
          <>
            <div align="center">{formatDateTime(value)}</div>
          </>
        );
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Người sử dụng"}</div>,
      dataIndex: "userId",
      width: "15%",
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
      title: <div style={{ textTransform: "capitalize" }}>{"Hành động"}</div>,
      dataIndex: "tieude",
      width: "70%",
      align: "center",
      render: (value, record) => {
        return (
          <>
            <div align="center">{value}</div>
          </>
        );
      },
    },
  ];

  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={"LỊCH SỬ HOẠT ĐỘNG"}>
      </CustomBreadcrumb>
      <Loading active={loading} layoutBackground>
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
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps)(History);
