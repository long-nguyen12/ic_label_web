import React from 'react';
import { Button, Col, Form, Input, Row } from 'antd';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { isAndroid, isIOS } from 'react-device-detect';
import { useTranslation } from 'react-i18next';

import AuthBase from '@containers/Authenticator/AuthBase';

// import { RULES } from '@constants';
import { API } from '@api';

import * as app from '@app/store/ducks/app.duck';

function Login({ history, isLoading, ...props }) {
  const { t } = useTranslation();

  function handleLogin(value) {
    props.login(value, history);
  }

  return <AuthBase>
    <Form size="large" layout="vertical" onFinish={handleLogin}>
      <Form.Item label={t('TAI_KHOAN')} name="user_name" rules={[{ required: true, message: t('REQUIRED') }]}>
        <Input placeholder={t('TAI_KHOAN')} disabled={isLoading}/>
      </Form.Item>
      <Form.Item label={t('MAT_KHAU')} name="user_pass" rules={[{ required: true, message: t('REQUIRED') }]}>
        <Input.Password placeholder="********" disabled={isLoading}/>
      </Form.Item>

      <Row className="pt-2">
        <Button type="primary" htmlType="submit" loading={isLoading}>{t('LOGIN')}</Button>
      </Row>
    </Form>
    {/*<div className="mt-2">
      <Link to={URL.FORGET_PASSWORD}>
        Quên mật khẩu?
      </Link>
    </div>*/}
  </AuthBase>;
}

function mapStateToProps(store) {
  const { isLoading } = store.app;
  return { isLoading };
}

export default (connect(mapStateToProps, app.actions)(Login));
