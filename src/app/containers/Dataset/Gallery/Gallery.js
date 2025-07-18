import React, { useEffect, useState, useRef } from "react";
import { Button, Popconfirm, Row, Form, Col, List, Image, Pagination, Space } from "antd";
import { connect } from "react-redux";
import {
  getGallery,
  updateGalleryById,
  generateGalleryAI,
  deleteGalleryById,
  rotateImageLeftById,
  rotateImageRightById,
  generateCaptionById,
  generateSegmentCaption,
} from "../../../services/Dataset/index";
import { AI_BASE_URL, BASE_URL } from "../../../../constants/BASE_URL";
import CustomBreadcrumb from "@components/CustomBreadcrumb";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { CONSTANTS, RULES } from "@constants";
import { toast } from "@app/common/functionCommons";
import CustomSkeleton from "@components/CustomSkeleton";
import { useLocation } from "react-router-dom";
import Loading from "@components/Loading";
import { EyeOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

const layoutCol = { xs: 24, md: 24, xl: 24, xxl: 24 };
const labelCol = { xs: 24 };

const Gallery = (props) => {
  const location = useLocation();
  const [formCreateCaptions] = Form.useForm();
  const { id } = props.match.params;
  let history = useHistory();
  const { t } = useTranslation();
  const [linkImage, setLinkImage] = useState(null);
  const [data, setData] = useState([]);
  const [describe, setDescribe] = useState({
    image_caption: [
      { caption: "", segment: "" },
      { caption: "", segment: "" },
      { caption: "", segment: "" },
      { caption: "", segment: "" },
      { caption: "", segment: "" },
    ],
  });
  const submitRef = useRef();
  const formRef = useRef(null);
  const params = Object.fromEntries(new URLSearchParams(window.location.search));
  const [currentIndex, setCurrentIndex] = useState(params.index ? Number(params.index) : 0);
  const [imageList, setImageList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location?.state?.image_list) {
      setImageList(location.state.image_list);
      (async () => {
        handleGetFile(imageList[currentIndex]._id || imageList[currentIndex].id);
      })();
    }
  }, [location?.state?.image_list]);

  useEffect(() => {
    const params = Object.fromEntries(new URLSearchParams(window.location.search));
    if (params.index !== undefined) {
      setCurrentIndex(Number(params.index));
      (async () => {
        handleGetFile(imageList[currentIndex]._id || imageList[currentIndex].id);
      })();
    }
  }, [location.search]);

  useEffect(() => {
    if (imageList.length > 0 && imageList[currentIndex]) {
      (async () => {
        handleGetFile(imageList[currentIndex]._id || imageList[currentIndex].id);
      })();
    }
  }, [imageList, currentIndex]);

  const handleGetFile = async (imageId) => {
    setLoading(true);
    const response = await getGallery(imageId);
    if (response) {
      let imageDetection = response.imageDetection;
      if (imageDetection && !imageDetection.startsWith("http")) {
        imageDetection = `${AI_BASE_URL}/v1/api/images/${imageDetection}`;
      }
      const resp = { ...response, imageDetection };
      setData(resp);
      const datasetPath = response.datasetId?.datasetPath?.replace(/\\/g, "/");
      const imgUrl = `${BASE_URL}/${datasetPath}/${response.imageName}`;
      if (response?.imageCaption && response?.imageCaption?.length > 0) {
        formCreateCaptions.setFieldsValue({
          image_caption: response.imageCaption,
        });
      } else {
        formCreateCaptions.setFieldsValue({
          image_caption: describe.image_caption,
        });
      }
      setLinkImage(imgUrl);
    }
    setLoading(false);
  };

  const handleGetAI = async () => {
    setLoading(true);
    const response = await generateGalleryAI(id);
    if (response) {
      let imageDetection = response.imageDetection;
      if (!imageDetection.startsWith("http")) {
        imageDetection = `${AI_BASE_URL}/v1/api/images/${imageDetection}`;
      }
      const resp = { ...response, imageDetection };
      setData(resp);
      toast(CONSTANTS.SUCCESS, "Tạo bounding box cho ảnh thành công!");
    }
    setLoading(false);
  };

  const onFinish = async (values) => {
    try {
      values.have_caption = true;
      const dataUpdate = await updateGalleryById(id, values);
      formCreateCaptions.setFieldsValue({
        image_caption: dataUpdate.imageCaption,
      });
      toast(CONSTANTS.SUCCESS, "Cập nhật dữ liệu thành công!");
    } catch (error) {
      toast(CONSTANTS.ERROR, "Cập nhật dữ liệu thất bại!");
    }
  };

  const handleNext = () => {
    if (currentIndex < imageList.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      const params = new URLSearchParams(location.search);
      params.set("index", newIndex);
      const nextImageId = imageList[newIndex]._id || imageList[newIndex].id;
      setDescribe({
        image_caption: [
          { caption: "", segment: "" },
          { caption: "", segment: "" },
          { caption: "", segment: "" },
          { caption: "", segment: "" },
          { caption: "", segment: "" },
        ],
      });
      formCreateCaptions.resetFields();

      history.replace({
        pathname: `/gallery/${nextImageId}${location.pathname.includes("?") ? "" : ""}`,
        search: params.toString(),
        state: { ...location.state },
      });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      const params = new URLSearchParams(location.search);
      params.set("index", newIndex);
      const nextImageId = imageList[newIndex]._id || imageList[newIndex].id;
      setDescribe({
        image_caption: [
          { caption: "", segment: "" },
          { caption: "", segment: "" },
          { caption: "", segment: "" },
          { caption: "", segment: "" },
          { caption: "", segment: "" },
        ],
      });
      formCreateCaptions.resetFields();

      history.replace({
        pathname: `/gallery/${nextImageId}${location.pathname.includes("?") ? "" : ""}`,
        search: params.toString(),
        state: { ...location.state },
      });
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const apiResponse = await deleteGalleryById(imageList[currentIndex]._id || imageList[currentIndex].id);
      if (!apiResponse) {
        toast(CONSTANTS.ERROR, "Xoá dữ liệu thất bại!");
        return;
      }

      toast(CONSTANTS.SUCCESS, "Xoá dữ liệu thành công!");
      const updatedImageList = imageList.filter((image) => image._id !== id && image.id !== id);
      setImageList(updatedImageList);
      if (currentIndex >= updatedImageList.length) {
        setCurrentIndex(updatedImageList.length - 1);
      }
      if (updatedImageList.length > 0) {
        const nextImageId = updatedImageList[currentIndex]._id || updatedImageList[currentIndex].id;
        history.replace({
          pathname: `/gallery/${nextImageId}${location.pathname.includes("?") ? "" : ""}`,
          search: `?index=${currentIndex}`,
          state: { ...location.state, image_list: updatedImageList },
        });
      } else {
        history.replace({
          pathname: "/gallery",
          search: "",
          state: { ...location.state, image_list: [] },
        });
      }
    } catch (error) {
      toast(CONSTANTS.ERROR, "Xoá dữ liệu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleRotateLeft = async () => {
    setLoading(true);
    try {
      const apiResponse = await rotateImageLeftById(imageList[currentIndex]._id || imageList[currentIndex].id, 90);
      if (!apiResponse) {
        toast(CONSTANTS.ERROR, "Xoay ảnh thất bại!");
        return;
      }
      setData(apiResponse);
      const datasetPath = apiResponse.datasetId?.datasetPath?.replace(/\\/g, "/");
      const imgUrl = `${BASE_URL}/${datasetPath}/${apiResponse.imageName}?t=${Date.now()}`;
      setLinkImage(imgUrl);
    } catch (error) {
      toast(CONSTANTS.ERROR, "Xoay ảnh thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleRotateRight = async () => {
    setLoading(true);
    try {
      const apiResponse = await rotateImageRightById(imageList[currentIndex]._id || imageList[currentIndex].id, 90);
      if (!apiResponse) {
        toast(CONSTANTS.ERROR, "Xoay ảnh thất bại!");
        return;
      }
      setData(apiResponse);
      const datasetPath = apiResponse.datasetId?.datasetPath?.replace(/\\/g, "/");
      const imgUrl = `${BASE_URL}/${datasetPath}/${apiResponse.imageName}?t=${Date.now()}`;
      setLinkImage(imgUrl);
    } catch (error) {
      toast(CONSTANTS.ERROR, "Xoay ảnh thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCaption = async () => {
    setLoading(true);
    try {
      // const apiResponse = await generateCaptionById(imageList[currentIndex]._id || imageList[currentIndex].id);
      const apiResponse = await generateCaptionById(linkImage);
      if (apiResponse) {
        const generatedCaptions = apiResponse.captions.map((caption) => ({
          caption: caption || "",
        }));
        const generatedSegmentCaptions = apiResponse.segment.map((caption) => ({
          segment: caption || "",
        }));
        if (generatedCaptions.length === generatedSegmentCaptions.length) {
          for (let i = 0; i < generatedCaptions.length; i++) {
            generatedCaptions[i].segment = generatedSegmentCaptions[i].segment;
          }
          formCreateCaptions.setFieldsValue({
            image_caption: generatedCaptions,
          });
          toast(CONSTANTS.SUCCESS, "Sinh caption thành công!");
        } else {
          toast(CONSTANTS.ERROR, "Sinh caption thất bại!");
        }
      }
    } catch (error) {
      toast(CONSTANTS.ERROR, "Sinh caption thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSegmentCaption = async () => {
    setLoading(true);
    try {
      const data = formCreateCaptions.getFieldValue("image_caption");
      let captions = data.map((item) => item.caption);
      const apiResponse = await generateSegmentCaption({
        caption: captions,
      });
      if (apiResponse) {
        const generatedCaptions = captions.map((caption) => ({
          caption: caption || "",
        }));
        const generatedSegmentCaptions = apiResponse.segments.map((caption) => ({
          segment: caption || "",
        }));
        if (generatedCaptions.length === generatedSegmentCaptions.length) {
          for (let i = 0; i < generatedCaptions.length; i++) {
            generatedCaptions[i].segment = generatedSegmentCaptions[i].segment;
          }
          formCreateCaptions.setFieldsValue({
            image_caption: generatedCaptions,
          });
          toast(CONSTANTS.SUCCESS, "Sinh segment words thành công!");
        } else {
          toast(CONSTANTS.ERROR, "Sinh segment words thất bại!");
        }
      }
    } catch (error) {
      toast(CONSTANTS.ERROR, "Sinh segment words thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <Button className="mr-2" type="primary" ghost onClick={handleBack} disabled={currentIndex === 0}>
          Ảnh trước
        </Button>
        <Button
          className="mr-2"
          type="primary"
          ghost
          onClick={handleNext}
          disabled={currentIndex === imageList.length - 1}
        >
          Ảnh sau
        </Button>
        <Popconfirm
          title={t("Xoá ảnh này khỏi dataset?")}
          onConfirm={() => handleDelete()}
          okText={t("XOA")}
          cancelText={t("HUY")}
          okButtonProps={{ type: "danger" }}
        >
          <Button type="primary" danger icon={<DeleteOutlined style={{ fontSize: 15 }} />}>
            {t("Xoá ảnh")}
          </Button>
        </Popconfirm>
      </CustomBreadcrumb>

      <Loading active={loading} layoutBackground>
        <Row gutter={16}>
          <Col span={12}>
            {linkImage && (
              <Image
                width="100%"
                src={linkImage}
                alt="dataset-img"
                style={{ objectFit: "cover", borderRadius: 8 }}
                preview={true}
              />
            )}
            <Space className="mb-2 mt-1" align="center" style={{ display: "flex", justifyContent: "center" }}>
              <Button
                onClick={handleRotateRight}
                loading={loading}
                style={{ background: "#52c41a", color: "#fff", marginRight: 8 }}
              >
                Xoay ảnh
              </Button>
              <Button onClick={handleGetAI} loading={loading}>
                Sinh box
              </Button>
            </Space>
            {data?.imageDetection ? (
              <>
                <Space direction="vertical" size={16} style={{ width: "100%" }} />
                <Image
                  width="100%"
                  src={data.imageDetection}
                  alt="dataset-img"
                  style={{ objectFit: "cover", borderRadius: 8 }}
                  preview={true}
                />
              </>
            ) : null}
          </Col>
          <Col span={12}>
            <Form
              form={formCreateCaptions}
              ref={formRef}
              name="dynamic_form_nest_item"
              initialValues={describe}
              onFinish={onFinish}
            >
              <Form.List name="image_caption">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <div key={key}>
                        <CustomSkeleton
                          label={t(`Mô tả ${index + 1}`)}
                          name={[name, "caption"]}
                          layoutCol={layoutCol}
                          labelCol={labelCol}
                          type={CONSTANTS.TEXT}
                          rules={[RULES.REQUIRED]}
                          form={formCreateCaptions}
                        />
                        <CustomSkeleton
                          label={t(`Segment Caption ${index + 1}`)}
                          name={[name, "segment"]}
                          layoutCol={layoutCol}
                          labelCol={labelCol}
                          type={CONSTANTS.TEXT}
                          rules={[RULES.REQUIRED]}
                          form={formCreateCaptions}
                        />
                      </div>
                    ))}
                    <Space align="center" style={{ display: "flex", justifyContent: "center" }}>
                      <Form.Item>
                        <Button onClick={handleGenerateCaption} loading={loading}>
                          Sinh mô tả
                        </Button>
                      </Form.Item>
                      <Form.Item>
                        <Button onClick={handleGenerateSegmentCaption} loading={loading}>
                          Sinh segment
                        </Button>
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} ref={submitRef}>
                          Lưu mô tả
                        </Button>
                      </Form.Item>
                    </Space>
                  </>
                )}
              </Form.List>
            </Form>
          </Col>
        </Row>
      </Loading>
    </>
  );
};

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps, null)(Gallery);
