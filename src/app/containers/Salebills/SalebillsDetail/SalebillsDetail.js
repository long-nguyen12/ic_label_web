import { Button, Col, ConfigProvider, Dropdown, Menu, Popconfirm, Row, Form, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { NavLink, useHistory, useParams } from 'react-router-dom';

import CustomSkeleton from '@components/CustomSkeleton';
import CustomBreadcrumb from '@components/CustomBreadcrumb';

import { formatDateTime, toast, convertCamelCaseToSnakeCase, paginationConfig } from '@app/common/functionCommons';
import {
  deleteCustomer,
  deleteImg,
  getCustomerByFilterId,
  getCustomerIdFilterAll,
  getUserShareCustomer,
} from '@app/services/Customer';
import { CONSTANTS, SHARE_PERMISSION, RULES } from '@constants';
import { URL } from '@url';
import { useTranslation } from 'react-i18next';

import { DeleteOutlined } from '@ant-design/icons';
import './SalebillsDetail.scss';
import { getCustomerById, updateCustomer } from '../../../services/Customer';
import Loading from '@components/Loading';
import Filter from '@components/Filter';
import { getAllSalebillsByUserID } from '../../../services/Salebills';
import axios from 'axios';

const pageSizeNumber = 10;
const UNLABELED = 'Unlabeled';

const layoutCol = { xs: 8, md: 8 };
const labelCol = { xs: 24 };

function SalebillsDetail({ myInfo }) {
  let history = useHistory();
  let { id } = useParams();
  const { t } = useTranslation();

  const [formCreateCustomer] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [salebills, setSalebills] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState({
    dataRes: [],
    currentPage: 1,
    pageSize: 10,
    totalDocs: 0,
    query: {},
  });
  // filter
  const [filterSelected, setFilterSelected] = useState({
    page: 1,
    label: CONSTANTS.ALL,
    orgUnit: undefined,
    owner: undefined,
  });
  let dataSearch = [{ name: 'search', label: t('Mã hoá đơn'), type: CONSTANTS.TEXT }];
  const columnsCustomer = [
    {
      title: <div style={{ textTransform: 'capitalize' }}>{'Tên khách hàng'}</div>,
      dataIndex: 'customerFullName',
      width: '15%',
    },
    {
      title: <div style={{ textTransform: 'capitalize' }}>{'Điện thoại'}</div>,
      width: '10%',
      dataIndex: 'customerMobi',
    },
    {
      title: <div style={{ textTransform: 'capitalize' }}>{t('Email')}</div>,
      width: '10%',
      dataIndex: 'customerEmail',
    },
    {
      title: <div style={{ textTransform: 'capitalize' }}>{t('Địa chỉ')}</div>,
      width: '15%',
      dataIndex: 'customerAdd',
    },
    {
      title: <div style={{ textTransform: 'capitalize' }}>{t('Tài khoản ngân hàng')}</div>,
      width: '15%',
      dataIndex: 'customerBankAccountNumber',
    },
    {
      title: <div style={{ textTransform: 'capitalize' }}>{t('Mã số thuế')}</div>,
      width: '10%',
      dataIndex: 'customerTaxCode',
    },
    {
      title: <div style={{ textTransform: 'capitalize' }}>{t('THAO_TAC')}</div>,
      key: 'action',
      align: 'center',
      width: '10%',
      fixed: 'right',
      render: (record) => {
        return (
          <NavLink
            to={{
              pathname: '/customer/' + record._id,
              aboutProps: {
                id: record._id,
                name: record.customerName,
              },
            }}
          >
            <Button type="primary" ghost>
              {t('XEM')}
            </Button>
          </NavLink>
        );
      },
    },
  ];

  const isMyCustomer = customerDetail?.userId?._id === myInfo._id;

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    const apiRequestAll = [
      getCustomerById(id),
      getAllSalebillsByUserID(1, 0, id),
    ];
    setLoading(true);
    await axios.all(apiRequestAll)
      .then(axios.spread(function(customerRes, salebillsRes) {
        if (customerRes) {
          formCreateCustomer.setFieldsValue({
            customerFullName: customerRes.customerFullName,
            customerMobi: customerRes.customerMobi,
            customerEmail: customerRes.customerEmail,
            customerAdd: customerRes.customerAdd,
            customerBankAccountNumber: customerRes.customerBankAccountNumber,
            customerTaxCode: customerRes.customerTaxCode,
          });
          setCustomerDetail(customerRes);
        }
        if (salebillsRes) {
          setSalebills(salebillsRes);
        }
      }));
    setLoading(false);
  }

  async function getCustomerDetail() {
    const apiResponse = await getCustomerById(id);
    if (apiResponse) {
      formCreateCustomer.setFieldsValue({
        customerFullName: apiResponse.customerFullName,
        customerMobi: apiResponse.customerMobi,
        customerEmail: apiResponse.customerEmail,
        customerAdd: apiResponse.customerAdd,
        customerBankAccountNumber: apiResponse.customerBankAccountNumber,
        customerTaxCode: apiResponse.customerTaxCode,
      });
      setCustomerDetail(apiResponse);
    }
  }


  async function handleDelete() {
    const api = await deleteCustomer(id);
    if (api) {
      toast(CONSTANTS.SUCCESS, t('Xoá khách hàng thành công'));
      history.replace(URL.CUSTOMER_MANAGEMENT);
    }
  }

  async function handleUpdateCustomer(data) {
    const api = await updateCustomer(id, convertCamelCaseToSnakeCase(data));
    if (api) {
      toast(CONSTANTS.SUCCESS, 'Cập nhật dữ liệu thành công!');
      await getCustomerDetail();
    }
  }

  function handleShowModalCreateCustomer(isShowModal, createCustomerSelected = null) {
    if (isShowModal) {
      setStateCreateCustomer({ isShowModal, createCustomerSelected });
    } else {
      setStateCreateCustomer({ ...stateCreateCustomer, createCustomerSelected });
    }
  }

  async function handleFilter(query) {
    await getCustomer(1, customers.pageSize, query);
  }

  async function handleChangePagination(current, pageSize) {
    await getCustomer(current, pageSize);
  }

  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={'CHI TIẾT KHÁCH HÀNG'}>
        <Button
          className="mr-2"
          type="primary"
          ghost
          icon={<i className="fa fa-arrow-left mr-1"/>}
          onClick={() => history.goBack()}
        >
          {t('QUAY_LAI')}
        </Button>
        {(isMyCustomer || myInfo.role === CONSTANTS.ADMIN) && (
          <Popconfirm
            title={t('Xoá khách hàng')}
            onConfirm={handleDelete}
            okText={t('XOA')}
            cancelText={t('HUY')}
            okButtonProps={{ type: 'danger' }}
          >
            <Button danger icon={<DeleteOutlined style={{ fontSize: 15 }}/>}>
              {t('Xoá khách hàng')}
            </Button>
          </Popconfirm>
        )}
      </CustomBreadcrumb>

      {customerDetail && (
        <div className="site-layout-background">
          <Form id="form-modal" form={formCreateCustomer} onFinish={handleUpdateCustomer}>
            <Row gutter={15}>
              <CustomSkeleton
                label={t('Tên khách hàng')}
                name="customerFullName"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                rules={[RULES.REQUIRED]}
                form={formCreateCustomer}
              />
              <CustomSkeleton
                label={t('Điện thoại')}
                name="customerMobi"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                rules={[RULES.REQUIRED]}
                form={formCreateCustomer}
              />
              <CustomSkeleton
                label={t('Email')}
                name="customerEmail"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                rules={[RULES.REQUIRED, RULES.EMAIL]}
                form={formCreateCustomer}
              />
            </Row>
            <Row gutter={15}>
              <CustomSkeleton
                label={t('Địa chỉ')}
                name="customerAdd"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                rules={[RULES.REQUIRED]}
                form={formCreateCustomer}
              />
              <CustomSkeleton
                label={t('Tài khoản ngân hàng')}
                name="customerBankAccountNumber"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                rules={[RULES.REQUIRED, RULES.NUMBER]}
                form={formCreateCustomer}
              />
              <CustomSkeleton
                label={t('Mã số thuế')}
                name="customerTaxCode"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                rules={[RULES.REQUIRED, RULES.NUMBER]}
                form={formCreateCustomer}
              />
            </Row>
            <Row gutter={24}>
              <Button
                size="default"
                type="primary"
                htmlType="submit"
                className="btn"
                // disabled={false}
                // {...(onOk ? { onClick: onOk } : null)}
                // loading={isLoading && !isDisabledSubmit}
                // icon={submitIcon}
              >
                {/* {submitLabel} */}
                Lưu
              </Button>
            </Row>
          </Form>
        </div>
      )}

      <CustomBreadcrumb breadcrumbLabel={'DANH SÁCH HOÁ ĐƠN'}> <Button type="primary"
                                                                       icon={<i className="fa fa-plus mr-1"/>}
                                                                       onClick={handleShowModalCreateCustomer}>
        {t('TAO_MOI')}
      </Button></CustomBreadcrumb>
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
          columns={columnsCustomer}
          dataSource={customers.dataRes}
          pagination={paginationConfig(handleChangePagination, customers)}
          scroll={{ x: 1200 }}
        />
      </Loading>
      <div className="site-layout-background">

      </div>

    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps, null)(SalebillsDetail);
