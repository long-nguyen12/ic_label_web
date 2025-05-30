import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";
import { Button, message, Row, Table, Tag, Popconfirm } from "antd";
import { CheckCircleOutlined, MobileOutlined, MailOutlined } from "@ant-design/icons";

import CustomBreadcrumb from "@components/CustomBreadcrumb";
import Loading from "@components/Loading";
import { createUser } from "@app/services/User";
import Filter from "@components/Filter";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";

import {
  convertQueryToObject,
  formatDateTime,
  handleReplaceUrlSearch,
  paginationConfig,
} from "@app/common/functionCommons";
import CreateUser from "@containers/User/CreateUser";
import { useTranslation } from "react-i18next";
import { CONSTANTS } from "@constants";
import { deleteUserById, getAllUser } from "../../services/User";

function User({ myInfo }) {
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

  const [stateCreateUser, setStateCreateUser] = useState({
    isShowModal: false,
    createUserSelected: null,
  });

  let dataSearch = [
    { name: "user_name", label: t("Tên người dùng"), type: CONSTANTS.TEXT },
    { name: "user_email", label: t("Email"), type: CONSTANTS.TEXT },
  ];

  useEffect(() => {
    (async () => {
      const { page, limit, ...queryObj } = convertQueryToObject(history.location.search);
      await getUser(page, limit, queryObj);
    })();
  }, []);

  function handleShowModalCreateUser(isShowModal, createUserSelected = null) {
    if (isShowModal) {
      setStateCreateUser({ isShowModal, createUserSelected });
    } else {
      setStateCreateUser({ ...stateCreateUser, createUserSelected });
    }
  }

  async function getUser(page = users.currentPage, limit = users.pageSize, query = users.query) {
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    handleReplaceUrlSearch(history, page, limit, query);
    setLoading(true);
    const apiResponse = await getAllUser(page, limit, query);
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

  async function handleFilter(query) {
    await getUser(1, users.pageSize, query);
  }

  async function handleCreateUser(dataForm) {
    setLoading(true);
    let data = {
      user_name: dataForm.user_name,
      user_full_name: dataForm.user_full_name,
      user_mobi: dataForm.user_mobi,
      user_email: dataForm.user_email,
      user_add: dataForm.user_add,
      role: dataForm.role,
      user_classify: dataForm.user_classify,
      user_pass: dataForm.user_password,
    };

    const apiResponse = await createUser(data);
    if (apiResponse) {
      setStateCreateUser({ isShowModal: false, createUserSelected: null });
      message.success("Đã tạo người dùng mới thành công!");
      await getUser();
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    setLoading(true);
    const apiResponse = await deleteUserById(id);
    if (apiResponse) {
      message.success("Xoá người dùng thành công!");
      await getUser(users.currentPage, users.pageSize, users.query);
    } else {
      message.error(apiResponse.message || "Xoá người dùng thất bại!");
    }
    setLoading(false);
  }

  const columnsUser = [
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Tên người dùng"}</div>,
      dataIndex: "userFullName",
      width: "15%",
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
      title: <div style={{ textTransform: "capitalize" }}>{"Username"}</div>,
      dataIndex: "userName",
      width: "15%",
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
      title: <div style={{ textTransform: "capitalize" }}>{"Email"}</div>,
      dataIndex: "userEmail",
      width: "15%",
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
      title: <div style={{ textTransform: "capitalize" }}>{t("Quyền")}</div>,
      width: "10%",
      dataIndex: "role",
      align: "center",
      render: (value) => {
        return (
          <Tag color="magenta">
            <div align="center">{value}</div>
          </Tag>
        );
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Trạng thái"}</div>,
      dataIndex: "active",
      width: "10%",
      align: "center",
      render: (value, record) => {
        if (value) {
          return (
            <Tag color="green">
              <Row align="middle" justify="center">
                <CheckCircleOutlined style={{ fontSize: 15 }} className="mr-1" align="center" />
                <div align="center">{t("Kích hoạt")}</div>
              </Row>
            </Tag>
          );
        } else {
          return (
            <Tag color="red">
              <Row align="middle" justify="center">
                <i className="fa fa-ban mr-1" style={{ fontSize: 15 }} align="center" />
                <div align="center">{t("Không kích hoạt")}</div>
              </Row>
            </Tag>
          );
        }
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{t("THAO_TAC")}</div>,
      key: "action",
      align: "center",
      width: "20%",
      fixed: "right",
      render: (record) => {
        return (
          <Row align="center">
            <NavLink
              to={{
                pathname: "/user/" + record._id,
                aboutProps: {
                  id: record._id,
                  name: record.userName,
                },
              }}
            >
              <Button type="primary" ghost icon={<EyeOutlined style={{ fontSize: 15 }} />} className="mr-1">
                {t("XEM")}
              </Button>
            </NavLink>
            <Popconfirm
              title={t("Xoá người dùng này?")}
              onConfirm={() => handleDelete(record._id)}
              okText={t("XOA")}
              cancelText={t("HUY")}
              okButtonProps={{ type: "danger" }}
            >
              <Button type="primary" danger icon={<DeleteOutlined style={{ fontSize: 15 }} />}>
                {t("Xoá")}
              </Button>
            </Popconfirm>
          </Row>
        );
      },
    },
  ];

  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={"NGƯỜI DÙNG"}>
        <Row>
          <Button type="primary" icon={<i className="fa fa-plus mr-1" />} onClick={handleShowModalCreateUser}>
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

      <CreateUser
        isModalVisible={stateCreateUser.isShowModal}
        handleOk={handleCreateUser}
        handleCancel={() => setStateCreateUser({ isShowModal: false, createUserSelected: null })}
        createUserSelected={stateCreateUser.createUserSelected}
      />
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps)(User);

