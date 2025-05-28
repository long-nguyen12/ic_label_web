import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { NavLink, useHistory } from 'react-router-dom';
import { Button, message, Row, Table, Tag, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

import CustomBreadcrumb from '@components/CustomBreadcrumb';
import Loading from '@components/Loading';
import { createSalebills } from '@app/services/Salebills';
import Filter from '@components/Filter';
import { formatNumber } from '../../../utils';

import {
  convertQueryToObject,
  formatDateTime,
  handleReplaceUrlSearch,
  paginationConfig,
} from '@app/common/functionCommons';
import CreateSalebills from '@containers/Salebills/CreateSalebills';
import { useTranslation } from 'react-i18next';
import { CONSTANTS } from '@constants';
import { uploadImages } from '../../services/File';
import moment from 'moment';

const { Text, Title } = Typography;
import { getAllSalebillsByUserID as getAllSalebills } from '@app/services/Report';

function Salebills({ myInfo }) {
  let history = useHistory();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [salebills, setSalebillss] = useState({
    dataRes: [],
    currentPage: 1,
    pageSize: 10,
    totalDocs: 0,
    query: {},
  });

  const [stateCreateSalebills, setStateCreateSalebills] = useState({
    isShowModal: false,
    createSalebillsSelected: null,
  });

  let dataSearch = [
    { name: 'tungay', label: 'Từ ngày', type: CONSTANTS.DATE },
    { name: 'denngay', label: 'Đến ngày', type: CONSTANTS.DATE },
  ];
  useEffect(() => {
    (async () => {
      const { page, limit, ...queryObj } = convertQueryToObject(history.location.search);
      await getSalebills(page, limit, queryObj);
    })();
  }, []);

  function handleShowModalCreateSalebills(isShowModal, createSalebillsSelected = null) {
    if (isShowModal) {
      setStateCreateSalebills({ isShowModal, createSalebillsSelected });
    } else {
      setStateCreateSalebills({ ...stateCreateSalebills, createSalebillsSelected });
    }
  }

  async function getSalebills(page = salebills.currentPage, limit = salebills.pageSize, query = salebills.query) {
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    handleReplaceUrlSearch(history, page, limit, query);
    setLoading(true);
    const apiResponse = await getAllSalebills(page, limit, query);
    if (apiResponse) {
      setSalebillss({
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
    await getSalebills(current, pageSize);
  }

  async function handleFilter(query) {
    if (query.tungay && query.tungay[0]) {
      let from = (query.tungay && query.tungay[0]) ? query.tungay[0] : '';
      let to = (query.denngay && query.denngay[0]) ? query.denngay[0] : '';
      query.timeStart = moment(from).format('DD-MM-yyyy');
      query.timeEnd = moment(to).format('DD-MM-yyyy');
      delete query.tungay;
      delete query.denngay;
    }
    await getSalebills(1, salebills.pageSize, query);
  }

  async function handleCreateSalebills(dataForm) {
    let data = {
      user_id: myInfo._id,
      customer_full_name: dataForm.customer_full_name,
      customer_mobi: dataForm.customer_mobi,
      customer_email: dataForm.customer_email,
      customer_add: dataForm.customer_add,
      customer_bank_account_number: dataForm.customer_bank_account_number,
      customer_tax_code: dataForm.customer_tax_code,
    };

    const apiResponse = await createSalebills(data);
    if (apiResponse) {
      setStateCreateSalebills({ isShowModal: false, createSalebillsSelected: null });
      message.success('Đã tạo sản phẩm mới thành công!');
      await getSalebills();
    } else {
      message.error(apiResponse.message);
    }
  }

  const columnsSalebills = [
    {
      title: <div style={{ textTransform: 'capitalize' }}>{'Thông tin hoá đơn'}</div>,
      width: '10%',
      align: 'center',
      dataIndex: 'saleId',
      render: (_, record) => {
        return <>
          <div align={'left'}>- Mã hoá đơn: {record?.saleId}</div>
          <br/>
          <div align={'left'}>- Ngày xuất: {formatDateTime(record?.saleDate ? record?.saleDate : null)}</div>
        </>;
      },
    },
    {
      title: <div style={{ textTransform: 'capitalize' }}>{'Thông tin khách hàng'}</div>,
      dataIndex: 'customerId',
      width: '10%',
      align: 'center',

      render: (_, record) => {
        return <>
          <div align={'left'}>- Họ tên: {record.customerId?.customerFullName}</div>
          <div align={'left'}>- Điện thoại: {record.customerId?.customerMobi}</div>
          <div align={'left'}>- Chức vụ: {record.customerId?.positionId?.positionName}</div>
          <div align={'left'}>- Chiết khấu: {record.customerId?.positionId?.positionDiscount + "%"}</div>
        </>;
      },
    },
    {
      title: <div style={{ textTransform: 'capitalize' }}>{t('Tiền đơn hàng')}</div>,
      align: 'center',
      dataIndex: 'saleBillsPaid',
      width: '13%',
      render: (value, row) => {
        let saleBillsDebt = row.saleBillsDebt ? row.saleBillsDebt : 0;
        return <>
          <div align={'left'}><Text>
            - Tiền đơn hàng: <b>{row.saleTotalPayableADiscount ? formatNumber(row.saleTotalPayableADiscount) + ' VND' : 0 + ' VND'}</b>
          </Text>
          </div>
          <div align={'left'}><Text>

              - Lợi nhuận:<b> <Text
              type={'success'}> {formatNumber(row.saleProfitMoney) + ' VND'} </Text>
            </b>
          </Text>
          </div>
        </>;
      },
    },
    {
      title: <div style={{ textTransform: 'capitalize' }}>{'Thông tin thanh toán'}</div>,
      width: '12%',
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
      width: '10%',
      dataIndex: 'saleName',
      align: "center",
      render: value => {
        return <div align="left">{value}</div>;
      }
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
              aboutProps: {
                id: record._id,
                name: record.customerName,
              },
              state: { customerId: record.customerId._id },
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

  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={'Danh sách hoá đơn'}>

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
          dataSource={salebills.dataRes}
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
                    <b>- Tổng tiền lợi nhuận:</b>  <center><Title level={4} type={'success'}> {formatNumber(totalLoiNhuan)} VND </Title> </center>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}></Table.Summary.Cell>
                  <Table.Summary.Cell index={4}> </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}> </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Loading>

      <CreateSalebills
        isModalVisible={stateCreateSalebills.isShowModal}
        handleOk={handleCreateSalebills}
        handleCancel={() => setStateCreateSalebills({ isShowModal: false, createSalebillsSelected: null })}
        createSalebillsSelected={stateCreateSalebills.createSalebillsSelected}
      />
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps)(Salebills);
