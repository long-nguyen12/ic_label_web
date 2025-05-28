import { AreaChartOutlined } from "@ant-design/icons";
import { Button, DatePicker, Row, Select, Space, Table, Typography } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import Loading from "@components/Loading";
import { CONSTANTS } from "@constants";
import { NavLink, useHistory } from "react-router-dom";
import { exportReportQuery, getAllSalebillsByUserID } from "../../services/Report";
import { generateDocument } from "../Files/File";
import { formatNumber } from "../../../utils";
import {
  convertQueryToObject,
  formatDateTime,
  handleReplaceUrlSearch,
  paginationConfig,
} from "@app/common/functionCommons";
import fileDownload from "js-file-download";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const QUERY_TYPE = {
  MONTH: 1,
  QUARTER: 2,
  YEAR: 3,
};

function DetailStatistic({ myInfo, language }) {
  let { t } = useTranslation();
  let history = useHistory();
  const [loading, setLoading] = useState(false);
  const [statistic, setStatistic] = useState({
    dataRes: [],
    currentPage: 1,
    pageSize: 10,
    totalDocs: 0,
    query: {
      timeStart: moment().startOf("month").format("DD-MM-YYYY"),
      timeEnd: moment().endOf("month").format("DD-MM-YYYY"),
    },
  });

  // const [timeStart, setTimeStart] = useState(moment().startOf("month").format("DD-MM-YYYY"));
  // const [timeEnd, setTimeEnd] = useState(moment().endOf("month").format("DD-MM-YYYY"));
  const [timeQuery, setTimeQuery] = useState();
  const [queryType, setQueryType] = useState(QUERY_TYPE.MONTH);

  // const [idDonVi, setIdDonVi] = useState();

  const columnsReport = [
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Tên khách hàng"}</div>,
      width: "20%",
      render: (value) => {
        return <>
          <div>{value?.customerId?.customerFullName}</div>
          <div>Chức vụ: {value?.customerId?.positionId?.positionName}</div>

        </>;
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Thời gian"}</div>,
      width: "20%",
      render: (value) => {
        return <div>{formatDateTime(value?.saleDate)}</div>;
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Tiền đơn hàng"}</div>,
      width: "15%",
      render: (value) => {
        return <div>{formatNumber(value?.saleTotalPayableADiscount)} VNĐ</div>;
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Đã thanh toán"}</div>,
      width: "15%",
      render: (value) => {
        return <div>{formatNumber(value?.saleBillsPaid)} VNĐ</div>;
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Tổng nợ"}</div>,
      width: "15%",
      render: (value) => {
        return <div>{formatNumber(value?.saleBillsDebt)} VNĐ</div>;
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Lợi nhuận"}</div>,
      width: "20%",
      render: (value) => {
        return <div>{formatNumber(value?.saleProfitMoney)} VNĐ</div>;
      },
    },


    {
      title: <div style={{ textTransform: "capitalize" }}>{t("THAO_TAC")}</div>,
      key: "action",
      align: "center",
      width: "10%",
      fixed: "right",
      render: (record) => {
        return (
          <NavLink
            to={{
              pathname: "/customer/" + record.customerId._id,
              aboutProps: {
                id: record._id,
                customerId: record.customerId._id,
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

  function onChangeTimeSelect(dates, dateStrings) {
    setStatistic({
      ...statistic,
      query: {
        timeStart: dateStrings[0],
        timeEnd: dateStrings[1],
      },
    });
  }

  async function getStatistic(page = statistic.currentPage, limit = statistic.pageSize, query = statistic.query) {
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    setLoading(true);
    const apiResponse = await getAllSalebillsByUserID(page, 0, query);
    if (apiResponse) {
      setLoading(false);
      setStatistic({
        dataRes: apiResponse.docs,
        currentPage: page,
        pageSize: limit,
        totalDocs: apiResponse.totalDocs,
        query: query,
      });
    }
    setLoading(false);
  }

  async function exportReport(page = statistic.currentPage, limit = statistic.pageSize, query = statistic.query) {
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    setLoading(true);
    const apiResponse = await exportReportQuery(page, 0, query);
    if (apiResponse) {
      const FILE_OUTPUT = `baocao_${moment().format("DD-MM-YYYY")}.xlsx`;
      fileDownload(apiResponse, FILE_OUTPUT);
    }
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      await getStatistic(statistic.currentPage, statistic.pageSize, statistic.query);
    })();
  }, []);

  function renderAmount() {
    let data =
      statistic.dataRes.length > 0
        ? statistic.dataRes.reduce(
            (total, item) => {
              return {
                totalAmount: total.totalAmount + parseInt(item.saleTotalPayableADiscount),
                paidAmount: total.paidAmount + parseInt(item.saleBillsPaid),
                amountLeft: total.amountLeft + parseInt(item.saleBillsDebt),
                totalProfit: total.totalProfit + parseInt(item.saleProfitMoney),

              };
            },
            { totalAmount: 0, paidAmount: 0, amountLeft: 0 , totalProfit: 0 }
          )
        : 0;
    return (
      <div>
        <Row>
          <Space>
            <Text strong>Tổng tiền đơn hàng:</Text>
            <Text>{formatNumber(data.totalAmount) || 0} VNĐ</Text>
          </Space>
        </Row>
        <Row>
          <Space>
            <Text strong>Đã thanh toán:</Text>
            <Text>{formatNumber(data.paidAmount) || 0} VNĐ</Text>
          </Space>
        </Row>
        <Row>
          <Space>
            <Text strong>Còn nợ:</Text>
            <Text>{formatNumber(data.amountLeft) || 0} VNĐ</Text>
          </Space>
        </Row>
        <Row>
          <Space>
            <Text strong>Lợi nhuận:</Text>
            <Text>{formatNumber(data.totalProfit) || 0} VNĐ</Text>
          </Space>
        </Row>
      </div>
    );
  }

  async function handleChangePagination(current, pageSize) {
    await getStatistic(current, pageSize);
  }

  return (
    <>
      <Row gutter={[20, 20]} style={{ margin: "10px 0 20px 0" }}>
        <RangePicker
          format="DD-MM-YYYY"
          style={{ marginRight: 10, minWidth: 320 }}
          defaultValue={[moment().startOf("month"), moment().endOf("month")]}
          placeholder={["Từ ngày", "Đến ngày"]}
          ranges={{
            "Hôm nay": [moment(), moment()],
            "Tháng hiện tại": [moment().startOf("month"), moment().endOf("month")],
            "Quý hiện tại": [moment().startOf("quarter"), moment().endOf("quarter")],
            "Năm hiện tại": [moment().startOf("year"), moment().endOf("year")],
          }}
          onChange={onChangeTimeSelect}
        />

        <Button type="primary" style={{ marginRight: 10 }} onClick={() => getStatistic(1, statistic.pageSize, statistic.query)}>
          {t("THONG_KE")}
        </Button>
        <Button type="primary" ghost onClick={() => exportReport(1, statistic.pageSize, statistic.query)}>
          Xuất báo cáo
        </Button>
      </Row>
      <Row style={{ margin: "0px 0 20px 0" }}>{renderAmount()}</Row>
      <Table
        loading={loading}
        bordered
        rowKey="_id"
        size="small"
        columns={columnsReport}
        dataSource={statistic.dataRes}
        pagination={paginationConfig(handleChangePagination, statistic)}
        scroll={{ x: 1200 }}
      />
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  const { language } = store.locale;
  return { myInfo, language };
}

export default connect(mapStateToProps, null)(DetailStatistic);
