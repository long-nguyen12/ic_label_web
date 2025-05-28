import React from 'react';
import { Button } from 'antd';
import { CloseSquareFilled, SaveFilled, CheckSquareFilled } from '@ant-design/icons';

import { CONSTANTS } from '@constants';


function ModalFooter({
                       handleClose = () => null,
                       handleSubmit = () => null,
                       isDisabledClose = false,
                       isDisabledSubmit = false,
                       isLoadingClose = false,
                       isLoadingSubmit = false,
                       submitType = CONSTANTS.SAVE,
                       cancelType = CONSTANTS.CANCEL,
                       formId = 'formModal',
                       ...props
                     }) {
  let { submitLabel, closeLabel, submitIcon, closeIcon } = props;
  if (!submitLabel) {
    switch (submitType) {
      case CONSTANTS.SAVE:
        submitLabel = 'Lưu';
        submitIcon = <SaveFilled/>;
        break;
      case CONSTANTS.CONFIRM:
        submitLabel = 'Xác nhận';
        submitIcon = <CheckSquareFilled/>;
        break;
      default:
        break;
    }
  }

  if (!closeLabel) {
    closeIcon = <CloseSquareFilled/>;
    switch (cancelType) {
      case CONSTANTS.CANCEL:
        closeLabel = 'Hủy';
        break;
      case CONSTANTS.CLOSE:
        closeLabel = 'Đóng';
        break;
      default:
        break;
    }
  }

  return [
    <Button key={1} size="small" type="danger" onClick={handleClose} disabled={isDisabledClose}
            loading={isLoadingClose} icon={closeIcon}>
      {closeLabel}
    </Button>,
    <Button key={2} size="small" type="primary" htmlType="submit" form={formId} disabled={isDisabledSubmit}
            loading={isLoadingSubmit && !isDisabledSubmit} icon={submitIcon}>
      {submitLabel}
    </Button>,
  ];
}

export default ModalFooter;
