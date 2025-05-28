import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Button, DatePicker, Row, Select, Tabs, Table, Typography, Space } from "antd";
import { AreaChartOutlined, BarChartOutlined } from "@ant-design/icons";
import { Bar, Column } from "@ant-design/charts";
import moment from "moment";
import { useTranslation } from "react-i18next";

import { NavLink, useHistory } from "react-router-dom";
import CustomBreadcrumb from "@components/CustomBreadcrumb";
import Loading from "@components/Loading";
import { CONSTANTS, USER_STATUS } from "@constants";
import { getAll, getAllSalebillsByUserID } from "../../services/Report";
import { generateDocument, generateExcel } from "../Files/File";
import DetailStatistic from "./DetailStatistic";
import { formatNumber } from "../../../utils";
import { formatDateTime } from '@app/common/functionCommons';

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const QUERY_TYPE = {
  MONTH: 1,
  QUARTER: 2,
  YEAR: 3,
};

function Statistic({ myInfo, language }) {
  let { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [display, setDisplay] = useState(moment().format("MM-YYYY"));
  const [timeQuery, setTimeQuery] = useState();
  const [queryType, setQueryType] = useState(QUERY_TYPE.MONTH);
  const [report, setReport] = useState([]);
  // const [idDonVi, setIdDonVi] = useState();

  const columnsReport = [
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Tên khách hàng"}</div>,
      width: "20%",
      render: (value) => {
        return <div>{value?.customerDetail[0]?.customerFullName}</div>;
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Tổng tiền mua"}</div>,
      width: "20%",
      render: (value) => {
        return <div>{formatNumber(value?.totalPayAll)} VNĐ</div>;
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Tổng thanh toán"}</div>,
      width: "20%",
      render: (value) => {
        return <div>{formatNumber(value?.totalPay)} VNĐ</div>;
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Đã thanh toán"}</div>,
      width: "20%",
      render: (value) => {
        return <div>{formatNumber(value?.totalPaid)} VNĐ</div>;
      },
    },
    {
      title: <div style={{ textTransform: "capitalize" }}>{"Tổng nợ"}</div>,
      width: "20%",
      render: (value) => {
        return <div>{formatNumber(value?.totalDebt)} VNĐ</div>;
      },
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
              pathname: "/customer/" + record._id,
              aboutProps: {
                id: record._id,
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
    if (queryType == QUERY_TYPE.MONTH) {
      let [month, year] = dateStrings.split("-");
      setTimeQuery(getMonthDateRange(month, year));
    } else if (queryType === QUERY_TYPE.QUARTER) {
      let quarter = dateStrings.split("-")[1];
      if (quarter == "Q1") quarter = 1;
      else if (quarter == "Q2") quarter = 2;
      else if (quarter == "Q3") quarter = 3;
      else if (quarter == "Q4") quarter = 4;
      setTimeQuery(getQuarterRange(quarter));
    } else if (queryType == QUERY_TYPE.YEAR) {
      setTimeQuery(getYearRange(dateStrings));
    }
  }

  function handleChange(dates, dateStrings) {
    let timeQuery = null;
    setQueryType(dateStrings.value);
    if (dateStrings.value == QUERY_TYPE.MONTH) {
      let [month, year] = moment().format("MM-YYYY").split("-");
      timeQuery = getMonthDateRange(month, year);
      setTimeQuery(timeQuery);
    } else if (dateStrings.value == QUERY_TYPE.QUARTER) {
      timeQuery = getQuarterRange(moment().quarter());
      setTimeQuery(timeQuery);
    } else if (dateStrings.value == QUERY_TYPE.YEAR) {
      timeQuery = getYearRange(moment().year());
      setTimeQuery(timeQuery);
    }

    getReport(timeQuery);
  }

  async function getReport(timeQuery) {
    setLoading(true);
    let query = "";
    query += timeQuery ? `&start=${timeQuery.start}&end=${timeQuery.end}` : "";
    const apiResponse = await getAll(query);
    if (apiResponse) {
      setReport(apiResponse);
      setLoading(false);
    }
    setLoading(false);
  }

  function getMonthDateRange(month, year) {
    var startDate = moment(`${year}${month}01`, "YYYYMMDD");
    var endDate = moment(startDate).endOf("month");
    return { start: startDate.format().split("T")[0], end: endDate.format().split("T")[0] };
  }

  function getQuarterRange(quarter) {
    const start = moment().quarter(quarter).startOf("quarter");
    const end = moment().quarter(quarter).endOf("quarter");
    return { start: start.format().split("T")[0], end: end.format().split("T")[0] };
  }

  function getYearRange(year) {
    var startDate = moment(`${year}0101`, "YYYYMMDD");
    var endDate = moment(startDate).endOf("year");
    return { start: startDate.format().split("T")[0], end: endDate.format().split("T")[0] };
  }

  useEffect(() => {
    let timeQuery = null;
    if (queryType == QUERY_TYPE.MONTH) {
      let [month, year] = display.split("-");
      timeQuery = getMonthDateRange(month, year);
      setTimeQuery(timeQuery);
    } else if (queryType === QUERY_TYPE.QUARTER) {
      timeQuery = getQuarterRange(display);
      setTimeQuery(getQuarterRange(display));
    } else if (queryType === QUERY_TYPE.YEAR) {
      timeQuery = getYearRange(moment().year());
      setTimeQuery(getYearRange(moment().year()));
    }
    getReport(timeQuery);
  }, []);
  [];

  function renderAmount() {
    let data =
      report.length > 0
        ? report.reduce(
            (total, item) => {
              return {
                totalAmount: total.totalAmount + item.totalPay,
                paidAmount: total.paidAmount + item.totalPaid,
                amountLeft: total.amountLeft + item.totalDebt,
              };
            },
            { totalAmount: 0, paidAmount: 0, amountLeft: 0 }
          )
        : 0;
    return (
      <div>
        <Row>
          <Space>
            <Text strong>Tổng tiền thanh toán:</Text>
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
      </div>
    );
  }

  // function exportReport() {
  //   let thanhtoan =
  //     report.length > 0
  //       ? report.reduce(
  //           (total, item) => {
  //             return {
  //               totalAmount: total.totalAmount + item.totalPaid,
  //               paidAmount: total.paidAmount + item.totalPaid,
  //               amountLeft: total.amountLeft + item.totalPaid,
  //             };
  //           },
  //           { totalAmount: 0, paidAmount: 0, amountLeft: 0 }
  //         )
  //       : 0;
  //   let data = {
  //     ...myInfo,
  //     ...thanhtoan,
  //     time:
  //       queryType == QUERY_TYPE.MONTH
  //         ? `THÁNG ${moment(timeQuery.start, "YYYY-MM-DD").format("M")}`
  //         : queryType == QUERY_TYPE.QUARTER
  //         ? `QUÝ ${moment(timeQuery.start, "YYYY-MM-DD").quarter()}`
  //         : `NĂM ${moment(timeQuery.start, "YYYY-MM-DD").format("Y")}`,
  //     exportTime: moment().format("HH:mm:ss DD-MM-YYYY"),
  //     table: {
  //       data: report,
  //     },
  //   };
  //   generateExcel(data, "thongke");
  // }

  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={t("THỐNG KÊ, BÁO CÁO")} />
      <Loading active={loading} layoutBackground>
        <Tabs type="card">
          <TabPane
            tab={
              <div style={{ fontSize: 15 }}>
                <AreaChartOutlined style={{ fontSize: 15 }} />
                {"Chi tiết thống kê"}
              </div>
            }
            key="0"
          >
            <DetailStatistic />
          </TabPane>
          <TabPane
            tab={
              <div style={{ fontSize: 15 }}>
                <BarChartOutlined style={{ fontSize: 15 }} />
                {t("Báo cáo")}
              </div>
            }
            key="1"
          >
            <Row gutter={[24, 24]} style={{ margin: "10px 0 20px 0" }}>
              {queryType == QUERY_TYPE.MONTH ? (
                <DatePicker
                  format="MM-YYYY"
                  size={"middle"}
                  picker="month"
                  style={{ marginRight: 10, minWidth: 320 }}
                  defaultValue={moment()}
                  onChange={onChangeTimeSelect}
                />
              ) : queryType == QUERY_TYPE.QUARTER ? (
                <DatePicker
                  size={"middle"}
                  picker="quarter"
                  style={{ marginRight: 10, minWidth: 320 }}
                  defaultValue={moment().quarter()}
                  onChange={onChangeTimeSelect}
                />
              ) : (
                <DatePicker
                  size={"middle"}
                  picker="year"
                  style={{ marginRight: 10, minWidth: 320 }}
                  defaultValue={moment()}
                  onChange={onChangeTimeSelect}
                />
              )}
              <Select
                defaultValue={QUERY_TYPE.MONTH}
                style={{ marginRight: 10, minWidth: 120 }}
                onChange={handleChange}
                options={[
                  {
                    value: QUERY_TYPE.MONTH,
                    label: "Tháng",
                  },
                  {
                    value: QUERY_TYPE.QUARTER,
                    label: "Quý",
                  },
                  {
                    value: QUERY_TYPE.YEAR,
                    label: "Năm",
                  },
                ]}
              />
              <Button style={{ marginRight: 10 }} type="primary" onClick={() => getReport(timeQuery)}>
                {t("Xem")}
              </Button>
              {/* <Button type="primary" ghost onClick={exportReport}>
                Xuất báo cáo
              </Button> */}
            </Row>
            <Row style={{ margin: "0px 0 20px 0" }}>{renderAmount()}</Row>
            <Table
              bordered
              rowKey="_id"
              size="small"
              columns={columnsReport}
              dataSource={report}
              scroll={{ x: 1200 }}
            />
          </TabPane>
        </Tabs>
      </Loading>
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  const { language } = store.locale;
  return { myInfo, language };
}

export default connect(mapStateToProps, null)(Statistic);
