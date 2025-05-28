import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { CheckOutlined } from '@ant-design/icons';
import { Badge, Dropdown, Empty, Menu, Skeleton } from 'antd';

import { URL } from '@url';
import { getAllNotification } from '@app/services/Notification';
import { formatTimeDate } from '@app/common/functionCommons';
import { useTranslation } from 'react-i18next';

import Notification from '@components/Notification/Notification';
import NOTIFICATION from '@assets/images/icon/notification.svg';
import STAR_UNREAD from '@assets/images/icon/star-unread.svg';
import STAR_READ from '@assets/images/icon/star-read.svg';

const PAGE_SIZE = 10;

function Notifications({ myInfo, token }) {
  const { t } = useTranslation();

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const socket = useRef();
  const countNotification = useRef({});
  const dataNotification = useRef({
    docs: [],
    currentPage: 1,
    totalDocs: 0,
    hasNextPage: false,
  });

  const [desktopNotification, setDesktopNotification] = useState({ ignore: true, title: '' });

  // React.useEffect(() => {
  //   socket.current = io('/', { 'transports': ['websocket'], path: '/socket' });
  // }, []);
  //
  // React.useEffect(() => {
  //   if (myInfo && myInfo._id) {
  //     socket.current.emit('user_login_id', { user_id: myInfo._id, token });
  //     socket.current.on('notification_count', setNotificationCount);
  //     socket.current.on('notification_updated_one', handleUpdateOne);
  //     socket.current.on('notification_updated_all', handleUpdateAll);
  //     socket.current.on('notification_new', handleNewNotification);
  //   }
  // }, [myInfo]);

  React.useEffect(() => {
    getNotification();
  }, []);

  const [visibleNoti, setVisibleNoti] = useState(false);

  // function setNotificationCount(data) {
  //   countNotification.current = data;
  //   forceUpdate();
  // }
  //
  // function handleUpdateOne(notiChange) {
  //   notiChange = convertSnakeCaseToCamelCase(notiChange);
  //   dataNotification.current.docs = dataNotification.current.docs.map(doc => doc._id === notiChange._id ? notiChange : doc);
  //   forceUpdate();
  // }
  //
  // function handleUpdateAll() {
  //   dataNotification.current.docs = dataNotification.current.docs.map(doc => ({ ...doc, status: 'VIEWED' }));
  //   forceUpdate();
  // }

  async function getNotification(currentPage = dataNotification.current.currentPage,
  ) {
    // const apiResponse = await getAllNotification(currentPage, PAGE_SIZE);
    // if (apiResponse) {
    //   dataNotification.current = {
    //     docs: apiResponse.docs,
    //     totalDocs: apiResponse.totalDocs,
    //     currentPage: apiResponse.page,
    //     hasNextPage: apiResponse.hasNextPage,
    //   };
    //   forceUpdate();
    // }
  }


  useEffect(() => {
    $(document).ready(() => {
      document.getElementById('js-notification-list')?.addEventListener('scroll', initJs);
    });
    return () => {
      document.getElementById('js-notification-list')?.removeEventListener('scroll', initJs);
    };
  }, [visibleNoti]);

  function initJs() {
    let totalHeight = 0;
    $('#js-notification-list').children().each(function() {
      totalHeight = totalHeight + $(this).outerHeight(true);
    });
    const jsNotificationList = document.getElementById('js-notification-list');

    if (totalHeight === jsNotificationList.scrollTop + jsNotificationList.clientHeight && dataNotification.current.hasNextPage) {
      loadMoreNoti();
    }
  }

  async function loadMoreNoti() {
    const apiResponse = await getAllNotification(dataNotification.current.currentPage + 1, PAGE_SIZE);
    if (apiResponse) {
      dataNotification.current = {
        docs: [...dataNotification.current.docs, ...apiResponse.docs],
        totalDocs: apiResponse.totalDocs,
        currentPage: apiResponse.page,
        hasNextPage: apiResponse.hasNextPage,
      };
      forceUpdate();
    }
  }

  function handleReadNotification(noti) {
    if (noti.status === 'SENT') {
      socket.current.emit('user_viewed_one_notification', { _id: noti._id, user_id: noti.userId });
    }
    setVisibleNoti(false);
  }

  function handleViewAll() {
    socket.current.emit('user_viewed_all_notifications', { user_id: myInfo._id, token });
  }

  // function handleNewNotification(newNotification) {
  //   newNotification = convertSnakeCaseToCamelCase(newNotification);
  //   // add new
  //   const countNoti = cloneObj(dataNotification.current.docs).length;
  //   dataNotification.current.docs = [newNotification, ...dataNotification.current.docs];
  //   if (!(countNoti % PAGE_SIZE)) {
  //     dataNotification.current.docs.pop();
  //     dataNotification.current.hasNextPage = true;
  //   }
  //   forceUpdate();
  //
  //   /// desktop notification
  //   showDesktopNotification(newNotification);
  // }

  /// desktop notification
  // function showDesktopNotification(newNotification) {
  //   if (desktopNotification.ignore || !newNotification) {
  //     return;
  //   }
  //   const title = newNotification.title ? newNotification.title : 'Thông báo mới';
  //   const body = newNotification.content;
  //   const tag = newNotification._id;
  //   const icon = THINKLABS;
  //
  //   const options = {
  //     tag: tag,
  //     body: body,
  //     icon: icon,
  //     data: newNotification,
  //     lang: 'vi',
  //     dir: 'ltr',
  //     // sound: './sound.mp3',  // no browsers supported https://developer.mozilla.org/en/docs/Web/API/notification/sound#Browser_compatibility
  //   };
  //   setDesktopNotification({ ...desktopNotification, title: title, options: options });
  // }

  function handlePermissionGranted() {
    console.log('Permission Granted');
    setDesktopNotification({ ...desktopNotification, ignore: false });
  }

  function handlePermissionDenied() {
    console.log('Permission Denied');
    setDesktopNotification({ ...desktopNotification, ignore: true });
  }

  function handleNotSupported() {
    console.log('Web Notification not Supported');
    setDesktopNotification({ ...desktopNotification, ignore: true });
  }

  function handleNotificationOnError(e, tag) {
    console.log(e, 'Notification error tag:' + tag);
  }

  function handleNotificationOnClose(e, tag) {
    console.log(e, 'Notification closed tag:' + tag);
  }

  function handleNotificationOnShow(e, tag) {
    console.log(e, 'Notification shown tag:' + tag);
  }

  function handleNotificationOnClick(e, tag, notification) {
    e.preventDefault(); // prevent the browser from focusing the Notification's tab
    if (notification.status !== 'VIEWED') {
      socket.current.emit('user_viewed_one_notification', { _id: notification._id, user_id: notification.user_id });
    }
    window.open(notification?.payload?.link, '_blank');
  }

  /// !desktop notification
  function renderNotificationList() {
    const overlay = <Menu>
      <Menu.Item onClick={handleViewAll}>
        <CheckOutlined/>
        {t('DANH_DAU_TAT_CA_DA_DOC')}
      </Menu.Item>
    </Menu>;

    return <Menu id="js-notification-list" className="notification-list custom-scrollbar show-scrollbar">
      <Menu.Item disabled className="m-0 p-0">
        <div className="notification__header w-100">
          <div className="notification__header-text">{t('THONG_BAO')}</div>
          {!!countNotification.current.total && <Dropdown
            overlay={overlay} trigger={['click']} placement="bottomRight" arrow
            className="notification__header-menu"
            overlayClassName="dropdown-notification-menu"
          >
            <div>
              <i className="fas fa-ellipsis-h"/>
            </div>
          </Dropdown>}
        </div>
      </Menu.Item>
      {!!countNotification.current.total && <>
        {dataNotification.current.docs.map((noti, index) => {
          return <Menu.Item key={noti.key}>
            <Link to={noti.payload?.link || URL.MENU.DASHBOARD} onClick={() => handleReadNotification(noti)}>
              <div className="notification__avatar">
                <img src={noti.status === 'VIEWED' ? STAR_READ : STAR_UNREAD} alt=""/>
              </div>
              <div className={`notification__content ${noti.status === 'VIEWED' ? '' : 'unread'}`}>
                {noti.content}
                <div className="notification__time">{formatTimeDate(noti.thoiGianTao)}</div>
                <div className="notification__time">{index}</div>
              </div>
            </Link>
          </Menu.Item>;
        })}
        {dataNotification.current.hasNextPage && <Menu.Item disabled className="cursor-default">
          <div className="notification__avatar">
            <Skeleton.Avatar active size={30} shape="circle"/>
          </div>
          <div className={`notification__content `}>
            <Skeleton.Input style={{ width: 260 }} active size={14}/>
            <Skeleton.Input style={{ width: 260 }} active size={14}/>
            <Skeleton.Input style={{ width: 260 }} active size={14}/>
            <Skeleton.Input style={{ width: 100 }} active size={14}/>
          </div>
        </Menu.Item>}
      </>}

      {!countNotification.current.total &&
        <Menu.Item disabled className="cursor-default" style={{ placeContent: 'center', width: 320 }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
        </Menu.Item>}
    </Menu>;
  }

  return (
    <>
      <Dropdown
        visible={visibleNoti} onVisibleChange={setVisibleNoti}
        overlay={renderNotificationList} trigger={['click']} placement="bottomRight" arrow>
        <div className="notification-container">
          <div className="notification-bg"/>
          <Badge count={countNotification.current.unread} size="small">
            <img src={NOTIFICATION} alt=""/>
          </Badge>
        </div>
      </Dropdown>


      <Notification
        ignore={desktopNotification.ignore && desktopNotification.title !== ''}
        notSupported={handleNotSupported}
        onPermissionGranted={handlePermissionGranted}
        onPermissionDenied={handlePermissionDenied}
        onShow={handleNotificationOnShow}
        onClick={handleNotificationOnClick}
        onClose={handleNotificationOnClose}
        onError={handleNotificationOnError}
        timeout={5000}
        title={desktopNotification.title}
        options={desktopNotification.options}
      />
    </>
  );
}

function mapStateToProps(store) {
  const { isBroken } = store.app;
  const { token, workType } = store.app;
  const { myInfo } = store.user;
  return { isBroken, myInfo, token, workType };
}

export default (connect(mapStateToProps)(withRouter(Notifications)));
