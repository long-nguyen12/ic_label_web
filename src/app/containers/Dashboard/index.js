import React from "react";
import CustomBreadcrumb from "@components/CustomBreadcrumb";
import { Divider, Typography, Card, Col, Row } from "antd";
const { Title, Paragraph, Text, Link } = Typography;

export default function Dashboard() {
  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={"Dashboard"} />
      <div className="site-layout-background">
        <div className="site-card-wrapper">
          <Row gutter={16}>
            <Col span={8}>
              <Card title="Người dùng" bordered={true}>
                Card content
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Dataset" bordered={true}>
                Card content
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Caption" bordered={true}>
                Card content
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}

