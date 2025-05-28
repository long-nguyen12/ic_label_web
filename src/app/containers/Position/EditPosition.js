import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Col, Form, Input, Modal, Row, Typography, Table } from 'antd';
// import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

import Loading from '@components/Loading';
import CustomBreadcrumb from '@components/CustomBreadcrumb';
import { changeLabelName, createLabel, deleteLabelID, getDatasetById, updateDataset } from '@app/services/Dataset';
import { cloneObj, toast } from '@app/common/functionCommons';
import { CONSTANTS, RULES } from '@constants';
import CustomSkeleton from '@components/CustomSkeleton';
import EditLabel from '@containers/Dataset/EditLabel';
import ActionCell from '@components/ActionCell';

const layoutCol = { xs: 24, md: 24 };
const labelCol = { xs: 24 };
const { Title, Text } = Typography;
const { TextArea } = Input;

function EditDataset({ myInfo }) {
  let { id } = useParams();
  const [formFilter] = Form.useForm();
  let history = useHistory();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // const [imageContainLabel, setImageContainLabel] = useState([]);
  const [lables, setLables] = useState([]);

  // const [filterLabel, setFilterLabel] = useState([]);
  // const [checkSearch, setCheckSearch] = useState(false);
  const [addNewNhan, setAddNewNhan] = useState(false);
  const [lableNewName, setLableNewName] = useState('');
  const [descriptionLable, setDescriptionLable] = useState('');
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  const addNewNameLable = (e) => {
    setLableNewName(e.target.value);
  };
  const addNewDescriptionLable = (e) => {
    setDescriptionLable(e.target.value);
  };

  const [stateEditLabel, setStateEditLabel] = useState({
    isShowModal: false,
    editLabelSelected: null,
  });

  async function handleAddNewLableName() {
    if (lableNewName.trim() === '' || descriptionLable.trim() === '') {
      toast(CONSTANTS.ERROR, t('DIEN_DAY_DU_THONG_TIN_NHAN'));
    } else {
      if (lableNewName && lables.findIndex(i => i?.labelName === lableNewName) === -1) {
        const dataItem = {
          'labelName': lableNewName,
          'description': descriptionLable,
          'datasetId': id,
        };
        const apiResponse = await createLabel(myInfo._id, dataItem);
        if (apiResponse) {
          await getDatasetDetail();
          setAddNewNhan(false);
          toast(CONSTANTS.SUCCESS, t('THEM_MOI_NHAN_THANH_CONG'));
        }
      } else {
        toast(CONSTANTS.ERROR, `${t('NHAN')} ` + lableNewName + ` ${t('DA_TON_TAI')}`);
      }
    }
  }

  async function getDatasetDetail() {
    setLoading(true);
    const api = await getDatasetById(id);
    if (api) {
      setName(api?.data?.datasetName);
      setDescription(api?.data?.description);
      setLables(api?.data?.labelCate);
    }
    setLoading(false);
  }

  async function handleUpdate() {
    if (name.trim() === '' || description.trim() === '') {
      toast(CONSTANTS.ERROR, t('DIEN_DAY_DU_THONG_TIN_NHAN'));
    } else {
      setLoading(true);
      const labelId = [];
      lables.forEach(item => labelId.push(item._id));
      const data = {
        'dataset_name': name,
        'description': description,
        'label_cate': labelId,
      };
      const apiResponse = await updateDataset(id, data);
      if (apiResponse) {
        await getDatasetDetail();
        toast(CONSTANTS.SUCCESS, t('DA_CAP_NHAT_THONG_TIN'));
      }
      setLoading(false);
    }
  }

  const onChangeName = (e) => {
    setName(e.target.value);
  };
  const onChangeDescription = (e) => {
    setDescription(e.target.value);
  };

  useEffect(() => {
    getDatasetDetail();
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);
  const isMobile = width <= 768;

  useEffect(() => {
    if (addNewNhan) {
      setLableNewName('');
      setDescriptionLable('');
    }
  }, [addNewNhan]);


  function handleShowModalEditLabel(value) {
    setStateEditLabel({ isShowModal: true, editLabelSelected: value });
  }

  async function editLabel(dataForm) {
    const listLabelFilter = lables.filter(item => item._id !== stateEditLabel.editLabelSelected._id);
    const dataRequest = cloneObj(dataForm);
    setLoading(true);
    const data = {
      'labelName': dataRequest.labelName,
      'description': dataRequest.description,
      'datasetId': id,
    };
    if (dataRequest.labelName && listLabelFilter.findIndex(i => i?.labelName === dataRequest.labelName) === -1) {
      const api = await changeLabelName(stateEditLabel.editLabelSelected._id, data);
      if (api) {
        setLoading(false);
        setStateEditLabel({ isShowModal: false, editLabelSelected: null });
        await getDatasetDetail();
        toast(CONSTANTS.SUCCESS, t('DA_THAY_DOI_TEN_NHAN'));
      }
    } else {
      toast(CONSTANTS.ERROR, `${t('NHAN')} ` + dataRequest.labelName + ` ${t('DA_TON_TAI')}`);
    }
    setLoading(false);
  }

  async function handleDeleteLabel(value) {
    // console.log('value', value);
    // const existImageContainLabel = imageContainLabel.find(
    //   (image) => image.name === label.name && image.numberImage !== 0,
    // );
    // if (existImageContainLabel) {
    //   return toast(CONSTANTS.ERROR, `Không thể xóa nhãn ${label.name} vì còn tồn tại ảnh chứa nhãn ${label.name}`);
    // }
    setLoading(true);
    const api = await deleteLabelID(value._id);
    if (api) {
      setLoading(false);
      await getDatasetDetail();
      toast(CONSTANTS.SUCCESS, t('DA_XOA_TEN_NHAN_THANH_CONG'));
    }
  }

  // function handleChangeFilter() {
  //   setCheckSearch(true);
  //   const value = lables.filter((i) => i.labelName.toLowerCase().includes(formFilter.getFieldValue().filter.toLowerCase()));
  //   setFilterLabel(value);
  // }

  // const checkLabel = checkSearch ? filterLabel : lables;
  // const listLabel = checkLabel.map((item, index) => {
  //   return { key: index, ...item };
  // });

  const labelColumns = [
    { title: t('TEN_NHAN'), dataIndex: 'labelName' },
    {
      title: t('THAO_TAC'),
      align: 'center',
      render: (value) => (
        <ActionCell
          value={value}
          handleEdit={handleShowModalEditLabel}
          handleDelete={handleDeleteLabel}
          editText={t('CHINH_SUA')}
          deleteText={t('XOA')}
          title={t('XOA_DU_LIEU')}
          okText={t('XOA')}
          cancelText={t('HUY')}
        />
      ),
      fixed: 'right',
      width: 500,
    },
  ];
  return (<>
      <CustomBreadcrumb breadcrumbLabel={t('CHINH_SUA_BO_DU_LIEU')}>
        <Row>
          <Button icon={<i className="fa fa-arrow-left mr-1"/>} type="primary" onClick={() => history.goBack()}>
            {t('QUAY_LAI')}
          </Button>
          <Button style={{ marginLeft: '10px' }} onClick={() => handleUpdate()} type="primary" className="pull-right">
            {t('CAP_NHAT')}
          </Button>
        </Row>
      </CustomBreadcrumb>
      <Loading active={loading} layoutBackground>
        <Row>
          <Col span={24}>
            <Title level={5}>{t('TEN_BO_DU_LIEU')}:</Title>
            <Input value={name} onChange={onChangeName}/>
            <Title style={{ marginTop: 20 }} level={5}>
              {t('MO_TA')}:
            </Title>
            <TextArea rows={2} value={description} onChange={onChangeDescription}/>
            <Title style={{ marginTop: 20 }} level={5}>
              {t('DANH_SACH_NHAN')}
            </Title>

            <Row>
              <Form form={formFilter} style={{ width: '30%' }}>
                <Form.Item name="filter">
                  {/*  <Input*/}
                  {/*    placeholder="Nhập tên nhãn muốn tìm kiếm ở đây"*/}
                  {/*    style={{ marginTop: '5px' }}*/}
                  {/*    onChange={debounce((e) => handleChangeFilter(e), 500)}*/}
                  {/*  />*/}
                </Form.Item>
              </Form>
              <Col className="ml-auto">
                <Button icon={<i className="fa fa-plus mr-1"/>} style={{ marginTop: '5px', marginLeft: '20px' }}
                        type="primary" onClick={() => setAddNewNhan(true)}>
                  {t('THEM_NHAN')}
                </Button>
              </Col>
            </Row>

            <Table
              size="small"
              bordered
              rowKey="key"
              style={{ width: '100%' }}
              columns={labelColumns}
              dataSource={lables}
              pagination={false}
              scroll={{ x: 'max-content' }}
            />
          </Col>
        </Row>
      </Loading>

      <EditLabel
        isModalVisible={stateEditLabel.isShowModal}
        handleOk={editLabel}
        handleCancel={() => setStateEditLabel({ isShowModal: false, editLabelSelected: null })}
        editLabelSelected={stateEditLabel.editLabelSelected}
      />

      <Modal
        title={<Text style={{ fontSize: '14px', fontWeight: '500', color: '#00199f' }}>{t('THEM_NHAN_MOI')}</Text>}
        visible={addNewNhan}
        onOk={() => handleAddNewLableName()}
        onCancel={() => {
          setAddNewNhan(false);
        }}
        okText={t('LUU')}
        cancelText={t('HUY')}>
        <CustomSkeleton
          label={t('TEN_NHAN')}
          layoutCol={layoutCol}
          labelCol={labelCol}
          rules={[RULES.REQUIRED]}>
          <Input value={lableNewName} onChange={addNewNameLable}/>
        </CustomSkeleton>
        <CustomSkeleton
          label={t('MO_TA')}
          layoutCol={layoutCol}
          labelCol={labelCol}
          rules={[RULES.REQUIRED]}>
          <Input value={descriptionLable} onChange={addNewDescriptionLable}/>
        </CustomSkeleton>
      </Modal>
    </>
  );
}

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps, null)(EditDataset);



