import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";
import { Button, message, Row, Table, Tag } from "antd";
import { CheckCircleOutlined, MobileOutlined, MailOutlined } from "@ant-design/icons";

import CustomBreadcrumb from "@components/CustomBreadcrumb";
import Loading from "@components/Loading";
import { createCustomer, getAllCustomer } from "@app/services/Customer";
import Filter from "@components/Filter";

import {
  convertQueryToObject,
  formatDateTime,
  handleReplaceUrlSearch,
  paginationConfig,
} from "@app/common/functionCommons";
import CreateCustomer from "@containers/Customer/CreateCustomer";
import { useTranslation } from "react-i18next";
import { CONSTANTS } from "@constants";

function Customer({ myInfo }) {
  let history = useHistory();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState({
    dataRes: [],
    currentPage: 1,
    pageSize: 10,
    totalDocs: 0,
    query: {},
  });

  const [stateCreateCustomer, setStateCreateCustomer] = useState({
    isShowModal: false,
    createCustomerSelected: null,
  });

  let dataSearch = [
    { name: "search", label: t("Tên khách hàng"), type: CONSTANTS.TEXT },
    { name: "customer_mobi", label: t("Điện thoại"), type: CONSTANTS.TEXT }
  ];

  useEffect(() => {
    (async () => {
      const { page, limit, ...queryObj } = convertQueryToObject(history.location.search);
      await getCustomer(page, limit, queryObj);
    })();
  }, []);

  function handleShowModalCreateCustomer(isShowModal, createCustomerSelected = null) {
    if (isShowModal) {
      setStateCreateCustomer({ isShowModal, createCustomerSelected });
    } else {
      setStateCreateCustomer({ ...stateCreateCustomer, createCustomerSelected });
    }
  }

  async function getCustomer(page = customers.currentPage, limit = customers.pageSize, query = customers.query) {
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    handleReplaceUrlSearch(history, page, limit, query);
    setLoading(true);
    const apiResponse = await getAllCustomer(page, limit, query);
    if (apiResponse) {
      setCustomers({
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
    await getCustomer(current, pageSize);
  }

  async function handleFilter(query) {
    await getCustomer(1, customers.pageSize, query);
  }

  async function handleCreateCustomer(dataForm) {
    setLoading(true);
    let data = {
      user_id: myInfo._id,
      customer_full_name: dataForm.customer_full_name,
      customer_mobi: dataForm.customer_mobi,
      customer_email: dataForm.customer_email,
      customer_add: dataForm.customer_add,
      customer_bank_account_number: dataForm.customer_bank_account_number,
      customer_bank_account_info: dataForm.customer_bank_account_info,
      customer_note: dataForm.customer_note,
      customer_tax_code: dataForm.customer_tax_code,
      customer_discount: dataForm.customer_discount,
      position_id: dataForm.position_id,

    };

    const apiResponse = await createCustomer(data);
    if (apiResponse) {
      setStateCreateCustomer({ isShowModal: false, createCustomerSelected: null });
      message.success("Đã tạo khách hàng mới thành công!");
      await getCustomer();
    }
    setLoading(false);
  }

  const columnsCustomer = [
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Tên khách hàng"}</div>,
      dataIndex: "customerFullName",
      width: "13%",
      align: "center",
      render: (value, record)=> {
        let chietKhau = record.positionId?.positionDiscount
        return <><div align="left"> Họ Tên: {value}</div>
          <div align="left">Chức vụ : {record.positionId?.positionName}</div>
          <div align="left">Chiết khấu : {chietKhau ? chietKhau + " %" : ""}</div>
        </>
      }
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Thông tin"}</div>,
      width: "17%",
      dataIndex: "customerMobi",
      align: "center",
      render: (_,record) => {
        return <>
          <div align="left"><MobileOutlined /> : {record.customerMobi}</div>
          <div align="left"><MailOutlined /> : {record.customerEmail}</div>
        </>
      }
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{t("Địa chỉ")}</div>,
      width: "15%",
      dataIndex: "customerAdd",
      align: "center",
      render: value => {
        return <div align="left">{value}</div>;
      }

    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{t("Tài khoản ngân hàng")}</div>,
      width: "15%",
      dataIndex: "customerBankAccountNumber",
      align: "center",
      render: (_,record) => {
        return <>
          <div align="left">- Số tài khoản: {record.customerBankAccountNumber}</div>
          <div align="left">- Thông tin: {record.customerBankAccountInfo}</div>
        </>
      }
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{t("Mã số thuế")}</div>,
      width: "10%",
      dataIndex: "customerTaxCode",
      align: "center",
      render: value => {
        return <div align="left">{value}</div>;
      }
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{t("Ghi chú")}</div>,
      width: "10%",
      dataIndex: "customerNote",
      align: "center",
      render: value => {
        return <div align="left">{value}</div>;
      }
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{t("THAO_TAC")}</div>,
      key: "action",
      align: "center",
      width: "10%",
      fixed: "right",
      render: (record) => {
        return (
          <NavLink
            to={{
              pathname: "/customer/" + record._id,
              aboutProps: {
                id: record._id,
                name: record.customerName,
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

  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={"KHÁCH HÀNG"}>
        <Row>
          <Button type="primary" icon={<i className="fa fa-plus mr-1" />} onClick={handleShowModalCreateCustomer}>
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
          columns={columnsCustomer}
          dataSource={customers.dataRes}
          pagination={paginationConfig(handleChangePagination, customers)}
          scroll={{ x: 1200 }}
        />
      </Loading>

      <CreateCustomer
        isModalVisible={stateCreateCustomer.isShowModal}
        handleOk={handleCreateCustomer}
        handleCancel={() => setStateCreateCustomer({ isShowModal: false, createCustomerSelected: null })}
        createCustomerSelected={stateCreateCustomer.createCustomerSelected}
      />
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps)(Customer);
