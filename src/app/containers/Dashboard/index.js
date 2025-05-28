import React from 'react';
import CustomBreadcrumb from '@components/CustomBreadcrumb';
import { Divider, Typography } from 'antd';
const { Title, Paragraph, Text, Link } = Typography;


export default function Dashboard() {
  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={"Dashboard"}/>
      <div className="site-layout-background">
        
      </div>
    </>
  );
}
