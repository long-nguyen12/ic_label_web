import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button, Popconfirm, Row, Form, Col, Image, Space } from "antd";
import { connect } from "react-redux";
import {
  getGallery,
  updateGalleryById,
  generateGalleryAI,
  deleteGalleryById,
  rotateImageRightById,
  generateCaptionById,
  generateSegmentCaption,
} from "../../../services/Dataset";
import { AI_BASE_URL, BASE_URL } from "../../../../constants/BASE_URL";
import CustomBreadcrumb from "@components/CustomBreadcrumb";
import { useHistory, useLocation } from "react-router-dom";
import { CONSTANTS, RULES } from "@constants";
import { toast } from "@app/common/functionCommons";
import CustomSkeleton from "@components/CustomSkeleton";
import Loading from "@components/Loading";
import { DeleteOutlined } from "@ant-design/icons";

const layoutCol = { xs: 24, md: 24, xl: 24, xxl: 24 };
const labelCol = { xs: 24 };
const initialCaptions = Array(5).fill({ caption: "", segment: "" });

const Gallery = ({ match: { params: { id } } }) => {
  const history = useHistory();
  const location = useLocation();
  const [form] = Form.useForm();
  const submitRef = useRef();
  const [imageList, setImageList] = useState(location.state?.image_list || []);
  const [currentIndex, setCurrentIndex] = useState(Number(new URLSearchParams(location.search).get("index")) || 0);
  const [imageData, setImageData] = useState({ link: null, data: null });
  const [loading, setLoading] = useState(false);

  const updateHistory = useCallback((newIndex, imageId, updatedImageList = imageList) => {
    const params = new URLSearchParams(location.search);
    params.set("index", newIndex);
    history.replace({
      pathname: `/gallery/${imageId}`,
      search: params.toString(),
      state: { ...location.state, image_list: updatedImageList },
    });
  }, [history, location, imageList]);

  const fetchImage = useCallback(async (imageId) => {
    setLoading(true);
    try {
      const response = await getGallery(imageId);
      if (!response) return;

      const datasetPath = response.datasetId?.datasetPath?.replace(/\\/g, "/");
      const imgUrl = `${BASE_URL}/${datasetPath}/${response.imageName}`;
      const imageDetection = response.imageDetection.startsWith("http")
        ? `${response.imageDetection}?t=${Date.now()}`
        : `${AI_BASE_URL}/v1/api/images/${response.imageDetection}?t=${Date.now()}`;

      setImageData({ link: imgUrl, data: { ...response, imageDetection } });
      form.setFieldsValue({
        image_caption: response.imageCaption?.length > 0 ? response.imageCaption : initialCaptions,
      });
    } catch (error) {
      toast(CONSTANTS.ERROR, "Lấy ảnh thất bại");
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    if (imageList.length && imageList[currentIndex]) {
      fetchImage(imageList[currentIndex]._id || imageList[currentIndex].id);
    }
  }, [imageList, currentIndex, fetchImage]);

  useEffect(() => {
    setImageList(location.state?.image_list || []);
  }, [location.state?.image_list]);

  const handleGenerateAI = useCallback(async () => {
    setLoading(true);
    try {
      const response = await generateGalleryAI(id);
      if (!response || !response.imageDetection) {
        throw new Error("Không có dữ liệu imageDetection");
      }

      const imageDetection = response.imageDetection.startsWith("http")
        ? `${response.imageDetection}?t=${Date.now()}`
        : `${AI_BASE_URL}/v1/api/images/${response.imageDetection}?t=${Date.now()}`;
      
      setImageData(prev => ({
        ...prev,
        data: { ...response, imageDetection },
      }));
      toast(CONSTANTS.SUCCESS, "Tạo bounding box thành công");
    } catch (error) {
      toast(CONSTANTS.ERROR, error.message || "Tạo bounding box thất bại");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleSubmit = useCallback(async (values) => {
    setLoading(true);
    try {
      const dataUpdate = await updateGalleryById(id, { ...values, have_caption: true });
      form.setFieldsValue({ image_caption: dataUpdate.imageCaption });
      toast(CONSTANTS.SUCCESS, "Cập nhật dữ liệu thành công");
    } catch (error) {
      toast(CONSTANTS.ERROR, "Cập nhật dữ liệu thất bại");
    } finally {
      setLoading(false);
    }
  }, [id, form]);

  const handleNavigation = useCallback((direction) => {
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < imageList.length) {
      setCurrentIndex(newIndex);
      form.resetFields();
      updateHistory(newIndex, imageList[newIndex]._id || imageList[newIndex].id);
    }
  }, [currentIndex, imageList, updateHistory, form]);

  const handleDelete = useCallback(async () => {
    setLoading(true);
    try {
      const imageId = imageList[currentIndex]._id || imageList[currentIndex].id;
      const response = await deleteGalleryById(imageId);
      if (!response) throw new Error();

      const updatedImageList = imageList.filter(img => img._id !== imageId && img.id !== imageId);
      setImageList(updatedImageList);
      const newIndex = Math.min(currentIndex, updatedImageList.length - 1);
      
      if (updatedImageList.length > 0) {
        updateHistory(newIndex, updatedImageList[newIndex]._id || updatedImageList[newIndex].id, updatedImageList);
      } else {
        history.replace({ pathname: "/gallery", state: { ...location.state, image_list: [] } });
      }
      toast(CONSTANTS.SUCCESS, "Xoá dữ liệu thành công");
    } catch (error) {
      toast(CONSTANTS.ERROR, "Xoá dữ liệu thất bại");
    } finally {
      setLoading(false);
    }
  }, [currentIndex, imageList, updateHistory, history, location.state]);

  const handleRotateRight = useCallback(async () => {
    setLoading(true);
    try {
      const imageId = imageList[currentIndex]._id || imageList[currentIndex].id;
      const response = await rotateImageRightById(imageId, 90);
      if (!response) throw new Error();

      const datasetPath = response.datasetId?.datasetPath?.replace(/\\/g, "/");
      setImageData(prev => ({ ...prev, link: `${BASE_URL}/${datasetPath}/${response.imageName}?t=${Date.now()}` }));
      toast(CONSTANTS.SUCCESS, "Xoay ảnh thành công");
    } catch (error) {
      toast(CONSTANTS.ERROR, "Xoay ảnh thất bại");
    } finally {
      setLoading(false);
    }
  }, [currentIndex, imageList]);

  const handleGenerateCaption = useCallback(async () => {
    setLoading(true);
    try {
      const response = await generateCaptionById(imageData.link);
      if (response?.captions?.length && response?.segment?.length) {
        const captions = response.captions.map((caption, i) => ({
          caption: caption || "",
          segment: response.segment[i] || "",
        }));
        form.setFieldsValue({ image_caption: captions });
        toast(CONSTANTS.SUCCESS, "Tạo mô tả thành công");
      } else {
        throw new Error();
      }
    } catch (error) {
      toast(CONSTANTS.ERROR, "Tạo mô tả thất bại");
    } finally {
      setLoading(false);
    }
  }, [imageData.link, form]);

  const handleGenerateSegmentCaption = useCallback(async () => {
    setLoading(true);
    try {
      const captions = form.getFieldValue("image_caption")?.map(item => item.caption) || [];
      const response = await generateSegmentCaption({ caption: captions });
      if (response?.segments?.length) {
        const updatedCaptions = captions.map((caption, i) => ({
          caption,
          segment: response.segments[i] || "",
        }));
        form.setFieldsValue({ image_caption: updatedCaptions });
        toast(CONSTANTS.SUCCESS, "Tạo segment words thành công");
      } else {
        throw new Error();
      }
    } catch (error) {
      toast(CONSTANTS.ERROR, "Tạo segment words thất bại");
    } finally {
      setLoading(false);
    }
  }, [form]);

  return (
    <>
      <CustomBreadcrumb breadcrumbLabel="GÁN NHÃN DỮ LIỆU">
        <Button
          className="mr-2"
          type="primary"
          ghost
          icon={<i className="fa fa-arrow-left mr-1" />}
          onClick={() => history.goBack()}
        >
          Quay lại
        </Button>
        <Button
          className="mr-2"
          type="primary"
          ghost
          onClick={() => handleNavigation("prev")}
          disabled={currentIndex === 0}
        >
          Ảnh trước
        </Button>
        <Button
          className="mr-2"
          type="primary"
          ghost
          onClick={() => handleNavigation("next")}
          disabled={currentIndex === imageList.length - 1}
        >
          Ảnh sau
        </Button>
        <Popconfirm
          title="Xoá ảnh này khỏi dataset?"
          onConfirm={handleDelete}
          okText="XOÁ"
          cancelText="HUỶ"
          okButtonProps={{ type: "danger" }}
        >
          <Button type="primary" danger icon={<DeleteOutlined style={{ fontSize: 15 }} />}>
            Xoá ảnh
          </Button>
        </Popconfirm>
      </CustomBreadcrumb>

      <Loading active={loading} layoutBackground>
        <Row gutter={16}>
          <Col span={12}>
            {imageData.link && (
              <Image
                width="100%"
                src={imageData.link}
                alt="dataset-img"
                style={{ objectFit: "cover", borderRadius: 8 }}
                preview
              />
            )}
            <Space className="my-2" style={{ display: "flex", justifyContent: "center" }}>
              <Button style={{ background: "#52c41a", color: "#fff" }} onClick={handleRotateRight} loading={loading}>
                Xoay ảnh
              </Button>
              <Button onClick={handleGenerateAI} loading={loading}>
                Tạo box
              </Button>
            </Space>
            {imageData.data?.imageDetection && (
              <Image
                key={imageData.data.imageDetection}
                width="100%"
                src={imageData.data.imageDetection}
                alt="dataset-img-detection"
                style={{ objectFit: "cover", borderRadius: 8 }}
                preview
              />
            )}
          </Col>
          <Col span={12}>
            <Form
              form={form}
              name="dynamic_form_nest_item"
              initialValues={{ image_caption: initialCaptions }}
              onFinish={handleSubmit}
            >
              <Form.List name="image_caption">
                {(fields) => (
                  <>
                    {fields.map(({ key, name }, index) => (
                      <div key={key}>
                        <CustomSkeleton
                          label={`Mô tả ${index + 1}`}
                          name={[name, "caption"]}
                          layoutCol={layoutCol}
                          labelCol={labelCol}
                          type={CONSTANTS.TEXT}
                          rules={[RULES.REQUIRED]}
                          form={form}
                        />
                        <CustomSkeleton
                          label={`Segment caption ${index + 1}`}
                          name={[name, "segment"]}
                          layoutCol={layoutCol}
                          labelCol={labelCol}
                          type={CONSTANTS.TEXT}
                          rules={[RULES.REQUIRED]}
                          form={form}
                        />
                      </div>
                    ))}
                    <Space style={{ display: "flex", justifyContent: "center" }}>
                      <Button onClick={handleGenerateCaption} loading={loading}>
                        Tạo mô tả
                      </Button>
                      <Button onClick={handleGenerateSegmentCaption} loading={loading}>
                        Tạo segment
                      </Button>
                      <Button type="primary" htmlType="submit" loading={loading} ref={submitRef}>
                        Lưu mô tả
                      </Button>
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

export default connect(({ user: { myInfo } }) => ({ myInfo }))(Gallery);