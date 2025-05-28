import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import './ActionCell.scss';

function ActionCell({ ...props }) {
  const { allowView, allowEdit, allowDelete } = props;
  const { linkToView, viewText, handleView } = props;
  const { linkToEdit, editText, handleEdit, disabledEdit } = props;
  const { handleDelete, deleteText, disabledDelete, confirmDelete, deleteButtonProps } = props;
  const { title, okText, cancelText, value } = props;
  const { prefix, suffix } = props;

  const [linkView, setLinkView] = useState();

  useEffect(() => {
    if (linkToView && !linkToEdit) {
      setLinkView(linkToView);
    } else if (!linkToView && linkToEdit) {
      setLinkView(linkToEdit);
    }
  }, [linkToView, linkToEdit]);


  const deleteButton = <Button
    danger
    {...disabledDelete ? { disabled: true } : null}
    onClick={() => confirmDelete ? null : handleDelete(value)}>
    {deleteText}
  </Button>;

  function renderLinkToEditOrUpdate() {
    if (allowEdit) {
      if (!disabledEdit && linkToEdit) {
        return <Link to={linkToEdit}>
          <Button type="primary" ghost style={{ fontWeight: 'bold', marginRight: 10 }}>
            {editText}
          </Button>
        </Link>;
      }
      if (handleEdit || disabledEdit) {
        return <Button
          type="primary" ghost
          style={{ fontWeight: 'bold', marginRight: 10 }}
          onClick={() => handleEdit(value)}
          {...disabledEdit ? { disabled: true } : null}
        >
          {editText}
        </Button>;
      }
    }

    if (allowView) {
      if (linkView) {
        return <Link to={linkView}>
          <Button type="primary" ghost style={{ fontWeight: 'bold', marginRight: 10 }}>
            {viewText}
          </Button>
        </Link>;
      }
      if (handleView || handleEdit) {
        const handleViewOrEdit = handleView || handleEdit;
        return <Button
          type="primary" ghost
          style={{ fontWeight: 'bold', marginRight: 10 }}
          onClick={() => handleViewOrEdit(value)}
          {...disabledEdit ? { disabled: true } : null}
        >
          {viewText}
        </Button>;
      }
    }
  }

  return <div className="action-cell">
    {prefix}

    {renderLinkToEditOrUpdate()}

    {!disabledDelete && allowDelete && confirmDelete && <Popconfirm
      key={value._id + value._id} title={title}
      onConfirm={() => handleDelete(value)}
      cancelText={cancelText} okText={okText} okButtonProps={deleteButtonProps}>
      {deleteButton}
    </Popconfirm>}

    {(allowDelete && (disabledDelete || !confirmDelete)) && deleteButton}

    {suffix}
  </div>;
}

export default ActionCell;

ActionCell.propTypes = {
  handleEdit: PropTypes.func,
  allowEdit: PropTypes.bool,
  disabledEdit: PropTypes.bool,
  linkToEdit: PropTypes.string,
  handleDelete: PropTypes.func,
  allowDelete: PropTypes.bool,
  disabledDelete: PropTypes.bool,
  confirmDelete: PropTypes.bool,
  deleteText: PropTypes.string,
  title: PropTypes.string,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  value: PropTypes.object,
  editText: PropTypes.string,
  editIcon: PropTypes.any,

  allowView: PropTypes.bool,
  viewColor: PropTypes.string,
  linkToView: PropTypes.string,
  viewIcon: PropTypes.any,
  viewText: PropTypes.string,
  editColor: PropTypes.string,
};

ActionCell.defaultProps = {
  handleEdit: null,
  allowEdit: true,
  disabledEdit: false,
  linkToEdit: null,
  handleDelete: null,
  allowDelete: true,
  disabledDelete: false,
  confirmDelete: true,
  deleteText: 'Xoá',
  title: 'Xóa dữ liệu?',
  okText: 'Xóa',
  cancelText: 'Huỷ',
  value: {},
  editText: 'Sửa',
  editIcon: <EditOutlined/>,
  allowView: false,
  viewColor: 'geekblue',
  linkToView: null,
  viewIcon: <EyeOutlined/>,
  editColor: 'cyan',
  viewText: 'Chi tiết',

  deleteIcon: <DeleteOutlined/>,
  deleteColor: 'red',
  deleteButtonProps: { type: 'danger' },
};
