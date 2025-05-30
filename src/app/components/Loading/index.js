import React from 'react';
import { Spin } from 'antd';
import PropTypes from 'prop-types';
import { Loading3QuartersOutlined } from '@ant-design/icons';
import ReactLoading from 'react-loading';

import './Loading.scss';
import { CONSTANTS } from '@constants';

export default function Loading({ id, active, className, minHeight, indicatorType, layoutBackground, ...props }) {
  const style = {};
  if (!props.children) {
    style.height = minHeight;
  }

  let indicator = <Loading3QuartersOutlined spin/>;
  if (indicatorType === CONSTANTS.BARS) {
    indicator = <ReactLoading height={32} width={32} type="bars" color="#fff"/>;
  }
  return (
    <div {...id ? { id } : {}}
         className={`loading-component${className ? ` ${className}` : ''}${layoutBackground ? ` site-layout-background` : ''}`}
         style={style}>
      {active && <div className="loading-backdrop">
        <Spin className="loading-spin"
              tip={props.tip ? props.tip : ''}
              size="large"
              indicator={indicator}
        />
      </div>}
      {props.children}
    </div>
  );
}

Loading.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
  minHeight: PropTypes.string,
  layoutBackground: PropTypes.bool,
};

Loading.defaultProps = {
  active: true,
  className: '',
  minHeight: '400px',
  layoutBackground: false,
};
