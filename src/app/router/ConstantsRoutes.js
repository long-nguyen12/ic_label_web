import { CheckIcon, FileIcon, UserIcon, HomeIcon } from "@app/components/Icons";
import Information from "@containers/Information";
import Position from "@containers/Position";
import PositionDetail from "@containers/Position/PositionDetail/PositionDetail";
import { URL } from "@url";
import React, { lazy } from "react";
import UploadScreen from "../containers/Upload";
import User from "../containers/User";
import Gallery from "../containers/Dataset/Gallery/Gallery";
import UserDetail from "../containers/User/UserDetail/UserDetail";

const MyInfo = lazy(() => import("@containers/MyInfo/MyInfo"));
const Account = lazy(() => import("@containers/Account/index"));
import { InboxOutlined } from "@ant-design/icons";
import Dashboard from "../containers/Dashboard";
import Dataset from "../containers/Dataset";
import History from "../containers/History";
import DatasetDetail from "../containers/Dataset/DatasetDetail/DatasetDetail";
import DatasetEdit from "../containers/Dataset/DatasetEdit/DatasetEdit";

function renderIcon(icon) {
  return (
    <span role="img" className="main-menu__icon">
      <div className="position-absolute" style={{ top: "50%", transform: "translateY(-50%)" }}>
        <div className="position-relative" style={{ width: "30px", height: "30px" }}>
          {icon}
        </div>
      </div>
    </span>
  );
}

export const ConstantsRoutes = [
  // { isRedirect: true, from: '/', to: URL.MENU.DASHBOARD },

  {
    path: URL.MENU.DASHBOARD,
    menuName: "Dashboard",
    component: Dashboard,
    icon: renderIcon(<HomeIcon />),
    permission: [],
  },
  // {
  //   path: URL.MENU.DATASET,
  //   menuName: "Tải lên dataset",
  //   component: UploadScreen,
  //   icon: renderIcon(<FileIcon />),
  //   permission: [],
  // },
  {
    path: URL.MENU.DATASET_MANAGEMENT,
    menuName: "Quản lý dataset",
    component: Dataset,
    icon: renderIcon(<FileIcon />),
    permission: [],
    children: [
      { path: URL.DATASET_MANAGEMENT_ID.format(":id"), component: DatasetDetail, permission: [] },
      { path: URL.DATASET_ID.format(":id"), component: DatasetEdit, permission: [] },
    ],
  },
  {
    path: URL.USER_MANAGEMENT,
    menuName: "Quản lí người dùng",
    component: User,
    icon: renderIcon(<UserIcon />),
    permission: ["admin"],
    children: [{ path: URL.USER_MANAGEMENT_ID.format(":id"), component: UserDetail, permission: ["admin"] }],
  },
  {
    path: URL.POSITION,
    menuName: "Quản lý chức vụ",
    component: Position,
    icon: renderIcon(<FileIcon />),
    children: [
      {
        path: URL.POSITION_ID.format(":id"),
        component: PositionDetail,
        permission: [],
      },
    ],
    permission: [],
  },
  {
    path: URL.MENU.HISTORY,
    menuName: "Lịch sử hoạt động",
    component: History,
    icon: renderIcon(<CheckIcon />),
    permission: [],
  },
  {
    path: URL.MENU.INFOMATION,
    menuName: "Thông tin phần mềm",
    component: Information,
    icon: renderIcon(<CheckIcon />),
    permission: [],
  },

  // not render in menu
  { path: URL.MY_INFO, breadcrumbName: "Thông tin cá nhân", component: MyInfo, permission: [] },
  { 
    path: URL.GALLGERY,
    breadcrumbName: "Chi tiết hình ảnh",
    children: [
      {
        path: URL.GALLGERY_ID.format(":id"),
        component: Gallery,
        permission: [],
      },
    ],
   },
];

