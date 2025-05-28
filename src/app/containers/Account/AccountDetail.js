import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Form, Row } from 'antd';
import { useTranslation } from 'react-i18next';

import CustomModal from '@components/CustomModal';
import CustomSkeleton from '@components/CustomSkeleton';
import { changePasswords } from '@app/services/Account';
import { CONSTANTS, RULES, USER_STATUS } from '@constants';
import { cloneObj, convertCamelCaseToSnakeCase, toast } from '@app/common/functionCommons';

const layoutCol = { xs: 24, md: 12 };
const labelCol = { xs: 24 };

function AccountDetail({ myInfo, isModalVisible, handleOk, handleCancel, userSelected, dataDonViByUser, ...props }) {
  const [formUser] = Form.useForm();
  const [formResetPass] = Form.useForm();
  const [isShowModalResetPass, setShowModalResetPass] = useState(false);
  const [isFetchingResetPass, setFetchingResetPass] = useState(false);
  let { t } = useTranslation();

  useEffect(() => {
    if (isModalVisible) {
      formUser.resetFields();
      if (userSelected) {
        const dataField = cloneObj(userSelected);
        formUser.setFieldsValue(dataField);
      } else {
        formUser.setFieldsValue({ active: USER_STATUS.ACTIVE.code });
      }
    }
  }, [isModalVisible]);

  function toggleModalResetPass(showModal) {
    if (showModal) {
      formResetPass.resetFields();
    }
    setShowModalResetPass(showModal);
  }

  function onFinish(data) {
    if (props.isLoading) return;
    data.active = true
    handleOk(userSelected ? CONSTANTS.UPDATE : CONSTANTS.CREATE, convertCamelCaseToSnakeCase(data));
  }

  async function handleResetPass(data) {
    if (props.isLoading) return;
    setFetchingResetPass(true);
    const apiResponse = await changePasswords(userSelected.idUser, data, false);
    if (apiResponse) {
      toggleModalResetPass(false);
      toast(CONSTANTS.SUCCESS, t('THAY_DOI_MAT_KHAU_THANH_CONG'));
    }
    setFetchingResetPass(false);
  }

  return (
    <>
      <CustomModal
        width="920px"
        title={userSelected ? t('CAP_NHAT_THONG_TIN_NGUOI_DUNG') : t('THEM_MOI_NGUOI_DUNG')}
        visible={isModalVisible}
        onCancel={handleCancel}
        isLoadingSubmit={props.isLoading}
        isDisabledClose={props.isLoading}
        formId="form-detail-user"
      >
        <Form id="form-detail-user" form={formUser} onFinish={onFinish}>
          <Row gutter={15}>
            <CustomSkeleton
              label={t('HO_TEN')}
              name="userFullName"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formUser}
              disabled={true}
            />

            <CustomSkeleton
              label={t('TEN_DANG_NHAP')}
              name="userName"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formUser}
              disabled={true}
            />
            {userSelected ? (
              <CustomSkeleton label={t('MAT_KHAU')} layoutCol={layoutCol} labelCol={labelCol}>
                <Button disabled onClick={() => toggleModalResetPass(true)}>{t('DAT_LAI_MAT_KHAU')}</Button>
              </CustomSkeleton>
            ) : (
              <CustomSkeleton
                label={t('MAT_KHAU')}
                name="userPass"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.PASSWORD}
                rules={[RULES.REQUIRED]}
                form={formUser}
              />
            )}
            <CustomSkeleton
              label={t('DIA_CHI_EMAIL')}
              name="userEmail"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED, RULES.EMAIL]}
              form={formUser}
              disabled={true}
            />
            <CustomSkeleton
              label={t('DIEN_THOAI')}
              name="userMobi"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED, RULES.PHONE]}
              form={formUser}
              disabled={true}
            />

            <CustomSkeleton
              label="Trạng thái"
              name="active"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.SELECT}
              options={Object.values(USER_STATUS)}
              rules={[RULES.REQUIRED]}
              form={formUser}
              showInputLabel={!userSelected}
            />
            {/*<CustomSkeleton*/}
            {/*  label="Trạng thái"*/}
            {/*  name="active"*/}
            {/*  layoutCol={layoutCol}*/}
            {/*  labelCol={labelCol}*/}
            {/*  type={CONSTANTS.SELECT}*/}
            {/*  options={Object.values(USER_STATUS)}*/}
            {/*  rules={[RULES.REQUIRED]}*/}
            {/*  form={formUser}*/}
            {/*  showInputLabel={!userSelected}*/}
            {/*/>*/}
          </Row>
        </Form>
      </CustomModal>

      <CustomModal
        width="520px"
        title={t('DAT_LAI_MAT_KHAU')}
        visible={isShowModalResetPass}
        onCancel={() => toggleModalResetPass(false)}
        isLoadingSubmit={isFetchingResetPass}
        isDisabledClose={isFetchingResetPass}
        formId="form-reset"
      >
        <Form id="form-reset" onFinish={handleResetPass}>
          <Row>
            <CustomSkeleton
              label={t('MAT_KHAU_MOI')}
              name="password"
              layoutCol={{ xs: 24 }}
              labelCol={labelCol}
              type={CONSTANTS.PASSWORD}
              rules={[RULES.REQUIRED]}
              form={formUser}
            />
          </Row>
        </Form>
      </CustomModal>
    </>
  );
}

function mapStateToProps(store) {
  const { isLoading } = store.app;
  const { myInfo } = store.user;
  return { isLoading, myInfo };
}

export default connect(mapStateToProps)(AccountDetail);
