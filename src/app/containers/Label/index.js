import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";
import { Button, message, Row, Table, Popconfirm } from "antd";

import CustomBreadcrumb from "@components/CustomBreadcrumb";
import Loading from "@components/Loading";
import { createLabel, getAllLabel, deleteLabel } from "@app/services/Label";
import Filter from "@components/Filter";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";

import { convertQueryToObject, handleReplaceUrlSearch, paginationConfig, toast } from "@app/common/functionCommons";
import CreateLabel from "@containers/Label/CreateLabel";
import { useTranslation } from "react-i18next";
import { CONSTANTS } from "@constants";
import { createLabelbyFile } from "../../services/Label";

function Label({ myInfo }) {
  let history = useHistory();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState({
    dataRes: [],
    currentPage: 1,
    pageSize: 10,
    totalDocs: 0,
    query: {},
  });

  const [stateCreateLabel, setStateCreateLabel] = useState({
    isShowModal: false,
    createLabelSelected: null,
  });

  let dataSearch = [{ name: "search", label: "Tên nhãn", type: CONSTANTS.TEXT }];

  useEffect(() => {
    (async () => {
      const { page, limit, ...queryObj } = convertQueryToObject(history.location.search);
      await getLabel(page, limit, queryObj);
    })();
  }, []);

  function handleShowModalCreateLabel(isShowModal, createLabelSelected = null) {
    if (isShowModal) {
      setStateCreateLabel({ isShowModal, createLabelSelected });
    } else {
      setStateCreateLabel({ ...stateCreateLabel, createLabelSelected });
    }
  }

  async function getLabel(page = labels.currentPage, limit = labels.pageSize, query = labels.query) {
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    handleReplaceUrlSearch(history, page, limit, query);
    setLoading(true);
    const apiResponse = await getAllLabel(page, limit, query);
    console.log(query);
    if (apiResponse) {
      setLabels({
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
    await getLabel(current, pageSize);
  }

  async function handleFilter(query) {
    await getLabel(1, labels.pageSize, query);
  }

  async function handleDelete(id) {
    const apiResponse = await deleteLabel(id);
    if (apiResponse) {
      toast(CONSTANTS.SUCCESS, "Xoá nhãn thành công!");
      await getLabel(labels.currentPage, labels.pageSize, labels.query);
    } else {
      toast(CONSTANTS.ERROR, apiResponse.message);
    }
  }

  async function handleCreateLabel(dataForm) {
    if (dataForm instanceof FormData) {
      const apiResponse = await createLabelbyFile(dataForm);
      if (apiResponse) {
        setStateCreateLabel({ isShowModal: false, createLabelSelected: null });
        message.success("Đã tạo nhãn mới thành công!");
        await getLabel();
      } else {
        message.error(apiResponse.message);
      }
    } else {
      let data = {
        label_name: dataForm.label_name,
        label_color: dataForm.label_color,
      };

      const apiResponse = await createLabel(data);
      if (apiResponse) {
        setStateCreateLabel({ isShowModal: false, createLabelSelected: null });
        message.success("Đã tạo nhãn mới thành công!");
        await getLabel();
      } else {
        message.error(apiResponse.message);
      }
    }
  }

  const columnsLabel = [
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Nhãn"}</div>,
      dataIndex: "labelName",
      width: "30%",
      align: "center",
      render: (value) => {
        return <div align="center">{value}</div>;
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Nhãn tiếng Việt"}</div>,
      dataIndex: "labelVietnamese",
      width: "30%",
      align: "center",
      render: (value) => {
        return <div align="center">{value}</div>;
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Màu sắc"}</div>,
      width: "20%",
      dataIndex: "labelColor",
      align: "center",
      render: (value) => {
        return (
          <Row align="center" justify="middle">
            <span
              style={{
                display: "inline-block",
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: value,
              }}
            />
          </Row>
        );
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
                pathname: "/label/" + record._id,
                aboutProps: {
                  id: record._id,
                  name: record.labelName,
                },
              }}
            >
              <Button type="primary" ghost icon={<EyeOutlined style={{ fontSize: 15 }} />} className="mr-1">
                {t("XEM")}
              </Button>
            </NavLink>
            <Popconfirm
              title={t("Xoá nhãn này?")}
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
      <CustomBreadcrumb breadcrumbLabel={"NHÃN"}>
        <Row>
          <Button type="primary" icon={<i className="fa fa-plus mr-1" />} onClick={handleShowModalCreateLabel}>
            {t("TAO_MOI")}
          </Button>
        </Row>
      </CustomBreadcrumb>
      <Loading active={loading} layoutBackground>
        <Filter
          dataSearch={dataSearch}
          handleFilter={(query) => handleFilter(query)}
          layoutCol={{ xs: 24, sm: 24, md: 24, lg: 12, xl: 12, xxl: 12 }}
          labelCol={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 10, xxl: 8 }}
        />
        <Table
          bordered
          rowKey="_id"
          size="small"
          columns={columnsLabel}
          dataSource={labels.dataRes}
          pagination={paginationConfig(handleChangePagination, labels)}
          scroll={{ x: 1200 }}
        />
      </Loading>

      <CreateLabel
        isModalVisible={stateCreateLabel.isShowModal}
        handleOk={handleCreateLabel}
        handleCancel={() => setStateCreateLabel({ isShowModal: false, createLabelSelected: null })}
        createLabelSelected={stateCreateLabel.createLabelSelected}
      />
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps)(Label);
