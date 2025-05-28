import { Button, Col, Typography, Row, Form, Table, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import { getAllProductNoQuery } from '../../../services/Product';
import { getAllSalebillsdetail } from '../../../services/SalebillsDetail/index';
import { formatNumber } from '../../../../utils';
import UploadImg from '@components/Upload/UploadImg';
import CustomSkeleton from '@components/CustomSkeleton';
import CustomBreadcrumb from '@components/CustomBreadcrumb';
import { toast, convertCamelCaseToSnakeCase } from '@app/common/functionCommons';
import { CONSTANTS, RULES } from '@constants';
import { useTranslation } from 'react-i18next';
import EditProductOfBill from '../SalebillsDetail/EditProductOfBill';
import './SalebillsDetail.scss';
import { getCustomerById } from '../../../services/Customer';
import Loading from '@components/Loading';
import { getSalebillsById, updateSalebills, deleteSalebills } from '../../../services/Salebills';
import axios from 'axios';
import { uploadImages } from '@app/services/File';
import moment from 'moment';
import { convertUrlToImagesList, getfileDetail } from '@components/Upload/imageUtil';
import { generateDocument } from '@containers/Files/File';
import { getAllPositionNoQuery } from '@app/services/Position';

const { Text } = Typography;

const layoutCol = { xs: 24, md: 8, xl: 8 };
const layoutCol2 = { xs: 12, md: 12, xl: 12 };
const labelCol = { xs: 24 };

function SalebillsAdd({ myInfo, props }) {
  let history = useHistory();
  let { id } = useParams();
  const { t } = useTranslation();
  const { state } = useLocation();
  const [customerId, setCustomerId] = useState(state.customerId);
  const [listPosition, setlistPosition] = useState([])
  const [imgsUpload, setImgsUpload] = useState([]);
  const [formcustomers] = Form.useForm();
  const [typeAction, setTypeAction] = useState('ADD');
  const [formCreateSalebills] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [salebills, setSalebills] = useState(null);
  const [totalMoney, settotalMoney] = useState(0);
  const [listProduct, setListProduct] = useState([]);
  const [dataTablePrductOfBill, setDataTablePrductOfBill] = useState([]);
  const [listsalebillsdetail, setListsalebillsdetail] = useState([]);
  const [listsalebillsdetailDelete, setListsalebillsdetailDelete] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkOnchaneForm, setCheckOnchaneForm] = useState(false);
  const [stateCreateProductOfBill, setStateCreateProductOfbill] = useState({
    isShowModal: false,
    createProductOfBillSelected: null,
  });
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
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  const columns = [
    // {
    //   title: 'STT',
    //   dataIndex: 'id',
    //   key: 'id',
    //   align: 'center',
    // },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productId',
      align: 'left',
      render: (_, row) => {
        let name = '';
        if (row.productId?.productName) {
          name = row.productId.productName;
        } else {
          listProduct.forEach(data => {
            if (row.productId === data._id) {
              name = data.productName;
            }
          });
        }
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
      title: 'Thành tiền',
      dataIndex: 'totalMoney',
      align: 'center',
      render: (value) => {
        return <>
          {formatNumber(value)}
        </>;
      },
    },
    {
      title: 'Chiết Khấu',
      dataIndex: 'productDiscount',
      align: 'center',
      width: 80,
      render: (value) => {
        return <> {value + '%'}</>;
      },
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
      fixed: 'right',
      // width: "10%",
      align: 'center',
      render: (_, record) => {
        return <>
          <Button
            className="mr-2"
            type="primary"
            ghost
            icon={<i className="fa fa-edit"/>}
            onClick={() => editData(record)}
          >
          </Button>

          <Button
            className="mr-2"
            type="primary"
            danger
            icon={<i className="fa fa-trash"/>}
            onClick={() => deleteData(record)}
          >
          </Button>
        </>;

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
  }, [customerId]);

  async function getData() {
    let query = { salebills_id: `${id}` };
    const apiRequestAll = [
      getCustomerById(customerId),
      getSalebillsById(id),
      getAllProductNoQuery(1, 0),
      getAllSalebillsdetail(1, 0, query),
      getAllPositionNoQuery()
    ];
    setLoading(true);
    await axios.all(apiRequestAll)
      .then(axios.spread(function(customerRes, salebillsRes, listProduct, salebillsdetailRes, listPosition ) {
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
            saleId: salebillsRes.saleId,
            saleName: salebillsRes.saleName,
            saleDate: moment(salebillsRes.saleDate),
            saleTotalPayableAll: salebillsRes.saleTotalPayableAll,
            saleDiscount: salebillsRes.saleDiscount,
            saleTotalPayableADiscount: salebillsRes.saleTotalPayableADiscount,
            saleBillsPaid: salebillsRes.saleBillsPaid,
            saleBillsDebt: salebillsRes.saleBillsDebt,
            saleImageBills: salebillsRes.saleImageBills,
          });
          setCustomerDetail(customerRes);
          setCustomerId(customerRes._id);
          setImgsUpload(convertUrlToImagesList(salebillsRes?.saleImageBills));
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
        if (salebillsdetailRes) {
          let arrSalebillsdetail = [];
          salebillsdetailRes.docs.forEach(item => {
            item.productName = item.productId.productName;
            item.productId = item.productId._id;
            arrSalebillsdetail.push(item);
          });
          setListsalebillsdetail(arrSalebillsdetail);
          setDataTablePrductOfBill(salebillsdetailRes.docs);
        }
      }));
    setLoading(false);
  }


  const isMobile = width <= 768;

  async function handleUpdateSalebills(data) {
    data.userIdManager = myInfo._id;
    data.userDiscount = myInfo.userDiscount;
    data.customerId = customerId;
    data.saleBillsDetail = dataTablePrductOfBill;
    data.saleBillsDetailDelete = listsalebillsdetailDelete;
    //data.salePositionDiscount = salebills.salePositionDiscount ? salebills.salePositionDiscount : customerDetail.customerDiscount;
    data.salePositionDiscount = customerDetail.customerDiscount;
    data.salePositionId = salebills.salePositionId ?  salebills.salePositionId : customerDetail.positionId?._id;

    let [originImageNm, imageUpload] = getfileDetail(imgsUpload);
    if (imageUpload.length) {
      let images = await uploadImages(imageUpload);
      if (images && images.length) {
        originImageNm = [...originImageNm, ...images];
      }
    }
    data.saleImageBills = originImageNm;

    const api = await updateSalebills(id, convertCamelCaseToSnakeCase(data));
    if (api) {
      await getData();
      setListsalebillsdetailDelete([]);
      setCheckOnchaneForm(false)
      toast(CONSTANTS.SUCCESS, 'Cập nhật dữ liệu thành công!');
    }
  }

  function handleImage(value) {
    setImgsUpload(value);
  }

  async function editData(record) {
    setTypeAction('EDIT');
    setStateCreateProductOfbill({ isShowModal: true, createProductOfBillSelected: record });
  }

  async function deleteData(record) {
    let dataTemp = [];
    let dataDelete = [record, ...listsalebillsdetailDelete];
    let sumMoney = 0;
    dataTemp = dataTablePrductOfBill.filter(data => {
      return data._id !== record._id;
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
    setListsalebillsdetailDelete(dataDelete);
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

  async function handleCreateProductOfBill(dataForm) {
    setCheckOnchaneForm(true)
    let sumMoney = 0;
    let dataTemp = [];
    if (typeAction === 'EDIT') {
      dataTablePrductOfBill.forEach((item) => {
        if (item._id === dataForm._id) {
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
      dataForm._id = 'ADD_' + dataForm._id;
      dataForm.salebills_id = id;
      let dataAdd = true;
      if (dataAdd) {
        setDataTablePrductOfBill([dataForm, ...dataTablePrductOfBill]);
        dataTemp = [dataForm, ...dataTablePrductOfBill];
        message.success('Đã tạo sản phẩm mới thành công!');
      }
    }
    dataTemp.forEach(item => {
      sumMoney += parseInt(item.totalMoneyAfterDiscount);
    });
    setStateCreateProductOfbill({ isShowModal: false, createProductOfBillSelected: null });
    settotalMoney(sumMoney);
    formCreateSalebills.setFieldsValue({
      saleTotalPayableADiscount: sumMoney,
      saleTotalPayableAll: sumMoney,
      saleDiscount: 0,
      saleBillsDebt: sumMoney - salebills.saleBillsPaid,
    });
  }

  function onChangeForm(fieldSelected, dataSelected) {
    if (fieldSelected['saleDiscount'] >= 0) {
      let moneyDiscount = parseInt(dataSelected.saleTotalPayableAll) * parseInt(dataSelected.saleDiscount) / 100;
      let totalMoneyAfterDiscount = parseInt(dataSelected.saleTotalPayableAll) - moneyDiscount;
      formCreateSalebills.setFieldsValue({
        saleTotalPayableADiscount: parseInt(dataSelected.saleTotalPayableAll) - moneyDiscount,
        saleBillsDebt: parseInt(totalMoneyAfterDiscount) - parseInt(dataSelected.saleBillsPaid),
      });
    }
    if (fieldSelected['saleBillsPaid'] >= 0) {
      let moneyDiscount = parseInt(dataSelected.saleTotalPayableAll) * parseInt(dataSelected.saleDiscount) / 100;
      let totalMoneyAfterDiscount = parseInt(dataSelected.saleTotalPayableAll) - moneyDiscount;
      formCreateSalebills.setFieldsValue({
        saleBillsDebt: parseInt(totalMoneyAfterDiscount) - parseInt(dataSelected.saleBillsPaid),
      });
    }
  }

  async function downloadSaleBills() {
    let data = {
      listProduct: listProduct,
      userManager: myInfo,
      customer: customerDetail,
      saleBills: salebills,
      saleBillsDetail: listsalebillsdetail,
    };
    let type_fiLe = 'Hoa_don_ban_hang';
    if (data) {
      generateDocument(data, type_fiLe);
      await getData();
    }

  };


  async function deleteSaleBills() {
    let api = await deleteSalebills(id)
    if(api){
      message.success('Đã xoá hoá đơn thành công!');
      history.push({
        pathname: `/customer/${customerId}`,
        state: {id: customerId },
      });
    }
  };

  return (
    <> {isMobile ? (
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
            <Button
              className="mr-2"
              type="primary"
              ghost
              icon={<i className="fa fa-download mr-1"/>}
              onClick={() => downloadSaleBills()}
            >
              {'TẢI PHIẾU'}
            </Button>
          </Row>
        </Col>)
      : (<CustomBreadcrumb breadcrumbLabel={'CHI TIẾT KHÁCH HÀNG'}>
        <Button
          className="mr-2"
          type="primary"
          ghost
          icon={<i className="fa fa-arrow-left mr-1"/>}
          onClick={() => history.goBack()}
        >
          {t('QUAY_LAI')}
        </Button>
        <Button
          className="mr-2"
          type="primary"
          ghost
          icon={<i className="fa fa-download mr-1"/>}
          onClick={() => downloadSaleBills()}
        >
          {'TẢI PHIẾU'}
        </Button>
      </CustomBreadcrumb>)
    }
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
                label={t('Chiết khấu (%)')}
                name="customerDiscount"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                form={formcustomers}
                disabled={true}
              />
              <CustomSkeleton
                label={'Ghi chú'}
                name="saleRemark"
                layoutCol={layoutCol}
                labelCol={labelCol}
                type={CONSTANTS.TEXT}
                form={formCreateSalebills}
                disabled={true}
              />
            </Row>

          </Form>
        </div>
      )}

      <Col>
        <CustomBreadcrumb breadcrumbLabel={'Chỉnh sửa hoá đơn'}>
        <Button
          className="mr-2"
          type="danger"
          ghost
          icon={<i className="fa fa-trash mr-1"/>}
          onClick={() => deleteSaleBills()}
        >
          {'Xoá hoá đơn'}
        </Button>
      </CustomBreadcrumb>

      </Col>
      <Loading active={loading} layoutBackground>
        <Form id="formCreateSalebills"
              onValuesChange={(fieldSelected, dataSelected) => onChangeForm(fieldSelected, dataSelected)}
              form={formCreateSalebills} onFinish={handleUpdateSalebills}>
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
              // type={CONSTANTS.NUMBER}
              type={"hidden"}
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
              // type={CONSTANTS.NUMBER}
              form={formCreateSalebills}
              defaultValue={0}
              min={0}
              max={100}
              type={"hidden"}
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
            <CustomSkeleton
              label="Tải ảnh hoá đơn"
              name="productImage"
              layoutCol={layoutCol}
              labelCol={labelCol}
              // rules={[RULES.REQUIRED]}
            >
              <UploadImg fileListOrg={imgsUpload} onChange={(data) => handleImage(data)}>+ Thêm ảnh</UploadImg>
            </CustomSkeleton>
          </Row>
          <Row>

            {id &&  <div><b>Lợi nhuận trong đơn hàng</b>:
              <br/>
              { (salebills?.saleUserDiscount && !checkOnchaneForm) ? <>
                <div> { `Chiết khấu của chị Thư là: `  + ` ${salebills?.saleUserDiscount}` + "%"} </div>
                <div>{`Chiết khấu của ${customerDetail?.customerFullName} (${customerDetail?.positionId?.positionName}) là:` + ` ${salebills?.salePositionDiscount ? salebills?.salePositionDiscount : ""}` + "%"}</div>
                <div>{`% Lợi nhuận =  ${salebills?.saleProfitDiscount}` + " %"}</div>
                <div>{`Tiền Lợi nhuận = ${formatNumber(salebills?.saleProfitMoney ? salebills?.saleProfitMoney : 0)}` + " VND"}</div>

              </> : <Text type={"warning"}> Xin vui  lòng lưu dữ liệu để xem lợi nhuận đơn hàng </Text> }
            </div>

            }
          </Row>
          <br/>
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
      <EditProductOfBill
        typeAction={typeAction}
        listProduct={listProduct}
        isModalVisible={stateCreateProductOfBill.isShowModal}
        handleOk={handleCreateProductOfBill}
        handleCancel={() => {
          setStateCreateProductOfbill({ isShowModal: false, createProductOfBillSelected: null });
        }
      }
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
