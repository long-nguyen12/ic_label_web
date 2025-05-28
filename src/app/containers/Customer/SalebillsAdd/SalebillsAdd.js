import { Button, Col, Row, Form, Table, message, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { getAllProductNoQuery } from '../../../services/Product';
import CustomSkeleton from '@components/CustomSkeleton';
import CustomBreadcrumb from '@components/CustomBreadcrumb';
import { toast, convertCamelCaseToSnakeCase } from '@app/common/functionCommons';
import { CONSTANTS, RULES } from '@constants';
import { useTranslation } from 'react-i18next';
import CreateProductOfBill from './CreateProductOfBill';
import './/SalebillsAdd.scss';
import { getCustomerById } from '../../../services/Customer';
import Loading from '@components/Loading';
import { getAllSalebillsByUserID, createSalebills } from '../../../services/Salebills';
import axios from 'axios';
import { formatNumber } from '../../../../utils';
import { getAllPositionNoQuery } from '../../../services/Position';
import moment from 'moment';

const { Text } = Typography;
const today     =  moment().format('DD-MM-YYYY');
const todayHour     =  moment().format('hhmmDDMMYYYY');
const CurrentDate = moment();

const layoutCol = { xs: 24, md: 8, xl: 8 };
const labelCol = { xs: 24 };
const layoutCol2 = { xs: 12, md: 12, xl: 12 };

function SalebillsAdd({ myInfo, props }) {
  let history = useHistory();
  // let { id } = useParams();
  const { t } = useTranslation();
  const { state } = useLocation();
  let id = state.id;

  const [formcustomers] = Form.useForm();
  const [listPosition, setlistPosition] = useState([])
  const [typeAction, setTypeAction] = useState('ADD');
  const [formCreateSalebills] = Form.useForm();
  const [customerDetail, setCustomerDetail] = useState(null);
  const [salebills, setSalebills] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [totalMoney, settotalMoney] = useState(0);
  const [listProduct, setListProduct] = useState([]);
  const [dataTablePrductOfBill, setDataTablePrductOfBill] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stateCreateProductOfBill, setStateCreateProductOfbill] = useState({
    isShowModal: false,
    createProductOfBillSelected: null,
  });
  const [timeCurrent , setTimeCurrent] = useState(moment().unix());

  const [reload, setReload] = useState(false);

  const columns = [
    // {
    //   title: 'STT',
    //   dataIndex: 'id',
    //   key: 'id',
    //   align: 'center',
    // },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      align: 'center',
      render: (_, row) => {
        let name = '';
        listProduct.forEach(data => {
          if (row.productId === data?._id) {
            name = data.productName;
          }
        });
        return <>
          {name}
        </>;
      },
    },
    {
      title: 'ĐVT',
      dataIndex: 'productUnit',
      align: 'center',
      width: 100,
    },
    {
      title: 'SL',
      dataIndex: 'productNumber',
      align: 'center',
      width: 50,
      render: (_, value) => {
        return <>
          {_}
        </>;
      },
    },
    {
      title: 'Đơn Giá',
      dataIndex: 'productPrice',
      align: 'center',
      render: (value) => {
        return <> {formatNumber(value)}</>;
      },
    },
    {
      title: 'Thành tiền (VND)',
      dataIndex: 'totalMoney',
      align: 'center',
      render: (value) => {
        return <> {formatNumber(value)}</>;
      },
    },
    {
      title: 'Chiết khấu (%)',
      dataIndex: 'productDiscount',
      align: 'center',
    },
    {
      title: 'Thành tiền sau chiết khấu (VND)',
      dataIndex: 'totalMoneyAfterDiscount',
      align: 'center',
      render: (value) => {
        return <> {formatNumber(value)}</>;
      },
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: '15%',
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        return <>
          <Button
            className="mr-2"
            type="primary"
            ghost
            icon={<i className="fa fa-edit mr-1"/>}
            onClick={() => editData(record)}
          >
            Sửa
          </Button>

          <Button
            className="mr-2"
            type="primary"
            danger
            icon={<i className="fa fa-delete mr-1"/>}
            onClick={() => deleteData(record)}
          >
            Xoá
          </Button>
        </>;

      },
    },
  ];

  const isMyCustomer = customerDetail?.userId?._id === myInfo?._id;

  useEffect(() => {
    getData();
    setTimeCurrent(moment().unix());

  }, []);

  async function getData() {
    let query;
    const apiRequestAll = [
      getCustomerById(id),
      getAllSalebillsByUserID(1, 0, id),
      getAllProductNoQuery(1, 0),
      getAllPositionNoQuery()
    ];
    setLoading(true);
    await axios.all(apiRequestAll)
      .then(axios.spread(function(customerRes, salebillsRes, listProduct,listPosition) {
        if (customerRes) {
          formcustomers.setFieldsValue({
            customerFullName: customerRes.customerFullName,
            customerMobi: customerRes.customerMobi,
            customerEmail: customerRes.customerEmail,
            customerAdd: customerRes.customerAdd,
            customerBankAccountNumber: customerRes.customerBankAccountNumber,
            customerTaxCode: customerRes.customerTaxCode,
            customerBankAccountInfo: customerRes.customerBankAccountInfo,
            customerNote: customerRes.customerNote,
            customerDiscount: customerRes.customerDiscount,
            positionId: customerRes.positionId?._id,
          });
          formCreateSalebills.setFieldsValue({
            // chỉ lấy ra 4 giá trị cuối của timestamp
            saleId: "HD_" + `${timeCurrent.toString().substring(6, 10)}`,
            saleName: "Hoá đơn " + `${customerRes.customerFullName}` + ` ${today}`,
            saleDate: CurrentDate
          })
          setCustomerDetail(customerRes);
          setCustomerId(customerRes?._id);
        }
        if (salebillsRes) {
          setSalebills(salebillsRes);
        }
        if (listProduct) {
          setListProduct(listProduct.docs);
        }
        if (listPosition) {
          setlistPosition(listPosition.docs);
        }
      }));
    setLoading(false);
  }

  async function handleCreateSalebills(data) {
    data.userIdManager = myInfo?._id;
    data.customerId = customerId;
    // Lưu tại chiết khấu của chức vụ vào salebill
    data.salePositionDiscount = customerDetail.customerDiscount;
    data.salePositionId = customerDetail.positionId?._id;
    data.userDiscount = myInfo.userDiscount;


    data.saleBillsDetail = dataTablePrductOfBill;
    const api = await createSalebills(convertCamelCaseToSnakeCase(data));
    if (api) {
      toast(CONSTANTS.SUCCESS, 'Thêm mới dữ liệu thành công!');
      history.push({
        pathname: `/salebills/${api?._id}`,
        // search: '?query=abc',
        state: { customerId: customerId, id: api?._id },
      });
      setReload(true)
    }
  }

  async function editData(record) {
    setTypeAction('EDIT');
    setStateCreateProductOfbill({ isShowModal: true, createProductOfBillSelected: record });
  }

  function convertDataSelect(list) {
    let arrConvert = []
    list.map(data => {
      let objConvert = {}
      objConvert.label = data.positionName;
      objConvert.value = data?._id;
      arrConvert.push(objConvert)
    })
    return arrConvert
  }


    async function deleteData(record) {
    let dataTemp = [];
    let sumMoney = 0;
    dataTemp = dataTablePrductOfBill.filter(data => {
      return data?._id !== record?._id;
    });
    message.success('Xoá sản phẩm thành công!');
    dataTemp.forEach(data => {
      sumMoney += parseInt(data.totalMoneyAfterDiscount);
    });
    setStateCreateProductOfbill({ isShowModal: false, createProductOfBillSelected: null });
    settotalMoney(sumMoney);
    formCreateSalebills.setFieldsValue({
      saleTotalPayableADiscount: sumMoney,
      saleTotalPayableAll: sumMoney,
      saleDiscount: 0,
      saleBillsPaid: 0,
      saleBillsDebt: sumMoney,
    });
    setDataTablePrductOfBill(dataTemp);
  }

  async function handleCreateProductOfBill(dataForm) {
    let dataTemp = [];
    let sumMoney = 0;

    if (typeAction === 'EDIT') {
      dataTablePrductOfBill.forEach((item) => {
        if (item?._id === dataForm?._id) {
          item.productId = dataForm.productId,
            item.productName = dataForm.productName,
            item.productPrice = dataForm.productPrice,
            item.productUnit = dataForm.productUnit,
            item.productNumber = dataForm.productNumber,
            item.totalMoney = dataForm.totalMoney,
            item.productDiscount = dataForm.productDiscount,
            item.totalMoneyAfterDiscount = dataForm.totalMoneyAfterDiscount;
          return;
        }
        setDataTablePrductOfBill([...dataTablePrductOfBill]);
      });
      dataTemp = [...dataTablePrductOfBill];
      message.success('Sửa sản phẩm thành công!');
    } else {
      setDataTablePrductOfBill([dataForm, ...dataTablePrductOfBill]);
      dataTemp = [dataForm, ...dataTablePrductOfBill];
      message.success('Đã tạo sản phẩm mới thành công!');
    }
    dataTemp.forEach(data => {
      sumMoney += parseInt(data.totalMoneyAfterDiscount);
    });
    setStateCreateProductOfbill({ isShowModal: false, createProductOfBillSelected: null });
    settotalMoney(sumMoney);
    formCreateSalebills.setFieldsValue({
      saleTotalPayableADiscount: sumMoney,
      saleTotalPayableAll: sumMoney,
      saleDiscount: 0,
      saleBillsPaid: 0,
      saleBillsDebt: sumMoney,
    });

  }

  function onChangeForm(fieldSelected, dataSelected) {
    let moneyDiscount = parseInt(dataSelected.saleTotalPayableAll) * parseInt(dataSelected.saleDiscount) / 100;
    let totalMoneyAfterDiscount = parseInt(dataSelected.saleTotalPayableAll) - moneyDiscount;
    if (fieldSelected['saleDiscount'] >= 0) {
      formCreateSalebills.setFieldsValue({
        saleTotalPayableADiscount: totalMoneyAfterDiscount,
        saleBillsDebt: parseInt(totalMoneyAfterDiscount) - parseInt(dataSelected.saleBillsPaid),
      });
    }
    if (fieldSelected['saleBillsPaid'] >= 0) {
      formCreateSalebills.setFieldsValue({
        saleBillsDebt: parseInt(totalMoneyAfterDiscount) - parseInt(dataSelected.saleBillsPaid),
      });
    }
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
      </CustomBreadcrumb>

      {customerDetail && (
        <div className="site-layout-background">
          <Form id="formcustomers" form={formcustomers}>
            <Row gutter={15}>
              <CustomSkeleton
                label={t('Tên khách hàng')}
                name="customerFullName"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                form={formcustomers}
                disabled={true}
              />
              <CustomSkeleton
                label={t('Điện thoại')}
                name="customerMobi"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                form={formcustomers}
                disabled={true}
              />
              <CustomSkeleton
                label={t('Email')}
                name="customerEmail"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                form={formcustomers}
                disabled={true}
              />
            </Row>
            <Row gutter={15}>
              <CustomSkeleton
                label={t('Địa chỉ')}
                name="customerAdd"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                form={formcustomers}
                disabled={true}
              />
              <CustomSkeleton
                label={t('Tài khoản ngân hàng')}
                name="customerBankAccountNumber"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                form={formcustomers}
                disabled={true}
              />
              <CustomSkeleton
                label={t('Mã số thuế')}
                name="customerTaxCode"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                form={formcustomers}
                disabled={true}
              />
              { listPosition &&  <CustomSkeleton
                label={'Chọn chức vụ'}
                name="positionId"
                layoutCol={layoutCol}
                labelCol={labelCol}
                options={convertDataSelect(listPosition)}
                type={CONSTANTS.SELECT}
                rules={[RULES.REQUIRED]}
                form={formcustomers}
                disabled={true}
              />
              }
              <CustomSkeleton
                label={t('Chiết khấu theo chức vụ(%)')}
                name="customerDiscount"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                form={formcustomers}
                disabled={true}
              />
              <CustomSkeleton
                label={t('Ghi chú')}
                name="customerNote"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                form={formcustomers}
                disabled={true}
              />
            </Row>

          </Form>
        </div>
      )}

      <CustomBreadcrumb breadcrumbLabel={'THÊM MỚI HOÁ ĐƠN'}> </CustomBreadcrumb>
      <Loading active={loading} layoutBackground>
        <Form id="formCreateSalebills"
              onValuesChange={(fieldSelected, dataSelected) => onChangeForm(fieldSelected, dataSelected)}
              form={formCreateSalebills} onFinish={handleCreateSalebills}>
          <Row gutter={15}>
            <CustomSkeleton
              label={'Mã hoá đơn'}
              name="saleId"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formCreateSalebills}
            />
            <CustomSkeleton
              label={' Tên hoá đơn'}
              name="saleName"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              rules={[RULES.REQUIRED]}
              form={formCreateSalebills}
            />
            <CustomSkeleton
              label={'Ngày xuất'}
              name="saleDate"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.DATE}
              rules={[RULES.REQUIRED]}
              form={formCreateSalebills}
            />
          </Row>
          <Row gutter={24}>
            <br/>
            <Col md={6}>
              <CustomSkeleton
                label={'Danh sách sản phẩm '}
              />
            </Col>
            <Col md={6}>
              <Button
                className="mr-5"
                type="primary"
                size={'small'}
                icon={<i className="fa fa-plus mr-1"/>}
                onClick={() => {
                  setTypeAction('ADD');
                  setStateCreateProductOfbill({ isShowModal: true });
                }}>
                Thêm
              </Button>
            </Col>

            <br/>
            <Col md={24}>
              <Table rowKey="_id" bordered dataSource={dataTablePrductOfBill} columns={columns} pagination={false}
                     scroll={{ x: 1200 }}
                     summary={(pageData) => {
                       let totalRepayment = 0;
                       let totalAllMoney = 0;

                       pageData.forEach(({ totalMoneyAfterDiscount, totalMoney }) => {
                         totalRepayment += parseInt(totalMoneyAfterDiscount);
                         totalAllMoney += parseInt(totalMoney);
                       });
                       return (<Table.Summary fixed>
                           <Table.Summary.Row>
                             <Table.Summary.Cell align={'center'} index={0} colSpan={4}> <b>Tổng
                               tiền:</b></Table.Summary.Cell>
                             <Table.Summary.Cell align={'center'} index={4}> <Text type="danger">
                               <b> {formatNumber(totalAllMoney)} VND </b></Text></Table.Summary.Cell>
                             <Table.Summary.Cell index={6}> </Table.Summary.Cell>
                             <Table.Summary.Cell align={'center'} index={7}> <Text type="danger">
                               <b> {formatNumber(totalRepayment)} VND </b></Text></Table.Summary.Cell>
                             <Table.Summary.Cell index={8}> </Table.Summary.Cell>
                           </Table.Summary.Row>
                         </Table.Summary>
                       );
                     }}
              />
            </Col>

          </Row>
          <br/>
          <Row gutter={15}>
            {/*Tổng tiền sản phẩm*/}
            <CustomSkeleton
              label={''}
              name="saleTotalPayableAll"
              layoutCol={layoutCol2}
              labelCol={labelCol}
              type={CONSTANTS.NUMBER}
              type={"hiden"}
              form={formCreateSalebills}
              disabled={true}
              suffix="VND"
              formatter={value => formatNumber(value)}
            />
            {/*Chiết khấu thêm cho đơn hàng*/}
            <CustomSkeleton
              label={''}
              name="saleDiscount"
              layoutCol={layoutCol2}
              labelCol={labelCol}
              type={CONSTANTS.NUMBER}
              form={formCreateSalebills}
              defaultValue={0}
              min={0}
              max={100}
              type={"hiden"}
              disabled={true}
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
            />

            <CustomSkeleton
              label={'Tổng tiền đơn hàng'}
              name="saleTotalPayableADiscount"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.NUMBER}
              form={formCreateSalebills}
              disabled={true}
              suffix="VND"
              formatter={value => formatNumber(value)}
            />

            <CustomSkeleton
              label={'Tổng tiền khách hàng đã thanh toán'}
              name="saleBillsPaid"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.NUMBER}
              form={formCreateSalebills}
              min={0}
              disabled={false}
              suffix="VND"
              formatter={value => formatNumber(value)}
            />

            <CustomSkeleton
              label={'Tổng tiền khách hàng còn nợ lại'}
              name="saleBillsDebt"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.NUMBER}
              form={formCreateSalebills}
              disabled={true}
              suffix="VND"
              formatter={value => formatNumber(value)}
            />

            <CustomSkeleton
              label={'Ghi chú'}
              name="saleRemark"
              layoutCol={layoutCol}
              labelCol={labelCol}
              type={CONSTANTS.TEXT}
              form={formCreateSalebills}
            />
          </Row>
          <Text type={"warning"}> Xin vui  lòng lưu dữ liệu để xem lợi nhuận đơn hàng </Text>
          <Row gutter={24}>
            <Button
              size="default"
              type="primary"
              htmlType="submit"
              className="btn"
            >
              Lưu dữ liệu
            </Button>
          </Row>
        </Form>

      </Loading>
      <CreateProductOfBill
        typeAction={typeAction}
        listProduct={listProduct}
        isModalVisible={stateCreateProductOfBill.isShowModal}
        handleOk={handleCreateProductOfBill}
        handleCancel={() => setStateCreateProductOfbill({ isShowModal: false, createProductOfBillSelected: null })}
        createProductOfBillSelected={stateCreateProductOfBill.createProductOfBillSelected}
        customerDetail={customerDetail}
      />
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps, null)(SalebillsAdd);
