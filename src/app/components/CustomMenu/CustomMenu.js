import React, { useEffect, useRef, useState } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Menu } from 'antd';
import { connect } from 'react-redux';

import { URL } from '@url';
import { ConstantsRoutes } from '@app/router/ConstantsRoutes';
import { checkPermission } from '@app/rbac/checkPermission';
import { checkLoaded, formatUnique } from '@app/common/functionCommons';

import * as app from '@app/store/ducks/app.duck';
import * as video from '@app/store/ducks/video.duck';


import './CustomMenu.scss';
import { useTranslation } from 'react-i18next';

function CustomMenu({ location, siderCollapsed, isBroken, myInfo, locationPathCode, locationVideo, ...props }) {
  const { t } = useTranslation();
  const keyRef = useRef([]);
  const [openKeys, setOpenKeys] = useState([]);
  const [pathnameFormat, setPathnameFormat] = useState(null);

  const { role } = myInfo;

  useEffect(() => {
    let { pathname } = location;

    function findPathname(pathname, key, value) {
      let pathReturn = pathname;
      if (key.includes('_ID') && key.indexOf('_ID') === key.length - 3) {
        const valueTemp = value.slice(0, value.length - 3);
        if (pathReturn.includes(valueTemp)) {
          pathReturn = value.format(':id');
        }
      }
      return pathReturn;
    }

    Object.entries(URL).forEach(([urlKey, urlValue]) => {
      if (typeof urlValue === 'string') {
        pathname = findPathname(pathname, urlKey, urlValue);
      }
      if (typeof urlValue === 'object') {
        Object.entries(urlValue).forEach(([menuKey, menuValue]) => {
            pathname = findPathname(pathname, menuKey, menuValue);
          },
        );
      }
    });
    props.setLocationPathCode(pathname);
    checkLocationVideo(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (siderCollapsed) {
      keyRef.current = openKeys;
      setOpenKeys([]);
    } else {
      setOpenKeys(keyRef.current);
    }
  }, [siderCollapsed]);

  useEffect(() => {
    let keys = [...openKeys, ...keyRef.current];
    ConstantsRoutes.forEach((menu) => {
      if (!menu.hide && menu.menuName && Array.isArray(menu.children)) {
        menu.children.forEach((child) => {
          if (!child.hide && pathnameFormat && [child.key, child.path].includes(pathnameFormat)) {
            keys = formatUnique([...keys, 'path' + (menu.key || menu.path)]);
          }
        });
      }
    });

    if (checkLoaded()) {
      if (siderCollapsed) {
        keyRef.current = keys;
      } else {
        setOpenKeys(keys);
      }
    } else {
      window.onload = function() {
        setOpenKeys(keys);
      };
    }
  }, [pathnameFormat]);

  function handleCheckPermission(path) {
    return checkPermission(role, path);
  }

  function handleActiveMenuForComponentDetail(menu) {
    if (menu.path !== pathnameFormat) {
      if (menu.path === locationPathCode) {
        setPathnameFormat(menu.path);
      }

      if (Array.isArray(menu.children)) {
        menu.children.forEach(child => {
          if (child.path === locationPathCode) {
            setPathnameFormat(menu.path);
          }
        });
      }
    }
  }

  function renderItem(menu) {
    handleActiveMenuForComponentDetail(menu);
    if (menu.hide || !menu.menuName) return;
    let hasPermission = handleCheckPermission(menu.path);
    if (!hasPermission) return;
    return <Menu.Item key={menu.path} icon={menu.icon}>
      <Link to={menu.path}>{t(menu.menuName)}</Link>
    </Menu.Item>;
  }

  function handleTitleClick(value) {
    const { key } = value;
    if (openKeys.includes(key)) {
      setOpenKeys(openKeys.filter(openKey => openKey !== key));
    } else {
      setOpenKeys([...openKeys, key]);
    }
  }

  function renderSubItem(menu) {
    if (menu.hide) return;
    let hasPermission = handleCheckPermission(menu.path);
    if (menu.key) {
      let subMenuHasPermission = 0;
      menu.children.forEach(sub => {
        if (!sub.hide && handleCheckPermission(sub.path)) {
          subMenuHasPermission += 1;
        }
      });
      if (!subMenuHasPermission) {
        hasPermission = false;
      }
    }

    return <Menu.SubMenu
      key={'path' + menu.key}
      title={t(menu.menuName)}
      icon={menu.icon}
      onTitleClick={handleTitleClick}
      disabled={!hasPermission}
    >
      {hasPermission && menu.children.map((child) => {
        if (child.path) {
          return renderItem(child);
        }
        if (child.key && Array.isArray(child.children)) {
          return renderSubItem(child);
        }
      })}
    </Menu.SubMenu>;
  }

  const menuItem = ConstantsRoutes.map((menu) => {
    if (menu.path) {
      return renderItem(menu);
    }
    if (menu.key && Array.isArray(menu.children)) {
      return renderSubItem(menu);
    }
  });

  function checkLocationVideo(path) {
    let isCheck = -1;
    if (path.indexOf('/monitoring-camera/') !== -1 || path.indexOf('/create-identifie') !== -1 || path.indexOf('/identified/') !== -1) {
      isCheck = 0;
    }
    switch (isCheck) {
      case 0:
        break;
      default:
        if (locationVideo) {
          locationVideo.destroy();
          props.clearVideo();
        }
        break;
    }
  }

  return <div style={{ height: '100%', overflow: 'hidden' }}>
    <div className={`sider-logo ${(siderCollapsed && !isBroken) ? 'collapsed' : ''}`}>
      <h3 style={{color:"#00199F" }}>  <center>  <b> {(siderCollapsed && !isBroken) ? "" : "ADMIN PANEL" } </b></center> </h3>
    </div>
    <div className="custom-scrollbar aside-menu">
      <Menu
        mode="inline" className="main-menu"
        {...siderCollapsed ? {} : { openKeys }}
        selectedKeys={[pathnameFormat]}
        expandIcon={({ isOpen }) => {
          if (!siderCollapsed)
            return <div className="expand-icon">
              <i className={`fa fa-chevron-right ${isOpen ? 'fa-rotate-90' : ''}`} aria-hidden="true"/>
            </div>;
          return null;
        }}>
        {menuItem}
      </Menu>
    </div>
  </div>;

}

function mapStateToProps(store) {
  const { siderCollapsed, isBroken, locationPathCode } = store.app;
  const { myInfo } = store.user;
  const { locationVideo } = store.video;
  return { siderCollapsed, isBroken, locationPathCode, myInfo, locationVideo };
}

export default connect(mapStateToProps, { ...app.actions, ...video.actions })(withRouter(CustomMenu));
