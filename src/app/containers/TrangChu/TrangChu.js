import React from "react";
import { connect } from "react-redux";

import "./TrangChu.scss";
import Dashboard from "../Dashboard";

function TrangChu() {
  return (
    <div className="homepage">
      <Dashboard />
    </div>
  );
}

function mapStateToProps(store) {
  const { isLoading } = store.app;
  return { isLoading };
}

export default connect(mapStateToProps)(TrangChu);
