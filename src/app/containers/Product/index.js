import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";
import { Button, message, Row, Table, Tag } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

import CustomBreadcrumb from "@components/CustomBreadcrumb";
import Loading from "@components/Loading";
import { createProduct, getAllProduct } from "@app/services/Product";
import Filter from "@components/Filter";

import {
  convertQueryToObject,
  formatDateTime,
  handleReplaceUrlSearch,
  paginationConfig,
} from "@app/common/functionCommons";
import CreateProduct from "@containers/Product/CreateProduct";
import { useTranslation } from "react-i18next";
import { CONSTANTS } from "@constants";
import { uploadImages } from "../../services/File";
import { formatNumber } from '@src/utils';

function Product({ myInfo }) {
  let history = useHistory();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState({
    dataRes: [],
    currentPage: 1,
    pageSize: 10,
    totalDocs: 0,
    query: {},
  });

  const [stateCreateProduct, setStateCreateProduct] = useState({
    isShowModal: false,
    createProductSelected: null,
  });

  let dataSearch = [{ name: "search", label: t("TEN_SAN_PHAM"), type: CONSTANTS.TEXT }];

  useEffect(() => {
    (async () => {
      const { page, limit, ...queryObj } = convertQueryToObject(history.location.search);
      await getProduct(page, limit, queryObj);
    })();
  }, []);

  function handleShowModalCreateProduct(isShowModal, createProductSelected = null) {
    if (isShowModal) {
      setStateCreateProduct({ isShowModal, createProductSelected });
    } else {
      setStateCreateProduct({ ...stateCreateProduct, createProductSelected });
    }
  }

  async function getProduct(page = products.currentPage, limit = products.pageSize, query = products.query) {
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    handleReplaceUrlSearch(history, page, limit, query);
    setLoading(true);
    const apiResponse = await getAllProduct(page, limit, query);
    if (apiResponse) {
      setProducts({
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
    await getProduct(current, pageSize);
  }

  async function handleFilter(query) {
    await getProduct(1, products.pageSize, query);
  }

  async function handleCreateProduct(dataForm) {
    let product_images = null;
    if (dataForm && dataForm.product_image) {
      product_images = await uploadImages(dataForm.product_image);
    }

    let data = {
      user_id: myInfo._id,
      product_name: dataForm.product_name,
      product_description: dataForm.product_description,
      product_price: dataForm.product_price,
      product_discount: dataForm.product_discount,
      product_unit: dataForm.product_unit,
      product_image: product_images,
    };

    const apiResponse = await createProduct(data);
    if (apiResponse) {
      setStateCreateProduct({ isShowModal: false, createProductSelected: null });
      message.success("Đã tạo sản phẩm mới thành công!");
      await getProduct();
    } else {
      message.error(apiResponse.message);
    }
  }

  const columnsProduct = [
    {
      title: <div style={{ textTransform: "capitalize" }}>{t("TEN_SAN_PHAM")}</div>,
      dataIndex: "productName",
      width: "15%",
      align: "center",
      render: value => {
        return <div align="left">{value}</div>;
      }
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Đơn vị tính"}</div>,
      width: "10%",
      align: "center",
      dataIndex: "productUnit",
      render: (value) => {
        return <> {value} </>;
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{t("GIA_SAN_PHAM") + ' (VNĐ)'}</div>,
      width: "15%",
      align: "center",
      dataIndex: "productPrice",
      render: (value) => {
        return <> {formatNumber(value)} </>;
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{t("CHIET_KHAU_SAN_PHAM") + ' (%)'}</div>,
      width: "10%",
      align: "center",
      dataIndex: "productDiscount",
      render: (value) => {
        return <> {value} </>;
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{t("MO_TA")}</div>,
      width: "20%",
      dataIndex: "productDescription",
      align: "center",
      render: value => {
        return <div align="left">{value}</div>;
      }
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{t("THAO_TAC")}</div>,
      key: "action",
      align: "center",
      width: "15%",
      fixed: "right",
      render: (record) => {
        return (
          <NavLink
            to={{
              pathname: "/product/" + record._id,
              aboutProps: {
                id: record._id,
                name: record.productName,
              },
            }}
          >
            <Button type="primary" ghost>
              {t("XEM")}
            </Button>
          </NavLink>
        );
      },
    },
  ];

  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={t("SAN_PHAM")}>
        <Row>
          <Button type="primary" icon={<i className="fa fa-plus mr-1" />} onClick={handleShowModalCreateProduct}>
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
          columns={columnsProduct}
          dataSource={products.dataRes}
          pagination={paginationConfig(handleChangePagination, products)}
          scroll={{ x: 1200 }}
        />
      </Loading>

      <CreateProduct
        isModalVisible={stateCreateProduct.isShowModal}
        handleOk={handleCreateProduct}
        handleCancel={() => setStateCreateProduct({ isShowModal: false, createProductSelected: null })}
        createProductSelected={stateCreateProduct.createProductSelected}
      />
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps)(Product);
