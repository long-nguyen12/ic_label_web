import React from "react";
import { Popconfirm, Tag, Tooltip } from "antd";
import PropTypes from "prop-types";
import { LoadingOutlined } from "@ant-design/icons";

function TagAction({ color, className, disabled, style, onClick, label, icon, loading, zIndexTooltip, ...props }) {
  const { isConfirm, confirmTitle, confirmCancelText, confirmOkText, okButtonType, placement } = props;
  const { tooltip, tooltipColor, tooltipPlacement } = props;
  const { isSubmit, formId } = props;

  function renderTag(onClickFunc = null) {
    return (
      <Tag
        className={`tag-action ${className}`}
        color={disabled ? "default" : color}
        style={style}
        disabled={disabled}
        onClick={disabled ? () => null : onClickFunc}
      >
        {!!icon && (
          <div className={`tag-action__icon ${label ? "mr-1" : ""}`}>{loading ? <LoadingOutlined /> : icon}</div>
        )}
        {label ? <span>{label}</span> : null}
      </Tag>
    );
  }

  function renderSubmit() {
    const btnSubmit = React.useRef(null);

    return (
      <>
        <Tooltip
          placement={tooltipPlacement}
          title={tooltip}
          color={tooltipColor}
          {...(zIndexTooltip ? { zIndex: zIndexTooltip } : {})}
        >
          <button type="submit" ref={btnSubmit} form={formId} className="d-none" />
          {renderTag(() => btnSubmit.current?.click())}
        </Tooltip>
      </>
    );
  }

  if (isConfirm && !isSubmit) {
    return (
      <Popconfirm
        title={confirmTitle}
        onConfirm={onClick}
        cancelText={confirmCancelText}
        okText={confirmOkText}
        placement={placement}
        okButtonProps={{ htmlType: "submit", form: formId, type: okButtonType }}
      >
        {renderTag()}
      </Popconfirm>
    );
  }

  // if (isConfirm && !isSubmit) {
  //
  // }

  if (isSubmit && formId) {
    return renderSubmit();
  } else if (tooltip && !disabled) {
    return (
      <Tooltip
        placement={tooltipPlacement}
        title={tooltip}
        color={tooltipColor || color}
        {...(zIndexTooltip ? { zIndex: zIndexTooltip } : {})}
      >
        {renderTag(onClick)}
      </Tooltip>
    );
  }
  return renderTag(onClick);
}

TagAction.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  tooltip: PropTypes.string,
  tooltipColor: PropTypes.string,
  tooltipPlacement: PropTypes.string,
  onClick: PropTypes.func,

  placement: PropTypes.string,
  okButtonType: PropTypes.string,

  confirmOkText: PropTypes.string,
  confirmCancelText: PropTypes.string,
};

TagAction.defaultProps = {
  className: "",
  style: {},
  tooltip: null,
  tooltipColor: "",
  tooltipPlacement: "top",
  onClick: () => null,

  placement: "top",
  okButtonType: "danger",

  confirmOkText: "Xóa",
  confirmCancelText: "Hủy",
};

export default TagAction;
