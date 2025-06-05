import AddNewButton from "@AddNewButton";
import { PieChartOutlined, TeamOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { cloneObj, toast } from "@app/common/functionCommons";
import { createUser, deleteUser, getAllUsers, updateUser } from "@app/services/Account";
import ActionCell from "@components/ActionCell";
import Loading from "@components/Loading";
import { CONSTANTS, USER_TYPE } from "@constants";
import AccountDetail from "@containers/Account/AccountDetail";
import { message, Table, Tabs, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { G2, Pie } from "@ant-design/plots";
import CustomBreadcrumb from "@components/CustomBreadcrumb";

const { TabPane } = Tabs;

function Account({ isLoading, myInfo }) {
  const [dataUser, setDataUser] = useState([]);
  let { t } = useTranslation();
  const [stateUser, setStateUser] = useState({
    isShowModal: false,
    userSelected: null,
  });

  useEffect(() => {
    (async () => {
      await getDataUser();
    })();
  }, []);

  async function getDataUser() {
    const apiResponse = await getAllUsers();
    if (apiResponse) {
      setDataUser(apiResponse.docs);
    }
  }

  async function handleDeleteUser(userSelected) {
    const apiResponse = await deleteUser(myInfo._id, userSelected._id);
    if (apiResponse) {
      await getDataUser();
      message.success(t("XOA_TAI_KHOAN_THANH_CONG"));
    }
  }

  const userColumns = [
    { title: <div className="format-title-table">{t("HO_TEN")}</div>, dataIndex: "userFullName" },
    { title: <div className="format-title-table">{t("TEN_DANG_NHAP")}</div>, dataIndex: "userName" },
    { title: <div className="format-title-table">{t("DIEN_THOAI")}</div>, dataIndex: "userMobi" },
    { title: <div className="format-title-table">{t("DIA_CHI_EMAIL")}</div>, dataIndex: "userEmail" },
    {
      title: <div className="format-title-table">{t("TRANG_THAI")}</div>,
      dataIndex: "active",
      align: "center",
      // render: () => {
      //   return <Text>{t('HOAT_DONG')}</Text>;
      // },
      render: () => {
        return (
          <Tag color="success" className="m-0">
            {t("HOAT_DONG")}
          </Tag>
        );
      },
    },
    {
      title: <div className="format-title-table">{t("THAO_TAC")}</div>,
      align: "center",
      render: (value) => (
        <ActionCell
          value={value}
          handleEdit={() => setStateUser({ isShowModal: true, userSelected: value })}
          handleDelete={handleDeleteUser}
          disabledDelete={value.role === USER_TYPE.ADMIN.code}
          deleteText={t("XOA")}
          title={t("XOA_DU_LIEU")}
          okText={t("XOA")}
          cancelText={t("HUY")}
          editText={t("SUA")}
        />
      ),
      fixed: "right",
      width: 200,
    },
  ];

  function handleShowModalUser(isShowModal, userSelected = null) {
    if (isShowModal) {
      setStateUser({ isShowModal, userSelected });
    } else {
      setStateUser({ ...stateUser, isShowModal });
    }
  }

  async function createAndModifyUser(type, dataForm) {
    const dataRequest = cloneObj(dataForm);
    let apiResponse = null;
    if (type === CONSTANTS.CREATE) {
      // dataRequest.roles = ['moderator'];
      apiResponse = await createUser(dataRequest);
      if (apiResponse) {
        await getDataUser();
      }
    }

    if (type === CONSTANTS.UPDATE) {
      apiResponse = await updateUser(stateUser.userSelected._id, dataRequest);
      if (apiResponse) {
        delete apiResponse.token;
        const docs = dataUser.map((doc) => {
          if (doc._id === apiResponse?._id) {
            doc = apiResponse;
          }
          return doc;
        });
        setDataUser(docs);
      }
    }
    if (apiResponse) {
      handleShowModalUser(false);
      toast(
        CONSTANTS.SUCCESS,
        `${type === CONSTANTS.CREATE ? t("TAO_MOI") : t("CAP_NHAT")} ${t("THONG_TIN_TAI_KHOAN_THANH_CONG")}`
      );
    }
  }

  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={t("QUAN_LY")}>
        <AddNewButton label={t("TAO_MOI")} onClick={() => handleShowModalUser(true)} disabled={isLoading} />
      </CustomBreadcrumb>
      <div className="site-layout-background">
        <Tabs type="card">
          <TabPane
            tab={
              <div style={{ fontSize: 15 }}>
                <TeamOutlined style={{ fontSize: 15 }} />
                {t("QUAN_LY_TAI_KHOAN")}
              </div>
            }
            key="taiKhoan"
          >
            <Loading active={isLoading}>
              <Table
                bordered
                rowKey="_id"
                size="small"
                style={{ width: "100%" }}
                columns={userColumns}
                dataSource={dataUser}
                pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ["10", "20", "50", "100"] }}
                scroll={{ x: "max-content" }}
              />
            </Loading>
          </TabPane>
        </Tabs>
      </div>

      <AccountDetail
        type={!!stateUser.userSelected ? CONSTANTS.UPDATE : CONSTANTS.CREATE}
        isModalVisible={stateUser.isShowModal}
        handleOk={createAndModifyUser}
        handleCancel={() => handleShowModalUser(false)}
        userSelected={stateUser.userSelected}
        // dataDonViByUser={dataDonViByUser}
      />
    </>
  );
}

function mapStateToProps(store) {
  const { isLoading } = store.app;
  const { myInfo } = store.user;
  return { isLoading, myInfo };
}

export default connect(mapStateToProps, null)(Account);
