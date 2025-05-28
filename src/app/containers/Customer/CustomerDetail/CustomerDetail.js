import { Button, Col, ConfigProvider, Dropdown, Menu, Popconfirm, Row, Form, Table, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { NavLink, useHistory, useParams, Link } from 'react-router-dom';
import moment from 'moment';
import CustomSkeleton from '@components/CustomSkeleton';
import CustomBreadcrumb from '@components/CustomBreadcrumb';

import { formatDateTime, toast, convertCamelCaseToSnakeCase, paginationConfig } from '@app/common/functionCommons';
import { deleteCustomer } from '@app/services/Customer';
import { CONSTANTS, SHARE_PERMISSION, RULES } from '@constants';
import { URL } from '@url';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../../utils';
import { getAllPositionNoQuery } from '../../../services/Position';
import { DeleteOutlined } from '@ant-design/icons';
import './CustomerDetail.scss';
import { getCustomerById, updateCustomer } from '../../../services/Customer';
import Loading from '@components/Loading';
import Filter from '@components/Filter';
// import { getAllSalebillsByUserID } from "../../../services/Salebills";
import axios from 'axios';
import { getAllSalebillsByUserID } from '@app/services/Report';

const layoutCol = { xs: 24, md: 8 , xl:8};
const labelCol = { xs: 24, md: 24 , xl:24};
const { Text, Title } = Typography;

function CustomerDetail({ myInfo }) {
  let history = useHistory();
  let { id } = useParams();
  const { t } = useTranslation();
  const [listPosition, setlistPosition] = useState([])
  const [formCreateCustomer] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [salebills, setSalebills] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState({
    dataRes: [],
    currentPage: 1,
    pageSize: 10,
    totalDocs: 0,
    query: {},
  });
  // filter
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  let dataSearch = [
    { name: 'tungay', label: 'Từ ngày', type: CONSTANTS.DATE },
    { name: 'denngay', label: 'Đến ngày', type: CONSTANTS.DATE },
  ];
  const columnsSalebills = [
    {
      title: <div style={{ textTransform: 'capitalize' }}>{'Mã hoá đơn'}</div>,
      width: '10%',
      dataIndex: 'saleId',
    },

    {
      title: <div style={{ textTransform: 'capitalize' }}>{t('Ngày xuất')}</div>,
      dataIndex: 'saleDate',
      render: (value) => formatDateTime(value ? value : null),
      width: '10%',
    },
    {
      title: <div style={{ textTransform: 'capitalize' }}>{t('Tiền đơn hàng')}</div>,
      align: 'center',
      dataIndex: 'saleBillsPaid',
      width: '15%',
      render: (value, row) => {
        let saleBillsDebt = row.saleBillsDebt ? row.saleBillsDebt : 0;
        return <>
          <div align={'left'}><Text>
            - Tiền đơn hàng: <b>{row.saleTotalPayableADiscount ? formatNumber(row.saleTotalPayableADiscount) + ' VND' : 0 + ' VND'}</b>
          </Text>
          </div>
          <div align={'left'}><Text>

            - Lợi nhuận:<b> <Text
            type={'success'}> { row.saleProfitMoney ? formatNumber(row.saleProfitMoney) + ' VND' : ''} </Text>
          </b>
          </Text>
          </div>
        </>;
      },
    },
    {
      title: <div style={{ textTransform: 'capitalize' }}>{'Thông tin thanh toán'}</div>,
      width: '10%',
      dataIndex: 'saleProfitMoney',
      align: "center",
      render: (value, row) => {
        let saleBillsDebt = row.saleBillsDebt ? row.saleBillsDebt : 0;
        return   <>
          <div align={'left'}><Text>
            - Đã thanh toán: <b><Text
            type="secondary">{row.saleBillsPaid ? formatNumber(row.saleBillsPaid) + ' VND' : 0 + ' VND'} </Text></b>
          </Text>
          </div>
          <div align={'left'}><Text>
            - Tiền còn nợ: <b> <Text
            type={parseInt(saleBillsDebt) === 0 ? 'warning' : 'danger'}> {formatNumber(saleBillsDebt) + ' VND'} </Text>
          </b>
          </Text>
          </div>
        </>
      }
    },
    {
      title: <div style={{ textTransform: 'capitalize' }}>{'Tên hoá đơn'}</div>,
      dataIndex: 'saleName',
      width: '15%',
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
              pathname: '/salebills/' + record._id,
              state: {
                id: record._id,
                customerId: id,
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
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);
  const isMobile = width <= 768;

  async function getData() {
    let query = { customerId: `${id}` };
    const apiRequestAll = [getCustomerById(id), getAllSalebillsByUserID(1, 0, query),getAllPositionNoQuery()];
    setLoading(true);
    await axios.all(apiRequestAll).then(
      axios.spread(function(customerRes, salebillsRes, listPosition) {
        if (customerRes) {
          formCreateCustomer.setFieldsValue({
            customerFullName: customerRes.customerFullName,
            customerMobi: customerRes.customerMobi,
            customerEmail: customerRes.customerEmail,
            customerAdd: customerRes.customerAdd,
            customerBankAccountNumber: customerRes.customerBankAccountNumber,
            customerBankAccountInfo: customerRes.customerBankAccountInfo,
            customerNote: customerRes.customerNote,
            customerTaxCode: customerRes.customerTaxCode,
            customerDiscount: customerRes.customerDiscount,
            positionId: customerRes.positionId?._id,
          });
          setCustomerDetail(customerRes);
        }
        if (salebillsRes) {
          setSalebills(salebillsRes.docs);
        }
        if (listPosition) {
          setlistPosition(listPosition.docs);
        }
      }),
    );
    setLoading(false);
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
    }
  }

  async function handleFilter(query) {
    query.customerId = `${id}`;
    if(query.tungay && query.tungay[0]) {
      let from = (query.tungay && query.tungay[0]) ? query.tungay[0] : '';
      let to = (query.denngay && query.denngay[0]) ? query.denngay[0] : '';
      query.timeStart =  moment(from).format('DD-MM-yyyy');
      query.timeEnd = moment(to).format('DD-MM-yyyy');
      delete query.tungay;
      delete query.denngay;
    }
    let salebillsRes = await getAllSalebillsByUserID(1, 0, query);
    if (salebillsRes) {
      setSalebills(salebillsRes.docs);
    }
  }

  async function handleChangePagination(current, pageSize) {
    // await getCustomer(current, pageSize);
  }
  function convertDataSelect(list) {
    let arrConvert = []
    list.map(data => {
      let objConvert = {}
      objConvert.label = data.positionName;
      objConvert.value = data._id;
      arrConvert.push(objConvert)
    })
    return arrConvert
  }

  function onChangeForm(fieldSelected,dataSelected ) {
    if (fieldSelected['positionId']) {
      let _idSelected = fieldSelected['positionId'];
      listPosition.map(data => {
        if (data._id === _idSelected) {
          formCreateCustomer.setFieldsValue({
            customerDiscount: data.positionDiscount,
          });
        }
      });
    }

  }

  return (
    <>
      {isMobile ? (
        <Col>
          <CustomBreadcrumb breadcrumbLabel={'CHI TIẾT KHÁCH HÀNG'}></CustomBreadcrumb>
          <Row>
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
          </Row>
        </Col>
      ) : (
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
      )}

      {customerDetail && (
        <div className="site-layout-background">
          <Form id="form-modal" form={formCreateCustomer} onFinish={handleUpdateCustomer}
                onValuesChange={(fieldSelected, dataSelected) => onChangeForm(fieldSelected, dataSelected)}
          >
            <Row gutter={24}>
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
                // rules={[RULES.REQUIRED, RULES.EMAIL]}
                form={formCreateCustomer}
              />
            </Row>
            <Row gutter={24}>
              <CustomSkeleton
                label={t('Địa chỉ')}
                name="customerAdd"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                rules={[RULES.REQUIRED]}
                form={formCreateCustomer}
              />
              { listPosition &&  <CustomSkeleton
                label={'Chọn chức vụ'}
                name="positionId"
                layoutCol={layoutCol}
                labelCol={labelCol}
                options={convertDataSelect(listPosition)}
                type={CONSTANTS.SELECT}
                rules={[RULES.REQUIRED]}
                form={formCreateCustomer}
              />
              }
              <CustomSkeleton
                label={t('Chiết khấu theo chức vụ (%)')}
                name="customerDiscount"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                rules={[RULES.REQUIRED]}
                form={formCreateCustomer}
                disabled={true}
              />
              <CustomSkeleton
                label={t('Số tài khoản ngân hàng')}
                name="customerBankAccountNumber"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                // rules={[RULES.REQUIRED, RULES.NUMBER]}
                form={formCreateCustomer}
              />
              <CustomSkeleton
                label={t('Thông tin tài khoản')}
                name="customerBankAccountInfo"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                // rules={[RULES.REQUIRED]}
                form={formCreateCustomer}
              />

              <CustomSkeleton
                label={t('Mã số thuế')}
                name="customerTaxCode"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                form={formCreateCustomer}
              />
              <CustomSkeleton
                label={t('Ghi chú')}
                name="customerNote"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                form={formCreateCustomer}
              />
            </Row>
            <Row gutter={24}>
              <Button size="default" type="primary" htmlType="submit" className="btn">
                Lưu
              </Button>
            </Row>
          </Form>
        </div>
      )}

      <CustomBreadcrumb breadcrumbLabel={'DANH SÁCH HOÁ ĐƠN'}>
        <Link
          to={{
            pathname: '/salebills/add',
            state: { id: id },
          }}
        >
          {' '}
          <Button type="primary" icon={<i className="fa fa-plus mr-1"/>}>
            {t('TAO_MOI')}
          </Button>
        </Link>
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
          columns={columnsSalebills}
          dataSource={salebills}
          pagination={paginationConfig(handleChangePagination, salebills)}
          scroll={{ x: 1200 }}
          summary={(pageData) => {
            let totalRepayment = 0;
            let totalLoiNhuan = 0;
            pageData.forEach(({ saleTotalPayableADiscount, saleProfitMoney }) => {
              totalRepayment += parseInt(saleTotalPayableADiscount);
              totalLoiNhuan += parseInt(saleProfitMoney);
            });
            return (<Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell align={'center'} index={0} colSpan={2}> </Table.Summary.Cell>
                  <Table.Summary.Cell align={'left'} index={1}>
                    <b>- Tổng tiền đơn hàng (Sau CK):</b> <center><Title level={4}> {formatNumber(totalRepayment)} VND </Title> </center>
                    <b>- Tổng tiền lợi nhuận:</b>  <center><Title level={4} type={'success'}> {totalLoiNhuan ? formatNumber(totalLoiNhuan) + " VND" : ""}  </Title> </center>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}></Table.Summary.Cell>
                  <Table.Summary.Cell index={4}> </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}> </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />;
      </Loading>
      <div className="site-layout-background"></div>
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps, null)(CustomerDetail);
