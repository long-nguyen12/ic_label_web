import React, { useEffect, useState } from "react";
import CustomBreadcrumb from "@components/CustomBreadcrumb";
import { Divider, Typography, Card, Col, Row } from "antd";
import { getAllDataset, getAllCaptionImages } from "@app/services/Dataset";
import { getAllUser } from "@app/services/User";
const { Title, Paragraph, Text, Link } = Typography;
import Loading from "@components/Loading";

export default function Dashboard() {
  const [datasetCount, setDatasetCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [captionCount, setCaptionCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const datasetRes = await getAllDataset();
      const userRes = await getAllUser();
      const captionRes = await getAllCaptionImages();
      setDatasetCount(datasetRes?.totalDocs || 0);
      setUserCount(userRes?.totalDocs || 0);
      setCaptionCount(captionRes?.length || 0);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={"Dashboard"} />
      <Loading active={loading} layoutBackground>
        <div className="site-card-wrapper">
          <Row gutter={16}>
            <Col span={8}>
              <Card title="Người dùng" bordered={true} headStyle={{ backgroundColor: "#F97A00", color: "#fff" }}>
                Tổng số người dùng: {userCount}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Dataset" bordered={true} headStyle={{ backgroundColor: "#AEC8A4", color: "#fff" }}>
                Tổng số dataset: {datasetCount}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Caption" bordered={true} headStyle={{ backgroundColor: "#8A784E", color: "#fff" }}>
                Tổng số ảnh đã gán nhãn: {captionCount}
              </Card>
            </Col>
          </Row>
        </div>
      </Loading>
    </>
  );
}

