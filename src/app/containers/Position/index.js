import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";
import { Button, message, Row, Table, Popconfirm } from "antd";

import CustomBreadcrumb from "@components/CustomBreadcrumb";
import Loading from "@components/Loading";
import { createPosition, getAllPosition } from "@app/services/Position";
import Filter from "@components/Filter";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";

import { convertQueryToObject, handleReplaceUrlSearch, paginationConfig, toast } from "@app/common/functionCommons";
import CreatePosition from "@containers/Position/CreatePosition";
import { useTranslation } from "react-i18next";
import { CONSTANTS } from "@constants";
import { uploadImages } from "../../services/File";
import { deletePosition } from "../../services/Position";

function Position({ myInfo }) {
  let history = useHistory();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState({
    dataRes: [],
    currentPage: 1,
    pageSize: 10,
    totalDocs: 0,
    query: {},
  });

  const [stateCreatePosition, setStateCreatePosition] = useState({
    isShowModal: false,
    createPositionSelected: null,
  });

  let dataSearch = [{ name: "search", label: "Tên chức vụ", type: CONSTANTS.TEXT }];

  useEffect(() => {
    (async () => {
      const { page, limit, ...queryObj } = convertQueryToObject(history.location.search);
      await getPosition(page, limit, queryObj);
    })();
  }, []);

  function handleShowModalCreatePosition(isShowModal, createPositionSelected = null) {
    if (isShowModal) {
      setStateCreatePosition({ isShowModal, createPositionSelected });
    } else {
      setStateCreatePosition({ ...stateCreatePosition, createPositionSelected });
    }
  }

  async function getPosition(page = positions.currentPage, limit = positions.pageSize, query = positions.query) {
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    handleReplaceUrlSearch(history, page, limit, query);
    setLoading(true);
    const apiResponse = await getAllPosition(page, limit, query);
    if (apiResponse) {
      setPositions({
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
    await getPosition(current, pageSize);
  }

  async function handleFilter(query) {
    await getPosition(1, positions.pageSize, query);
  }

  async function handleDelete(id) {
    const apiResponse = await deletePosition(id);
    if (apiResponse) {
      toast(CONSTANTS.SUCCESS, "Xoá chức vụ thành công!");
      await getPosition(positions.currentPage, positions.pageSize, positions.query);
    } else {
      toast(CONSTANTS.ERROR, apiResponse.message);
    }
  }

  async function handleCreatePosition(dataForm) {
    let data = {
      tenvaitro: dataForm.position_name,
      mota: dataForm.position_description,
    };

    const apiResponse = await createPosition(data);
    if (apiResponse) {
      setStateCreatePosition({ isShowModal: false, createPositionSelected: null });
      message.success("Đã tạo chức vụ mới thành công!");
      await getPosition();
    } else {
      message.error(apiResponse.message);
    }
  }

  const columnsPosition = [
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Tên vai trò"}</div>,
      dataIndex: "tenvaitro",
      width: "40%",
      align: "center",
      render: (value) => {
        return <div align="center">{value}</div>;
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{t("MO_TA")}</div>,
      width: "30%",
      dataIndex: "mota",
      align: "center",
      render: (value) => {
        return <div align="center">{value}</div>;
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{t("THAO_TAC")}</div>,
      key: "action",
      align: "center",
      width: "30%",
      fixed: "right",
      render: (record) => {
        return (
          <Row align="center">
            <NavLink
              to={{
                pathname: "/position/" + record._id,
                aboutProps: {
                  id: record._id,
                  name: record.tenvaitro,
                },
              }}
            >
              <Button type="primary" ghost icon={<EyeOutlined style={{ fontSize: 15 }} />} className="mr-1">
                {t("XEM")}
              </Button>
            </NavLink>
            <Popconfirm
              title={t("Xoá vai trò này?")}
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
      <CustomBreadcrumb breadcrumbLabel={"CHỨC VỤ"}>
        <Row>
          <Button type="primary" icon={<i className="fa fa-plus mr-1" />} onClick={handleShowModalCreatePosition}>
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
          columns={columnsPosition}
          dataSource={positions.dataRes}
          pagination={paginationConfig(handleChangePagination, positions)}
          scroll={{ x: 1200 }}
        />
      </Loading>

      <CreatePosition
        isModalVisible={stateCreatePosition.isShowModal}
        handleOk={handleCreatePosition}
        handleCancel={() => setStateCreatePosition({ isShowModal: false, createPositionSelected: null })}
        createPositionSelected={stateCreatePosition.createPositionSelected}
      />
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps)(Position);

