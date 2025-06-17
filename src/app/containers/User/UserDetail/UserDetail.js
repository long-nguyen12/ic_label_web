import { Button, Col, Popconfirm, Row, Form, Table, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { NavLink, useHistory, useParams, Link } from "react-router-dom";
import CustomSkeleton from "@components/CustomSkeleton";
import CustomBreadcrumb from "@components/CustomBreadcrumb";

import { toast, convertCamelCaseToSnakeCase } from "@app/common/functionCommons";
import { deleteUserById, getUserById, updateUserById } from "@app/services/User";
import { getAllPositionNoQuery } from "@app/services/Position";
import { CONSTANTS, SHARE_PERMISSION, RULES } from "@constants";
import { URL } from "@url";
import { useTranslation } from "react-i18next";
import { DeleteOutlined, EyeInvisibleOutlined, RedoOutlined, EyeOutlined } from "@ant-design/icons";
import "./UserDetail.scss";
import Loading from "@components/Loading";
import Filter from "@components/Filter";
import axios from "axios";
import { generateUserPassword } from "../../../services/User";

const layoutCol = { xs: 24, md: 8, xl: 8 };
const labelCol = { xs: 24, md: 24, xl: 24 };
const { Text, Title } = Typography;

function UserDetail({ myInfo }) {
  let history = useHistory();
  let { id } = useParams();
  const { t } = useTranslation();
  const [listPosition, setlistPosition] = useState([]);
  const [formCreateUser] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  // filter
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    getData();
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);
  const isMobile = width <= 768;

  async function getData() {
    setLoading(true);
    // const userRes = await getUserById(id);
    const apiRequestAll = [getUserById(id), getAllPositionNoQuery()];
    await axios.all(apiRequestAll).then(
      axios.spread(function (userDetail, listPosition) {
        if (userDetail) {
          console.log(userDetail);
          formCreateUser.setFieldsValue({
            userFullName: userDetail.userFullName,
            userMobi: userDetail.userMobi,
            userEmail: userDetail.userEmail,
            userAdd: userDetail.userAdd,
            userNote: userDetail.userNote,
            userRole: userDetail.userClassify._id,
          });
          setUserDetail(userDetail);
        }
        if (listPosition) {
          setlistPosition(listPosition.docs);
        }
      })
    );
    setLoading(false);
  }

  async function handleDelete() {
    const api = await deleteUserById(id);
    if (api) {
      toast(CONSTANTS.SUCCESS, t("Xoá người dùng thành công"));
      history.replace(URL.USER_MANAGEMENT);
    }
  }

  async function handleUpdateUser(data) {
    if (data?.userRole !== undefined || data?.userRole !== null) {
      data.userClassify = data.userRole;
      let roleName = listPosition.filter((item) => {
        if (item._id === data.userRole) {
          return item.tenvaitro;
        }
      });
      data.role = roleName[0].tenvaitro;
      delete data.userRole;
    }
    const api = await updateUserById(id, convertCamelCaseToSnakeCase(data));
    if (api) {
      toast(CONSTANTS.SUCCESS, "Cập nhật dữ liệu thành công!");
    }
  }

  async function handleDeactiveUser() {
    setLoading(true);
    const api = await updateUserById(id, { active: !userDetail.active });
    if (api) {
      toast(
        CONSTANTS.SUCCESS,
        userDetail?.active ? "Huỷ kích hoạt người dùng thành công" : "Kích hoạt người dùng thành công!"
      );
      getData();
    }
    setLoading(false);
  }

  function convertDataSelect(list) {
    let arrConvert = [];
    list.map((data) => {
      let objConvert = {};
      objConvert.label = data.tenvaitro;
      objConvert.value = data._id;
      arrConvert.push(objConvert);
    });
    return arrConvert;
  }

  function onChangeForm(fieldSelected, dataSelected) {
    if (fieldSelected["userRole"]) {
      let _idSelected = fieldSelected["userRole"];
      listPosition.map((data) => {
        if (data._id === _idSelected) {
          formCreateUser.setFieldsValue({
            role: data.userRole,
          });
        }
      });
    }
  }

  async function handleResetPassword() {
    setLoading(true);
    const api = await generateUserPassword(userDetail._id);
    if (api) {
      toast(CONSTANTS.SUCCESS, "Cấp lại mật khẩu cho người dùng thành công!");
    }
    setLoading(false);
  }

  return (
    <>
      {isMobile ? (
        <Col>
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
            {myInfo.role === CONSTANTS.ADMIN && (
              <Popconfirm
                title={t(userDetail?.active ? "Huỷ kích hoạt người dùng này?" : "Kích hoạt người dùng này?")}
                onConfirm={handleDeactiveUser}
                okText={t("Xác nhận")}
                cancelText={t("HUY")}
                okButtonProps={{ type: "danger" }}
              >
                <Button
                  danger
                  icon={
                    userDetail?.active ? (
                      <EyeInvisibleOutlined style={{ fontSize: 15 }} />
                    ) : (
                      <EyeOutlined style={{ fontSize: 15 }} />
                    )
                  }
                >
                  {t(userDetail?.active ? "Huỷ kích hoạt" : "Kích hoạt")}
                </Button>
              </Popconfirm>
            )}
          </Row>
        </Col>
      ) : (
        <CustomBreadcrumb breadcrumbLabel={"CHI TIẾT NGƯỜI DÙNG"}>
          <Button
            className="mr-2"
            type="primary"
            ghost
            icon={<i className="fa fa-arrow-left mr-1" />}
            onClick={() => history.goBack()}
          >
            {t("QUAY_LAI")}
          </Button>
          {myInfo.role === CONSTANTS.ADMIN && (
            <Popconfirm
              title={t(userDetail?.active ? "Huỷ kích hoạt người dùng này?" : "Kích hoạt người dùng này?")}
              onConfirm={handleDeactiveUser}
              okText={t("Xác nhận")}
              cancelText={t("HUY")}
              okButtonProps={{ type: "danger" }}
            >
              <Button
                danger
                icon={
                  userDetail?.active ? (
                    <EyeInvisibleOutlined style={{ fontSize: 15 }} />
                  ) : (
                    <EyeOutlined style={{ fontSize: 15 }} />
                  )
                }
              >
                {t(userDetail?.active ? "Huỷ kích hoạt" : "Kích hoạt")}
              </Button>
            </Popconfirm>
          )}
        </CustomBreadcrumb>
      )}

      {userDetail && (
        <div className="site-layout-background">
          <Form
            id="form-modal"
            form={formCreateUser}
            onFinish={handleUpdateUser}
            onValuesChange={(fieldSelected, dataSelected) => onChangeForm(fieldSelected, dataSelected)}
          >
            <Row gutter={24}>
              <CustomSkeleton
                label={t("Tên người dùng")}
                name="userFullName"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                rules={[RULES.REQUIRED]}
                form={formCreateUser}
              />
              <CustomSkeleton
                label={t("Điện thoại")}
                name="userMobi"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                rules={[RULES.REQUIRED]}
                form={formCreateUser}
              />
              <CustomSkeleton
                label={t("Email")}
                name="userEmail"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                // rules={[RULES.REQUIRED, RULES.EMAIL]}
                form={formCreateUser}
              />
            </Row>
            <Row gutter={24}>
              <CustomSkeleton
                label={t("Địa chỉ")}
                name="userAdd"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                rules={[RULES.REQUIRED]}
                form={formCreateUser}
              />
              {listPosition && (
                <CustomSkeleton
                  label={"Chọn quyền"}
                  name="userRole"
                  layoutCol={layoutCol}
                  labelCol={labelCol}
                  options={convertDataSelect(listPosition)}
                  type={CONSTANTS.SELECT}
                  rules={[RULES.REQUIRED]}
                  form={formCreateUser}
                />
              )}
              <CustomSkeleton
                label={t("Ghi chú")}
                name="userNote"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                form={formCreateUser}
              />
            </Row>
            <Row gutter={24} className="m-1" align="middle" justify="space-between">
              <Button
                size="default"
                type="primary"
                className="mr-2"
                icon={<RedoOutlined style={{ fontSize: 15 }} />}
                onClick={handleResetPassword}
              >
                Cấp lại mật khẩu
              </Button>
              <Button size="default" type="primary" htmlType="submit">
                <i className="fa fa-save mr-1"></i>
                Lưu
              </Button>
            </Row>
          </Form>
        </div>
      )}
      <div className="site-layout-background"></div>
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps, null)(UserDetail);
