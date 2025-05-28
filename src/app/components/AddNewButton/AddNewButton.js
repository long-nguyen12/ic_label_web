import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

function AddNewButton({ size, onClick, linkTo, label, disabled, loading, className, permission }) {
  const permissionCreate = permission.create;
  return <React.Fragment>
    <div className={className}>
      {onClick && permissionCreate && <Button
        disabled={disabled}
        loading={loading}
        size={size}
        type="primary"
        className="float-right"
        icon={<i className="fa fa-plus mr-1"/>}
        onClick={onClick}
      >
        {label}
      </Button>}

      {linkTo && permissionCreate && <Link to={linkTo}>
        <Button
          size={size}
          disabled={disabled}
          type="primary"
          className="float-right"
          icon={<i className="fa fa-plus mr-1"/>}
        >
          {label}
        </Button>
      </Link>}
    </div>
  </React.Fragment>;

}

export default (AddNewButton);

AddNewButton.propTypes = {
  size: PropTypes.string,
  onClick: PropTypes.func,
  linkTo: PropTypes.string,
  disabled: PropTypes.bool,
  permission: PropTypes.object,
  loading: PropTypes.bool,
  label: PropTypes.string,
  className: PropTypes.string,
};

AddNewButton.defaultProps = {
  size: 'default',
  onClick: null,
  linkTo: null,
  disabled: false,
  permission: { create: true },
  loading: false,
  label: 'Thêm mới',
  className: 'clearfix mb-3',
};
