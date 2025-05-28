import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ConfigProvider } from 'antd';

import { CONSTANTS } from '@constants';

import viVN from 'antd/es/locale/vi_VN';
import enUS from 'antd/es/locale/en_US';

function CustomProvider({ children, rerenderProvider }) {
  const [locale, setLocale] = useState(viVN);

  useEffect(() => {
    const language = localStorage.getItem('i18nextLng');
    switch (language) {
      case CONSTANTS.LANG_VI:
        setLocale(viVN);
        break;
      case CONSTANTS.LANG_EN:
        setLocale(enUS);
        break;
      default:
        break;
    }
  }, [rerenderProvider]);

  return <ConfigProvider locale={locale}>
    {children}
  </ConfigProvider>;
}


function mapStateToProps(store) {
  const { rerenderProvider } = store.rerender;
  return { rerenderProvider };
}

export default connect(mapStateToProps)(CustomProvider);
