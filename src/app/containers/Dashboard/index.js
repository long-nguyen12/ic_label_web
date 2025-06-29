import React, { useEffect, useState } from "react";
import CustomBreadcrumb from "@components/CustomBreadcrumb";
import { Divider, Typography, Card, Col, Row } from "antd";
import { getAllDataset, getAllCaptionImages, getAllActiveImages } from "@app/services/Dataset";
import { getAllUser } from "@app/services/User";
const { Title, Paragraph, Text, Link } = Typography;
import Loading from "@components/Loading";
import axios from "axios";

export default function Dashboard() {
  const [datasetCount, setDatasetCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [captionCount, setCaptionCount] = useState(0);
  const [imageCount, setImageCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const apiRequestAll = [getAllDataset(), getAllUser(), getAllCaptionImages(), getAllActiveImages()];
      await axios.all(apiRequestAll).then(
        axios.spread(function (datasetRes, userRes, captionRes, imageRes) {
          setDatasetCount(datasetRes?.totalDocs || 0);
          setUserCount(userRes?.totalDocs || 0);
          setCaptionCount(captionRes?.length || 0);
          setImageCount(imageRes?.length || 0);
          setLoading(false);
        })
      );
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={"Dashboard"} />
      <Loading active={loading} layoutBackground>
        <div className="site-card-wrapper">
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} sm={24} md={12} lg={6} xl={6}>
              <Card
                bordered={false}
                style={{
                  background: "linear-gradient(135deg, #F97A00 60%, #FFD580 100%)",
                  borderRadius: 16,
                  boxShadow: "0 4px 24px rgba(249, 122, 0, 0.15)",
                  color: "#fff",
                  minHeight: 160,
                }}
                headStyle={{
                  background: "transparent",
                  color: "#fff",
                  fontSize: 20,
                  borderBottom: "none",
                  display: "flex",
                  alignItems: "center",
                }}
                title={
                  <span>
                    <i className="fa fa-users" style={{ marginRight: 10 }} />
                    Người dùng
                  </span>
                }
              >
                <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{userCount}</div>
                <div style={{ fontSize: 16 }}>Tổng số người dùng</div>
              </Card>
            </Col>
            <Col xs={24} sm={24} md={12} lg={6} xl={6}>
              <Card
                bordered={false}
                style={{
                  background: "linear-gradient(135deg, #AEC8A4 60%, #e0f7e9 100%)",
                  borderRadius: 16,
                  boxShadow: "0 4px 24px rgba(174, 200, 164, 0.15)",
                  color: "#fff",
                  minHeight: 160,
                }}
                headStyle={{
                  background: "transparent",
                  color: "#fff",
                  fontSize: 20,
                  borderBottom: "none",
                  display: "flex",
                  alignItems: "center",
                }}
                title={
                  <span>
                    <i className="fa fa-database" style={{ marginRight: 10 }} />
                    Dataset
                  </span>
                }
              >
                <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{datasetCount}</div>
                <div style={{ fontSize: 16 }}>Tổng số dataset</div>
              </Card>
            </Col>
            <Col xs={24} sm={24} md={12} lg={6} xl={6}>
              <Card
                bordered={false}
                style={{
                  background: "linear-gradient(135deg, #5B86E5 60%, #36D1C4 100%)",
                  borderRadius: 16,
                  boxShadow: "0 4px 24px rgba(91, 134, 229, 0.15)",
                  color: "#fff",
                  minHeight: 160,
                }}
                headStyle={{
                  background: "transparent",
                  color: "#fff",
                  fontSize: 20,
                  borderBottom: "none",
                  display: "flex",
                  alignItems: "center",
                }}
                title={
                  <span>
                    <i className="fa fa-image" style={{ marginRight: 10 }} />
                    Ảnh
                  </span>
                }
              >
                <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{imageCount}</div>
                <div style={{ fontSize: 16 }}>Tổng số ảnh</div>
              </Card>
            </Col>
            <Col xs={24} sm={24} md={12} lg={6} xl={6}>
              <Card
                bordered={false}
                style={{
                  background: "linear-gradient(135deg, #8A784E 60%, #e6d3b3 100%)",
                  borderRadius: 16,
                  boxShadow: "0 4px 24px rgba(138, 120, 78, 0.15)",
                  color: "#fff",
                  minHeight: 160,
                }}
                headStyle={{
                  background: "transparent",
                  color: "#fff",
                  fontSize: 20,
                  borderBottom: "none",
                  display: "flex",
                  alignItems: "center",
                }}
                title={
                  <span>
                    <i className="fa fa-image" style={{ marginRight: 10 }} />
                    Caption
                  </span>
                }
              >
                <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{captionCount}</div>
                <div style={{ fontSize: 16 }}>Tổng số ảnh đã gán nhãn</div>
              </Card>
            </Col>
          </Row>
        </div>
      </Loading>
    </>
  );
}
