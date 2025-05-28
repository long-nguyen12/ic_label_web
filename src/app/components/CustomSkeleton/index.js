import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Checkbox,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Skeleton, Slider,
  Spin,
  Switch,
  TimePicker, Tooltip,
  TreeSelect,
} from 'antd';
import { CONSTANTS, RULES } from '@constants';

import './CustomSkeleton.scss';
import { cloneObj } from '@app/common/functionCommons';
import { withTranslation } from 'react-i18next';

class FullLine extends Component {
  render() {
    if (this.props.isFullLine) {
      return <Col xs={24}>
        <Row>
          {this.props.children}
        </Row>
      </Col>;
    } else {
      return this.props.children;
    }
  }
}

class CustomSkeleton extends Component {
  renderDatePicker() {
    const { allowClear, placeholder, label, size, onChange } = this.props;
    const { type, showInputLabel, disabled, disabledDate, disabledTime } = this.props;
    const { picker, value, showNow, inputReadOnly, defaultValue } = this.props;
    let format = 'DD/MM/YYYY';
    switch (type) {
      case CONSTANTS.DATE:
        format = 'DD/MM/YYYY';
        break;
      case CONSTANTS.DATE_TIME:
        format = 'DD/MM/YYYY HH:mm';
        break;
      case CONSTANTS.TIME_DATE:
        format = 'HH:mm DD/MM/YYYY';
        break;
      default:
        break;
    }

    if (picker === CONSTANTS.YEAR) {
      format = 'YYYY';
    }

    return <DatePicker
      style={{ width: '100%' }}
      className={showInputLabel ? 'input-label' : ''}
      picker={picker.toLowerCase()}
      onChange={onChange}
      format={format}
      hideDisabledOptions
      showNow={showNow}
      inputReadOnly={inputReadOnly}
      showTime={type === CONSTANTS.DATE_TIME}
      allowClear={allowClear}
      placeholder={showInputLabel ? '' : (placeholder !== null ? placeholder : label)}
      disabledDate={disabledDate}
      disabledTime={disabledTime}
      size={size}
      value={value}
      defaultValue={defaultValue}
      disabled={showInputLabel || disabled}/>;
  }

  renderTimePicker() {
    const { allowClear, placeholder, label, size, onChange } = this.props;
    const { showInputLabel, disabled, disabledDate, disabledTime, value, showNow, timeFormat } = this.props;

    return <TimePicker
      style={{ width: '100%' }}
      format={timeFormat}
      showNow={showNow}
      minuteStep={15}
      className={showInputLabel ? 'input-label' : ''}
      onChange={onChange}
      allowClear={allowClear}
      placeholder={showInputLabel ? '' : (placeholder !== null ? placeholder : label)}
      disabledDate={disabledDate}
      disabledTime={disabledTime}
      size={size}
      value={value}
      disabled={showInputLabel || disabled}/>;
  }

  renderInput() {
    const { label, formatter,  onChange, prefix, suffix, size, placeholder, disabled, showInputLabel, value } = this.props;
    const { defaultValue } = this.props;
    return <Input
      className={showInputLabel ? 'input-label' : ''}
      placeholder={showInputLabel ? '' : (placeholder !== null ? placeholder : label)}
      onChange={onChange}
      onBlur={() => this.onBlur()}
      prefix={prefix}
      suffix={suffix}
      size={size}
      value={value}
      disabled={disabled || showInputLabel}
      {...defaultValue ? { defaultValue } : null}
    />;
  }

  renderInputNumber() {
    const { label, step, defaultValue,addonBefore, addonAfter, formatter, size, placeholder, disabled } = this.props;
    const { showInputLabel, onChange, value, max, min } = this.props;
    return <InputNumber
      className={showInputLabel ? 'input-label' : ''}
      style={{ width: '100%' }}
      value={value}
      onChange={onChange}
      placeholder={showInputLabel ? '' : (placeholder !== null ? placeholder : label)}
      onBlur={() => this.onBlur()}
      size={size}
      max={max}
      min={min}
      {...step ? { step } : null}
      {...defaultValue ? { defaultValue } : null}
      disabled={disabled || showInputLabel}
      formatter={formatter}
    />;
  }

  async onBlur() {
    const { form, name, formListName } = this.props;
    if (!form) return;

    if (formListName) {
      const formListData = form.getFieldsValue()[formListName];
      if (typeof formListData[name[0]][name[1]] === 'string' && formListData[name[0]][name[1]] !== formListData[name[0]][name[1]]?.trim()) {
        formListData[name[0]][name[1]] = formListData[name[0]][name[1]].trim();
        form.setFieldsValue({ [formListName]: formListData });
      }
    } else {
      const value = form.getFieldsValue()?.[name];
      if (typeof value === 'string' && value !== value?.trim()) {
        form.setFieldsValue({ [name]: value.trim() });
        form.validateFields([name]);
      }
      if (typeof value === 'number' && value !== value?.toString().trim()) {
        form.setFieldsValue({ [name]: value?.toString().trim() });
        form.validateFields([name]);
      }
    }
  }

  renderCheckBox() {
    return <Checkbox onChange={this.props.onChange}/>;
  }

  renderSwitch() {
    const { showInputLabel, onChange } = this.props;
    return <Switch disabled={showInputLabel} size={this.props.size} onChange={onChange}/>;
  }

  renderPassword() {
    return <Input.Password placeholder={this.props.placeholder || this.props.label}
                           autoComplete="new-password"
                           prefix={this.props.prefix}
                           suffix={this.props.suffix}
                           size={this.props.size}
                           disabled={this.props.disabled}/>;
  }

  renderSelect() {
    const { label, options, placeholder, filterOption, fetching, labelInValue } = this.props;
    const { allowClear, showInputLabel, defaultValue, bordered } = this.props;
    const { size, disabled, showSearch, onSearch, onChange, value, fieldNames, type, suffix } = this.props;

    const mode = type === CONSTANTS.SELECT ? '' : 'multiple';
    return <Select
      className={showInputLabel ? 'select-label' : ''}
      placeholder={showInputLabel ? '' : (placeholder || (label ? `Chọn ${label}` : ''))}
      size={size}
      value={value}
      disabled={showInputLabel || disabled}
      dropdownClassName="small"
      showSearch={showSearch}
      onSearch={onSearch}
      onChange={onChange}
      mode={mode}
      suffixIcon={suffix}
      notFoundContent={fetching
        ? <Spin size="small"/>
        : <Empty className="m-0" image={Empty.PRESENTED_IMAGE_SIMPLE}/>}
      filterOption={filterOption}
      labelInValue={labelInValue}
      allowClear={allowClear}
      {...defaultValue ? { defaultValue } : null}
      bordered={bordered}
    >
      {Array.isArray(options) && options.map(item => {
        return <Select.Option
          key={item[fieldNames?.key] || item.code || item.key || item.value}
          value={item[fieldNames?.key] || item.code || item.key || item.value}
          disabled={item.disabled}
          extra={item}>
          {item[fieldNames?.label] || item.label}
        </Select.Option>;
      })}
    </Select>;
  }

  renderArea() {
    const { label, showInputLabel, autoSize, size, disabled, placeholder, onChange, value, defaultValue, rows } = this.props;

    return <Input.TextArea
      style={size === 'default' ? { minHeight: '24px' } : {}}
      className={showInputLabel ? 'input-label' : ''}
      size={size}
      onBlur={() => this.onBlur()}
      placeholder={showInputLabel ? '' : (placeholder !== null ? placeholder : label)}
      disabled={showInputLabel || disabled}
      autoSize={autoSize}
      value={value}
      onChange={onChange}
      defaultValue={defaultValue}
      rows={rows}
    />;
  }

  renderLabel() {
    const { prefix, suffix, size } = this.props;
    return <Input className="input-label" prefix={prefix} suffix={suffix} size={size} disabled/>;
  }

  renderSelectLabel() {
    const { options, labelInValue, size } = this.props;

    return <Select className="select-label" size={size} dropdownClassName="small" labelInValue={labelInValue} disabled>
      {Array.isArray(options?.data) && options.data.map(item => {
        return <Select.Option
          key={item[fieldNames?.key || item.value]}
          value={item[fieldNames?.key || item.value]}>
          {item[fieldNames?.label || item.label]}
        </Select.Option>;
      })}
    </Select>;
  }

  renderTreeSelect() {
    const { treeData, childrenKey, showInputLabel, placeholder, idKey, titleKey, label, allowClear } = this.props;
    const { treeDefaultExpandAll, size, value, onChange, disabled, showSearch, disabledNode, multiple } = this.props;

    function renderTreeNode(nodeData) {
      if (!Array.isArray(nodeData)) return;
      return nodeData.map(node => {
        // console.log('----------------------');
        // console.log('node', node);
        const childNode = Array.isArray(node[childrenKey]) ? node[childrenKey] : node.children;
        // console.log('childNode', childNode);
        return <TreeSelect.TreeNode
          title={node[titleKey] || node.title}
          key={node.key}
          value={node[idKey] || node._id}
          disabled={disabledNode.includes(node[idKey] || node._id)}
        >
          {renderTreeNode(childNode)}
        </TreeSelect.TreeNode>;
      });
    }

    return <TreeSelect
      className={showInputLabel ? 'select-label' : ''}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      placeholder={showInputLabel ? '' : (placeholder !== null ? placeholder : label)}
      onChange={onChange}
      allowClear={allowClear}
      showSearch={showSearch}
      size={size}
      value={value}
      treeDefaultExpandAll={treeDefaultExpandAll}
      {...multiple ? { multiple } : null}
      disabled={showInputLabel || disabled}
      filterOption={(input, option) => option.title?.toLowerCase().includes(input.toLowerCase())}
    >
      {renderTreeNode(treeData)}
    </TreeSelect>;
  }

  renderSlider() {
    const { tooltipVisible, onChange, max, min, disabled, step } = this.props;
    return <Slider
      {...onChange ? { onChange } : null}
      {...max ? { max } : null}
      {...min ? { min } : null}
      {...step ? { step } : null}
      {...disabled ? { disabled } : null}
      {...tooltipVisible ? { tooltipVisible } : null}
    />;
  }

  formatRules() {
    const { t, rules, showInputLabel } = this.props;
    if (showInputLabel) return [];
    return cloneObj(rules)?.map((item, index) => {
      if (item?.langCode) {
        if (item?.pattern) {
          item.pattern = rules[index].pattern;
        }
        item.message = t(item.langCode);
        delete item.langCode;
      }
      return item;
    });
  }

  render() {
    const {
      order, prefixLabelImg, suffixLabel, tooltip,
      type, isShowSkeleton, rules, labelStrong, validateTrigger,
      showInputLabel, hasFeedback, disabled,
      layoutCol, style, fieldKey,
    } = this.props;

    const labelCol = this.props.labelCol;

    const wrapperCol = {};
    Object.entries(labelCol).forEach(([key, value]) => {
      wrapperCol[key] = value === 24 ? 24 : 24 - value;
    });
    if (this.props.wrapperCol) {
      Object.entries(this.props.wrapperCol).forEach(([key, value]) => {
        wrapperCol[key] = value;
      });
    }
    const label = this.props.label
      ? <>
        {prefixLabelImg && <img className="prefix-label" src={prefixLabelImg} alt=""/>}
        {labelStrong
          ? <strong>{this.props.label}</strong>
          : this.props.label}
        {suffixLabel}
        {tooltip && <Tooltip
          title={tooltip}
          color="#17A2B8"
        >
          <i className="fas fa-question-circle tooltip-icon"/>
        </Tooltip>}
        {rules.includes(RULES.REQUIRED) && !showInputLabel && <div className="required-icon"/>}
      </>
      : '';

    let inputHtml = this.props.children;
    switch (type) {
      case CONSTANTS.TEXT:
        inputHtml = this.renderInput();
        break;
      case CONSTANTS.NUMBER:
        inputHtml = this.renderInputNumber();
        break;
      case CONSTANTS.DATE:
      case CONSTANTS.TIME_DATE:
      case CONSTANTS.DATE_TIME:
        inputHtml = this.renderDatePicker();
        break;
      case CONSTANTS.TIME:
        inputHtml = this.renderTimePicker();
        break;
      case CONSTANTS.SELECT:
      case CONSTANTS.SELECT_MULTI:
        inputHtml = this.renderSelect();
        break;
      case CONSTANTS.TEXT_AREA:
        inputHtml = this.renderArea();
        break;
      case CONSTANTS.PASSWORD:
        inputHtml = this.renderPassword();
        break;
      case CONSTANTS.CHECK_BOX:
        inputHtml = this.renderCheckBox();
        break;
      case CONSTANTS.SWITCH:
        inputHtml = this.renderSwitch();
        break;
      case CONSTANTS.LABEL:
        inputHtml = this.renderLabel();
        break;
      case CONSTANTS.SELECT_LABEL:
        inputHtml = this.renderSelectLabel();
        break;
      case CONSTANTS.TREE_SELECT:
        inputHtml = this.renderTreeSelect();
        break;
      case CONSTANTS.SLIDER:
        inputHtml = this.renderSlider();
        break;
      default:
        break;
    }

    return <FullLine isFullLine={this.props.fullLine}>
      <Col {...layoutCol}
           {...order ? { order } : null}
           {...style ? { style } : null}
           className={(this.props.helpInline ? 'help-inline' : 'help-not-inline') + (this.props.className ? ` ${this.props.className}` : '')}>
        <Form.Item
          label={label}
          labelCol={labelCol}
          wrapperCol={wrapperCol}
          name={this.props.name}
          hasFeedback={rules.includes(RULES.REQUIRED) && hasFeedback && !disabled && !showInputLabel}
          className={this.props.itemClassName || ''}
          style={this.props.itemStyle || {}}
          colon={this.props.colon}
          rules={this.formatRules()}
          size={this.props.size}
          dependencies={this.props.dependencies}
          labelAlign={this.props.labelLeft ? 'left' : 'right'}
          validateTrigger={validateTrigger || (Array.isArray(rules) && rules.length ? ['onChange', 'onBlur'] : false)}
          valuePropName={type === CONSTANTS.SWITCH ? 'checked' : 'value'}
          validateStatus={this.props.validateStatus}
          help={this.props.help}
          {...fieldKey ? { fieldKey } : null}
        >
          {isShowSkeleton
            ? <Skeleton.Input active size={this.props.size} className="w-100"/>
            : inputHtml}
        </Form.Item>
      </Col>
    </FullLine>;
  }
}

CustomSkeleton.propTypes = {
  className: PropTypes.string,
  allowClear: PropTypes.bool,
  fullLine: PropTypes.bool,
  helpInline: PropTypes.bool,
  labelInValue: PropTypes.bool,
  rules: PropTypes.array,
  hasFeedback: PropTypes.bool,
  labelStrong: PropTypes.bool,
  colon: PropTypes.bool,
  hidden: PropTypes.bool,
  size: PropTypes.string,
  labelCol: PropTypes.object,
  layoutCol: PropTypes.object,
  itemStyle: PropTypes.object,
  labelLeft: PropTypes.bool,
  fetching: PropTypes.bool,
  showInputLabel: PropTypes.bool,
  filterOption: PropTypes.any,
  itemClassName: PropTypes.string,
  form: PropTypes.any,
  autoSize: PropTypes.object,
  picker: PropTypes.string,
  showNow: PropTypes.bool,
  inputReadOnly: PropTypes.bool,
  timeFormat: PropTypes.string,
  placeholder: PropTypes.string,
  bordered: PropTypes.bool,
  treeDefaultExpandAll: PropTypes.bool,
  prefixLabelImg: PropTypes.any,
  disabledNode: PropTypes.array,
};

CustomSkeleton.defaultProps = {
  className: '',
  allowClear: false,
  fullLine: false,
  helpInline: false,
  labelInValue: false,
  rules: [],
  hasFeedback: true,
  labelStrong: false,
  colon: true,
  hidden: false,
  size: 'default',
  labelCol: { xs: 24 },
  layoutCol: { xs: 24 },
  itemStyle: {},
  labelLeft: true,
  fetching: false,
  showInputLabel: false,
  filterOption: (input, option) => option.children.toLowerCase().includes(input.toLowerCase()),
  itemClassName: '',
  form: null,
  autoSize: { minRows: 5, maxRows: 5 },
  picker: 'date',
  showNow: true,
  inputReadOnly: false,
  timeFormat: 'HH:mm',
  placeholder: null,
  bordered: true,
  treeDefaultExpandAll: true,
  prefixLabelImg: null,
  disabledNode: [],
};

export default withTranslation()(CustomSkeleton);
