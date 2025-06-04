import React, { useEffect, useState, useRef } from "react";
import { Button, Popconfirm, Row, Form, Col, List, Image, Pagination, Space, Input } from "antd";
import { connect } from "react-redux";
import { getGallery, updateGalleryById, generateGalleryAI } from "../../../services/Dataset/index";
import { BASE_URL } from "../../../../constants/BASE_URL";
import CustomBreadcrumb from "@components/CustomBreadcrumb";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { CONSTANTS } from "@constants";
import { toast } from "@app/common/functionCommons";
// import { set } from "lodash";
import CustomSkeleton from "@components/CustomSkeleton";

const Gallery = (props) => {

  const [form] = Form.useForm();
  const { id } = props.match.params;
  let history = useHistory();
  const { t } = useTranslation();
  const [width, setWidth] = useState(window.innerWidth);
  const [linkImage, setLinkImage] = useState();
  const [data, setData] = useState([]);
  const [describe, setDescribe] = useState({ image_caption: ["", "", "", "", ""] });
  const submitRef = useRef();
  const formRef = useRef(null);


  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  const isMobile = width <= 768;
  const handleGetFile = async () => {
    const response = await getGallery(id);
    if (response) {
      console.log("Gallery response", response);
      setData(response);
      const imgUrl = `${BASE_URL}/${response.datasetId?.datasetPath}/${response.imageName}`;
      if (response.imageCaption) {
        form.setFieldsValue({
          image_caption: response.imageCaption,
        });
      } else {
        form.setFieldsValue({
          describe
        });
      }
      setLinkImage(imgUrl);
    }
  };

  useEffect(() => {
    (async () => {
      await handleGetFile();
    })();
  }, []);

  const handleGetAI = async () => {
    const response = await generateGalleryAI(id);
    setData(response);
    toast(CONSTANTS.SUCCESS, "Cập nhật dữ liệu thành công!");
  };

  const onFinish = async (values) => {
    try {
      const Data = {
        id: id,
        caption: JSON.stringify({ ...values })
      }

      const dataUpdate = await updateGalleryById(id, values);
      form.setFieldsValue({
        image_caption: dataUpdate.imageCaption,
      });
      toast(CONSTANTS.SUCCESS, "Cập nhật dữ liệu thành công!");
    } catch (error) {
      toast(CONSTANTS.ERROR, "Cập nhật dữ liệu thất bại!");
    }
  };

  return (
    <>
      {isMobile ? (
        <Col></Col>
      ) : (
        <>
          <CustomBreadcrumb breadcrumbLabel={"GÁN NHÃN DỮ LIỆU"}>
            <Button
              className="mr-2"
              type="primary"
              ghost
              icon={<i className="fa fa-arrow-left mr-1" />}
              onClick={() => history.goBack()}
            >
              {t("QUAY_LAI")}
            </Button>
          </CustomBreadcrumb>
          <div className="site-layout-background">
            <Row gutter={16}>
              <Col span={12}>
                <Image
                  width="100%"
                  src={linkImage}
                  alt="dataset-img"
                  style={{ objectFit: "cover", borderRadius: 8 }}
                  preview={false}
                />
                {data.imageDetection ? (
                  <div>
                    <br />
                    <Image
                      width="100%"
                      src={data.imageDetection}
                      alt="dataset-img"
                      style={{ objectFit: "cover", borderRadius: 8 }}
                      preview={false}
                    />
                  </div>
                ) : null}
              </Col>
              <Col span={12}>
                <Form
                  form={form}
                  ref={formRef}
                  name="dynamic_form_nest_item"
                  initialValues={describe}
                  onFinish={onFinish}
                >

                  <Form.List name="image_caption">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Form.Item
                            key={key}
                            name={[name]}
                            rules={[{ required: true, message: 'Thêm caption!' }]}
                            style={{ marginBottom: 15 }}
                          >
                            <Input placeholder="Caption" />
                          </Form.Item>
                        ))}
                        
                        <Form.Item>
                          <Button type="primary" htmlType="submit" ref={submitRef}>
                            Lưu Captions
                          </Button>
                        </Form.Item>
                        <Form.Item>
                          <Button onClick={handleGetAI}>
                            Generate AI Image
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Form>
              </Col>
            </Row>
          </div>
        </>
      )}
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps, null)(Gallery);

