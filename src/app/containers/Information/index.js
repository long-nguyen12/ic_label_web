import React from 'react';
import CustomBreadcrumb from '@components/CustomBreadcrumb';
import { Divider, Typography } from 'antd';
const { Title, Paragraph, Text, Link } = Typography;


export default function Information() {
  return (
    <>
      <CustomBreadcrumb breadcrumbLabel={"Thông tin phần mềm"}/>
      <div className="site-layout-background">
        
      </div>
    </>
  );
}
