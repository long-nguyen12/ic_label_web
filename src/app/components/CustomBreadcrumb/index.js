import React from 'react';
import { withRouter } from 'react-router-dom';

import './Breadcrumb.scss';

function CustomBreadcrumb({ id, breadcrumbLabel, location, token, ...props }) {

  return <>
    <div className="breadcrumb" {...id ? { id } : null}>
      <div className="breadcrumb-item">
        {breadcrumbLabel}
      </div>
      <div>
        {props.children}
      </div>
    </div>
  </>;
}

export default (withRouter(CustomBreadcrumb));
