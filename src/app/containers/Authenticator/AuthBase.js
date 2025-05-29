import React from 'react';
import { Space, Typography } from 'antd';
const { Text, Link } = Typography;
import './AuthBase.scss';

import LOGO_VERTICAL from '@assets/images/logo/THINKLABS-LOGO.svg';

function AuthBase({ children }) {

  return <div id="login">
    <div className="login-form">
      <div style={{ textAlign: 'center' }}>
        <h2 style={{color:"#00199F"}}> <b> HỆ THỐNG GÁN NHÃN HÌNH ẢNH   </b> </h2>
      </div>
      {children}
    </div>
  </div>;
}

export default (AuthBase);
