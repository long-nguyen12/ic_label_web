import React, { Suspense, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Switch, withRouter } from 'react-router-dom';
import { Layout } from 'antd';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

import Routes from '@app/router/Routes';
import LoginRoutes from '@app/router/LoginRoutes';
import Loading from '@components/Loading';
import HeaderMenu from '@components/Header/HeaderMenu';

import { URL } from '@url';
import { CONSTANTS } from '@constants';

import * as app from '@app/store/ducks/app.duck';
import * as user from '@app/store/ducks/user.duck';
import Menu from '@components/Menu';


const { Footer, Content } = Layout;

function App({ isLoading, siderCollapsed, token, history, myInfo, ...props }) {
  const { t } = useTranslation();
  const [isBroken, setBroken] = useState(false);
  const [isShowDrawer, setShowDrawer] = useState(false);
  useEffect(() => {
    props.getToken();
    handleLogoutAllTab();
  }, []);

  useEffect(() => {
    if (token && token !== CONSTANTS.INITIAL) {
      props.requestUser(history);
    }
  }, [token]);

  function handleLogoutAllTab() {
    window.addEventListener('storage', (event) => {
      if (event.storageArea === localStorage) {
        let isLogout = localStorage.getItem(window.location.host + 'logout');
        if (isLogout) {
          props.clearToken();
        } else {
          const cookiesToken = Cookies.get('token');
          props.setToken(cookiesToken);
          history.replace(URL.MENU.DASHBOARD);
        }
      }
    }, false);
  }

  function onBreakpoint(broken) {
    setBroken(broken);
    setShowDrawer(false);
  }

  function toggleCollapsed() {
    if (isBroken) {
      setShowDrawer(!isShowDrawer);
    } else {
      props.toggleSider(!siderCollapsed);
    }
  }

  if (token === CONSTANTS.INITIAL) return null;

  const isResetPassword = URL.RESET_PASSWORD === history?.location?.pathname;
  if (isResetPassword) {
    return <Suspense fallback={<Loading/>}>
      <LoginRoutes/>
    </Suspense>;
  }

  return <Layout>
    <Menu
      isBroken={isBroken}
      onBreakpoint={onBreakpoint}
      toggleCollapsed={toggleCollapsed}
      isShowDrawer={isShowDrawer}
      width={230}
    />
    <Layout className="site-layout">
      <HeaderMenu
        isBroken={isBroken}
        siderCollapsed={siderCollapsed}
        toggleCollapsed={toggleCollapsed}
      />
      <div id="content-container" className={`custom-scrollbar flex-column${!token ? ' login' : ''}`}>
        <div id="content">
          <Content className="site-layout-background">
            <Switch>
              <Routes/>
            </Switch>
          </Content>
        </div>

        {token && myInfo?._id &&
          <Footer id="footer" style={{ textAlign: 'center' }}>
            {/* <div className="power-by">
              <span className="power-by__text">{t('DUOC_PHAT_TRIEN_BOI')}</span>
              <span className="power-by__text">&nbsp;</span>
              <span className="power-by__text logo__think">FICT</span>
              <span className="power-by__text logo__labs">HDU</span>
            </div> */}
          </Footer>}
      </div>
    </Layout>

  </Layout>;
}


function mapStateToProps(store) {
  const { siderCollapsed, token } = store.app;
  const { myInfo } = store.user;
  return { siderCollapsed, token, myInfo };
}

export default (connect(mapStateToProps, { ...app.actions, ...user.actions })(withRouter(App)));
