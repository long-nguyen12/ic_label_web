import React from "react";
import { connect } from "react-redux";
import { Button, Col, Form, Row, Tabs } from "antd";
import { SaveFilled } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import CustomSkeleton from "@components/CustomSkeleton";
import { CONSTANTS, RULES, USER_STATUS, USER_TYPE } from "@constants";
import { requestChangePassword } from "@app/services/User";
import { cloneObj, toast } from "@app/common/functionCommons";

import * as app from "@app/store/ducks/app.duck";
import * as user from "@app/store/ducks/user.duck";
import CustomBreadcrumb from "@components/CustomBreadcrumb";

function MyInfo({ myInfo, isLoading, roleList, ...props }) {
  const [formInfo] = Form.useForm();
  const [formChangePassword] = Form.useForm();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (myInfo) {
      const dataField = cloneObj(myInfo);
      formInfo.setFieldsValue(dataField);
      console.log("myInfo", myInfo);
      if (myInfo.active === USER_STATUS.ACTIVE.code) formInfo.setFieldsValue({ active: USER_STATUS.ACTIVE.label });
      if (myInfo.active === USER_STATUS.INACTIVE.code) formInfo.setFieldsValue({ active: USER_STATUS.INACTIVE.label });
      formInfo.setFieldsValue({ username: myInfo.username, workAddress: myInfo.workAddress });
      if (myInfo.role === USER_TYPE.ADMIN.code) formInfo.setFieldsValue({ role: USER_TYPE.ADMIN.label });
      if (myInfo.role === USER_TYPE.MANAGE.code) formInfo.setFieldsValue({ role: USER_TYPE.MANAGE.label });
      if (myInfo.role === USER_TYPE.USER.code) formInfo.setFieldsValue({ role: USER_TYPE.USER.label });
    }
  }, [myInfo]);

  function handleUpdateMyInfo({ userFullName, userEmail, userMobi, userAdd }) {
    const data = {
      user_name: myInfo.userName,
      user_full_name: userFullName,
      role: myInfo.role,
      user_email: userEmail,
      user_mobi: userMobi,
      user_tax_code: userTaxCode,
      user_add: userAdd,
    };
    props.updateMyInfo(data);
  }

  async function handleChangePassword() {
    const values = formChangePassword.getFieldsValue();
    const { oldPassword, newPassword, confirmPassword } = values;
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast(CONSTANTS.ERROR, "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const apiResponse = await requestChangePassword({ oldPassword, newPassword });
    if (apiResponse) {
      toast(CONSTANTS.SUCCESS, "Thay đổi mật khẩu thành công. Vui lòng đăng nhập lại");
      formChangePassword.resetFields();
      props.clearToken();
    }
  }

  function onValuesChange(changedValues, allValues) {
    const { newPassword } = changedValues;
    if (newPassword && allValues?.confirmPassword) {
      formChangePassword.validateFields(["confirmPassword"]);
    }
  }

  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={t("THONG_TIN_CA_NHAN")} />
      <div className="site-layout-background">
        <Tabs size="small">
          <Tabs.TabPane tab={t("THONG_TIN_CA_NHAN")} key="1">
            <Row>
              <Col sm={18}>
                <Form form={formInfo} id="form-info" autoComplete="off" onFinish={handleUpdateMyInfo}>
                  <Row gutter={15}>
                    <CustomSkeleton
                      size="default"
                      label={t("TEN_DANG_NHAP")}
                      name="userName"
                      type={CONSTANTS.TEXT}
                      labelCol={{ xs: 8 }}
                      layoutCol={{ xs: 24 }}
                      showInputLabel
                    />
                    <CustomSkeleton
                      size="default"
                      label={t("HO_TEN")}
                      name="userFullName"
                      type={CONSTANTS.TEXT}
                      labelCol={{ xs: 8 }}
                      layoutCol={{ xs: 24 }}
                      rules={[RULES.REQUIRED]}
                      disabled={isLoading}
                      form={formInfo}
                    />
                    <CustomSkeleton
                      size="default"
                      label="Email"
                      name="userEmail"
                      type={CONSTANTS.TEXT}
                      rules={[RULES.EMAIL, RULES.REQUIRED]}
                      labelCol={{ xs: 8 }}
                      layoutCol={{ xs: 24 }}
                      disabled={isLoading}
                      form={formInfo}
                    />
                    <CustomSkeleton
                      size="default"
                      label={t("DIEN_THOAI")}
                      name="userMobi"
                      type={CONSTANTS.TEXT}
                      labelCol={{ xs: 8 }}
                      layoutCol={{ xs: 24 }}
                      rules={[RULES.PHONE, RULES.REQUIRED]}
                      disabled={isLoading}
                      helpInline={false}
                    />
                    <CustomSkeleton
                      size="default"
                      label={" Địa chỉ"}
                      name="userAdd"
                      type={CONSTANTS.TEXT}
                      labelCol={{ xs: 8 }}
                      layoutCol={{ xs: 24 }}
                      rules={[RULES.REQUIRED]}
                      disabled={isLoading}
                      helpInline={false}
                    />
                    <CustomSkeleton
                      size="default"
                      label={"Quyền"}
                      name="role"
                      type={CONSTANTS.TEXT}
                      labelCol={{ xs: 8 }}
                      layoutCol={{ xs: 24 }}
                      showInputLabel
                    />
                    <CustomSkeleton
                      size="default"
                      label={"Trạng thái"}
                      name="active"
                      type={CONSTANTS.TEXT}
                      labelCol={{ xs: 8 }}
                      layoutCol={{ xs: 24 }}
                      showInputLabel
                    />
                  </Row>
                </Form>
              </Col>

              <Col xs={24}>
                <Button
                  htmlType="submit"
                  form="form-info"
                  type="primary"
                  className="float-right"
                  icon={<SaveFilled />}
                  disabled={isLoading}
                >
                  {t("LUU")}
                </Button>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane tab={t("DOI_MAT_KHAU")} key="2">
            <Row>
              <Col sm={18}>
                <Form
                  form={formChangePassword}
                  id="form-password"
                  autoComplete="off"
                  // onFinish={checkChange}
                  onValuesChange={onValuesChange}
                >
                  <Row gutter={15}>
                    <CustomSkeleton
                      size="default"
                      label={t("MAT_KHAU_CU")}
                      name="oldPassword"
                      type={CONSTANTS.PASSWORD}
                      rules={[RULES.REQUIRED]}
                      layoutCol={{ xs: 24 }}
                      labelCol={{ xs: 8 }}
                      disabled={isLoading}
                      helpInline={false}
                    />
                    <CustomSkeleton
                      size="default"
                      label={t("MAT_KHAU_MOI")}
                      name="newPassword"
                      type={CONSTANTS.PASSWORD}
                      layoutCol={{ xs: 24 }}
                      labelCol={{ xs: 8 }}
                      rules={[RULES.REQUIRED, RULES.PASSWORD_FORMAT]}
                      disabled={isLoading}
                      helpInline={false}
                    />
                    <CustomSkeleton
                      size="default"
                      label={t("XAC_NHAN_MAT_KHAU_MOI")}
                      name="confirmPassword"
                      layoutCol={{ xs: 24 }}
                      labelCol={{ xs: 8 }}
                      type={CONSTANTS.PASSWORD}
                      helpInline={false}
                      rules={[
                        RULES.REQUIRED,
                        ({ getFieldValue }) => ({
                          validator(rule, confirmPassword) {
                            if (confirmPassword && getFieldValue("newPassword") !== confirmPassword) {
                              return Promise.reject(t("MK_MOI_KO_TRUNG_KHOP"));
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                      disabled={isLoading}
                    />

                    <Col xs={24}>
                      <Button
                        // htmlType="submit"
                        // form="form-password"
                        type="primary"
                        className="float-right"
                        icon={<SaveFilled />}
                        disabled={isLoading}
                        onClick={handleChangePassword}
                      >
                        {t("LUU")}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  const { isLoading } = store.app;
  return { isLoading, myInfo };
}

export default connect(mapStateToProps, { ...app.actions, ...user.actions })(MyInfo);

