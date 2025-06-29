import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Form, message, Row, Tabs, Upload, Button, Table } from "antd";
import { useTranslation } from "react-i18next";

import CustomModal from "@components/CustomModal";
import CustomSkeleton from "@components/CustomSkeleton";
import { CONSTANTS, RULES } from "@constants";
import { cloneObj } from "@app/common/functionCommons";
import { SketchPicker } from "react-color";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

const layoutCol = { xs: 24, md: 24 };
const labelCol = { xs: 24 };

function CreateLabel({ myInfo, isModalVisible, handleOk, handleCancel, createLabelSelected, ...props }) {
  const [formCreateLabel] = Form.useForm();
  const { t } = useTranslation();
  const [background, setBackground] = useState("#fff");
  const [labelData, setLabelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [file, setFile] = useState(null);
  const [activeKey, setActiveKey] = useState("1");

  const beforeUpload = (file) => {
    const isExcel =
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";
    if (!isExcel) {
      message.error("Chỉ cho phép upload file Excel (.xlsx, .xls)!");
    }
    return isExcel || Upload.LIST_IGNORE;
  };

  const handleChange = (info) => {
    const file = info.file.originFileObj;
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (json.length) {
          setColumns(
            json[0].map((col, idx) => ({
              title: col,
              dataIndex: idx,
              key: idx,
            }))
          );
          setLabelData(
            json.slice(1).map((row, rowIdx) => {
              const rowObj = {};
              row.forEach((cell, idx) => {
                rowObj[idx] = cell;
              });
              rowObj.key = rowIdx;
              return rowObj;
            })
          );
          setFile(file);
        } else {
          setColumns([]);
          setLabelData([]);
          setFile(null);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      message.error("Không thể đọc file Excel!");
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      formCreateLabel.resetFields();
      if (createLabelSelected) {
        const dataField = cloneObj(createLabelSelected);
        formCreateLabel.setFieldsValue(dataField);
      }
    } else {
      setLabelData([]);
      setColumns([]);
      setFile(null);
    }
  }, [isModalVisible]);

  async function onFinish(data) {
    if (activeKey === "1") {
      const formData = new FormData();
      formData.append("file", file);
      if (props.isLoading) return;
      handleOk(formData);
    } else {
      const newData = {
        label_name: formCreateLabel.getFieldValue("labelName"),
        label_color: formCreateLabel.getFieldValue("labelColor"),
      };
      if (props.isLoading) return;
      handleOk(newData);
    }
  }

  function handleChangeColor(color) {
    setBackground(color.hex);
    formCreateLabel.setFieldsValue({ labelColor: color.hex });
  }

  function isHexColor(str) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(str);
  }

  return (
    <>
      <CustomModal
        width="800px"
        title={"Thêm mới nhãn"}
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={onFinish}
        isLoadingSubmit={props.isLoading}
        isDisabledClose={props.isLoading}
        closeLabel={t("HUY")}
        submitLabel={t("LUU")}
      >
        <Tabs
          size="small"
          defaultActiveKey={activeKey}
          onChange={(key) => {
            if (key !== "1") {
              setLabelData([]);
              setColumns([]);
              setFile(null);
            } else {
              formCreateLabel.resetFields();
            }
            setActiveKey(key);
          }}
        >
          <Tabs.TabPane tab="Tải lên file" key="1">
            <Upload
              accept=".xlsx,.xls"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Chọn file Excel</Button>
            </Upload>
            <div style={{ marginTop: 12 }}>
              <Table columns={columns} dataSource={labelData} bordered size="small" scroll={{ x: true }} />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Tạo thủ công" key="2">
            <Form id="form-modal" form={formCreateLabel} onFinish={onFinish}>
              <Row gutter={15}>
                <CustomSkeleton
                  label={"Tên nhãn"}
                  name="labelName"
                  layoutCol={layoutCol}
                  labelCol={labelCol}
                  type={CONSTANTS.TEXT}
                  rules={[RULES.REQUIRED]}
                  form={formCreateLabel}
                />
                <CustomSkeleton
                  label={"Màu"}
                  name="labelColor"
                  layoutCol={layoutCol}
                  labelCol={labelCol}
                  type={CONSTANTS.TEXT}
                  rules={[RULES.REQUIRED]}
                  form={formCreateLabel}
                  onChange={(e) => {
                    if (isHexColor(e.target.value)) {
                      setBackground(e.target.value);
                    }
                  }}
                />
              </Row>
              <Row justify="center" align="middle" className="mb-2">
                <SketchPicker color={background} onChangeComplete={handleChangeColor} />
              </Row>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </CustomModal>
    </>
  );
}

function mapStateToProps(store) {
  const { isLoading } = store.app;
  const { myInfo } = store.user;
  return { isLoading, myInfo };
}

export default connect(mapStateToProps)(CreateLabel);
