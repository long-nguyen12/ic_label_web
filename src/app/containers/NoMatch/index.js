import React from 'react';
import { Button } from 'antd';
import { URL } from '@url';

import ERROR_404 from '@assets/images/icon/404_not_found.svg';
import './NoMatch.scss';

export default function NoMatch({ history }) {
  return <div id="no-match-container">
    <div id="no-match">
      <img className="img-not-found" src={ERROR_404} alt=""/>
      <div className="no-match__text"></div>
      <Button type="primary" className="btn no-match__btn" onClick={() => history.replace(URL.MENU.DASHBOARD)}>
        <span className="btn__title">
          Quay về
        </span>
      </Button>
    </div>
  </div>;
}
