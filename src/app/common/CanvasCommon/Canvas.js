import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Polygon from './Polygon';
import Rectangle from './Rectangle';
import { CONSTANTS } from '@constants';
import { COLOR } from '@app/common/CanvasCommon/ColorConstants';
import { checkPointInsideObject } from '@app/common/functionCommons';
import { checkRangePoint, convertPolygonToOffset, getPolygons } from '@app/common/CanvasCommon/function';

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

class Canvas extends Component {
  constructor(props) {
    super(props);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.endPaintEvent = this.endPaintEvent.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseMovePolygon = this.onMouseMovePolygon.bind(this);
    this.onDrawPolyline = this.onDrawPolyline.bind(this);
    this.objectMove = false;
    this.objectSelected = { check: false, index: 0, position: {} };
    this.movePoint = false;
    this.posMove = { position: {}, index: {} };
    this.isPainting = false;
    this.enabled = this.props.enabled;
    this.line = [];
    this.activeIndex = -1;
    this.prevPos = { offsetX: 0, offsetY: 0 };
    this.prevPosPolygon = [];
    this.position = {};
  }


  componentDidMount() {
    this.props.onRef(this);
    this.initData();
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  componentDidUpdate(prevProps) {
    let { width, height, drawType, enabled, activeIndex, data } = this.props;

    if (width !== prevProps.width || height !== prevProps.height) {
      this.initData();
    }
    if (drawType !== prevProps.drawType) {
      this.prevPos = { offsetX: 0, offsetY: 0 };
      this.prevPosPolygon = [];
      this.position = { start: {}, stop: {} };
      this.isPainting = false;
    }
    if (enabled !== prevProps.enabled) {
      this.enabled = enabled;
    }
    if (activeIndex !== prevProps.activeIndex) {
      this.activeIndex = activeIndex;
      // this.forceUpdate()
      this.drawData();
    }
    if (data !== prevProps.data) {
      let line = clone(data.data);

      for (let i = 0; i < line.length; i++) {
        let itemRectangle = clone(line[i]);

        // convert percent to pixel
        if (itemRectangle.type === 'RECTANGLE') {
          itemRectangle.position.width = itemRectangle.width * this.props.width;
          itemRectangle.position.height = itemRectangle.height * this.props.height;
          itemRectangle.position.offsetX = itemRectangle.x * this.props.width;
          itemRectangle.position.offsetY = itemRectangle.y * this.props.height;
          line[i] = this.handleCreateRectangle(itemRectangle);
        } else {
          if (Array.isArray(itemRectangle.position) && Array.isArray(itemRectangle.polygons)) {
            let position = [];
            itemRectangle.polygons.forEach(polygon => {
              const itemPush = {
                offsetX: polygon.offsetX * this.props.width,
                offsetY: polygon.offsetY * this.props.height,
              };
              position = [...position, itemPush];
            });
            itemRectangle.position = position;
          }
          line[i] = this.handleCreatePolygon(itemRectangle);
        }
      }
      this.line = line;
      this.drawData();
    }
  }

  onMouseDown(e) {
    const { offsetX, offsetY } = e.nativeEvent;
    const { thietBiEditing, batThuongEditing, thietBiNew, batThuongNew } = this.props;

    if (!this.isPainting && (batThuongEditing || thietBiEditing || thietBiNew || batThuongNew)) {
      const pointClicked = this.checkPointClicked(offsetX, offsetY);
      const canvasEditing = this.getCanvasEditing();

      const polygon = getPolygons(canvasEditing);
      if (pointClicked.check) {
        // moving points
        this.onMouseDownMovePoint(e, offsetX, offsetY);
      } else {
        if (checkPointInsideObject({ offsetX, offsetY }, polygon)) {
          // moving objects
          e.stopPropagation();
          this.onMouseDownMoveObject(offsetX, offsetY);
        }
      }
    }

    // drawing
    if (!this.enabled) return;
    this.isPainting = true;
    if (this.props.drawType === 'RECTANGLE') {
      this.onMouseDownRec(offsetX, offsetY);
    } else if (this.props.drawType === 'POLYGON') {
      this.onMouseDownPol(offsetX, offsetY);
    }
  }

  onMouseMove({ nativeEvent }) {
    const { offsetX, offsetY } = nativeEvent;
    const { width, height, screenPosition, viewImageSize, zoom } = this.props;
    this.props.setOffsetMouse(offsetX, offsetY);

    const positionXPixel = (offsetX - screenPosition.x * width);
    const positionYPixel = (offsetY - screenPosition.y * height);

    const positionOffsetZoomX = ((100 * positionXPixel / (viewImageSize.width * zoom)) - 50) * -1;
    const positionOffsetZoomY = ((100 * positionYPixel / (viewImageSize.height * zoom)) - 50) * -1;

    this.props.setOffsetZoom(positionOffsetZoomX, positionOffsetZoomY);

    // set cursor
    this.setMouseCursor(offsetX, offsetY);
    // moving objects
    if (this.objectMove) {
      this.onMouseMoveObject(offsetX, offsetY);
    }
    // move point
    if (this.movePoint) {
      this.onMouseMovePoint(offsetX, offsetY);
    }

    if (!this.enabled) return;

    if (this.isPainting) {
      if (this.props.drawType === 'RECTANGLE') {
        this.onMouseMoveRectangle(offsetX, offsetY);
      } else if (this.props.drawType === 'POLYGON') {
        this.onMouseMovePolygon(offsetX, offsetY);
      }
    }
  }

  checkMidpointClicked(offsetX, offsetY) {
    let check = false;
    for (let i = 0; i < this.line.length; i++) {
      let item = this.line[i];
      if (item.type === 'POLYGON') {
        for (let j = 0; j < item.position.length; j++) {
          let point1 = item.position[j];
          let point2 = item.position[(j < item.position.length - 1) ? j + 1 : 0];
          const midpoint = {
            offsetX: (point1.offsetX + point2.offsetX) / 2,
            offsetY: (point1.offsetY + point2.offsetY) / 2,
          };
          check = checkRangePoint(offsetX, offsetY, midpoint.offsetX, midpoint.offsetY, 10);
          if (check) {
            return {
              check: true,
              type: item.type,
              position: { offsetX: midpoint.offsetX, offsetY: midpoint.offsetY },
              index: { i: i, j },
            };
          }
        }
      }
    }
    return { check };
  }

  onMouseDownMovePoint(e, offsetX, offsetY) {
    let checkPointClicked = this.checkPointClicked(offsetX, offsetY);
    let checkMidpointClicked = this.checkMidpointClicked(offsetX, offsetY);

    if (checkPointClicked.check && !this.objectMove) {
      e.stopPropagation();

      this.movePoint = true;
      this.posMove = {
        position: checkPointClicked.position,
        index: checkPointClicked.index,
        type: checkPointClicked.type,
        item: checkPointClicked.item,
      };
    } else if (checkMidpointClicked.check && !this.objectMove) {
      // create midpoint
      let item = this.line[checkMidpointClicked.index.i];
      this.line[checkMidpointClicked.index.i].position.splice(checkMidpointClicked.index.j + 1, 0, checkMidpointClicked.position);
      let polygons = [];
      this.line[checkMidpointClicked.index.i].position.forEach((item, index) => {
        const itemPush = {
          offsetX: item.offsetX / this.props.width,
          offsetY: item.offsetY / this.props.height,
        };
        polygons = [...polygons, itemPush];
      });
      this.line[checkMidpointClicked.index.i].polygons = polygons;
      this.onMouseDownMovePoint(e, offsetX, offsetY);
    } else if (!this.isPainting && !this.objectMove) {
      this.props.activeIndexChange(-1);
    }
  }

  getCanvasEditing() {
    const { thietBiEditing, batThuongEditing, thietBiNew, batThuongNew } = this.props;
    let canvasEditing = null;
    if (thietBiEditing) {
      canvasEditing = JSON.parse(JSON.stringify(this.line)).find(line => line.key === thietBiEditing?.key);
    }
    if (batThuongEditing) {
      canvasEditing = JSON.parse(JSON.stringify(this.line)).find(line => line.key === batThuongEditing?.key);
    }
    if (thietBiNew) {
      canvasEditing = JSON.parse(JSON.stringify(this.line)).find(line => line.key === thietBiNew?.key);
    }
    if (batThuongNew) {
      canvasEditing = JSON.parse(JSON.stringify(this.line)).find(line => line.key === batThuongNew?.key);
    }
    return canvasEditing;
  }

  onMouseDownMoveObject(offsetX, offsetY) {
    const canvasEditing = this.getCanvasEditing();
    if (canvasEditing?.drawing) {
      const objectSelected = {
        position: canvasEditing,
        prevPos: { offsetX, offsetY },
      };
      this.objectMove = true;
      this.objectSelected = objectSelected;
    }

  }

  onMouseDownRec(offsetX, offsetY) {
    this.prevPos = { offsetX, offsetY };
  }

  formatSaveDataPolygon(offsetX, offsetY) {

    const { screenPosition, width, height } = this.props;
    const { scaleWidthRatio, scaleHeightRatio } = this.props.ratio;

    return {
      offsetX: ((offsetX / width) - screenPosition.x) / scaleWidthRatio,
      offsetY: ((offsetY / height) - screenPosition.y) / scaleHeightRatio,
    };
  }

  formatGetDataPolygon(offsetX, offsetY) {
    const { screenPosition, width, height } = this.props;
    const { scaleWidthRatio, scaleHeightRatio } = this.props.ratio;

    return {
      offsetX: ((offsetX * scaleWidthRatio) + screenPosition.x) * width,
      offsetY: ((offsetY * scaleHeightRatio) + screenPosition.y) * height,
    };

  }

  onMouseDownPol(offsetX, offsetY) {
    const { screenPosition, viewImageSize, zoom, width, height } = this.props;

    // check the straight line intersecting
    if (false && this.prevPosPolygon.length > 2) {
      let A = { offsetX: offsetX, offsetY: offsetY },
        B = {
          offsetX: this.prevPosPolygon[this.prevPosPolygon.length - 1].offsetX,
          offsetY: this.prevPosPolygon[this.prevPosPolygon.length - 1].offsetY,
        };
      for (let i = 0; i < this.prevPosPolygon.length - 2; i++) {
        let C = { offsetX: this.prevPosPolygon[i].offsetX, offsetY: this.prevPosPolygon[i].offsetY };
        let D = { offsetX: this.prevPosPolygon[i + 1].offsetX, offsetY: this.prevPosPolygon[i + 1].offsetY };
        if (this.checkIntersecting(A, B, C, D)) {
          alert(this.props.warning);
          return;
        }
      }
    }


    const index = this.prevPosPolygon.length - 1;
    if (this.prevPosPolygon[index]) {
      this.onDrawPolyline(this.prevPosPolygon);
    }

    if (this.prevPosPolygon[0]) {
      const offset = this.formatGetDataPolygon(this.prevPosPolygon[0].offsetX, this.prevPosPolygon[0].offsetY);

      if (checkRangePoint(offsetX, offsetY, offset.offsetX, offset.offsetY, 10)) {
        if (this.prevPosPolygon.length < 3) return;
        this.prevPosPolygon.map(position => {

          const offset = this.formatGetDataPolygon(position.offsetX, position.offsetY);

          position.offsetX = offset.offsetX / this.props.width;
          position.offsetY = offset.offsetY / this.props.height;
          return position;
        });

        let polygon = new Polygon({
          type: 'POLYGON',
          position: this.prevPosPolygon,
          strokeStyle: this.props.strokeStyle,
          activeStrokeStyle: this.props.activeStrokeStyle,
          display: true,
          active: false,
          disabled: false,
        });

        this.line.push(polygon); // draw
        this.prevPosPolygon = [];
        this.isPainting = false;
        return;
      }
    }

    const offset = this.formatSaveDataPolygon(offsetX, offsetY);

    this.prevPosPolygon.push({
      offsetX: offset.offsetX,
      offsetY: offset.offsetY,
    });
  }

  setMouseCursor(offsetX, offsetY) {
    const { drawType, thietBiEditing, batThuongEditing, thietBiNew, batThuongNew } = this.props;
    let cursor = '';
    if (thietBiEditing || batThuongEditing || thietBiNew || batThuongNew) {
      if (drawType) {
        cursor = 'crosshair';
      } else {
        const canvasEditing = this.getCanvasEditing();
        if (canvasEditing) {
          let polygon = getPolygons(canvasEditing);
          if (checkPointInsideObject({ offsetX, offsetY }, polygon)) {
            cursor = 'grab';
          }
        }
      }
    }
    if (this.canvas.style.cursor !== cursor) {
      this.canvas.style.cursor = cursor;
    }
  }

  onMouseMoveObject(offsetX, offsetY) {
    // if (!this.objectSelected.check) return;
    let item = clone(this.objectSelected.position);
    if (this.objectSelected.position.type === 'RECTANGLE')
      item = this.handleCreateRectangle(item);
    if (this.objectSelected.position.type === 'POLYGON')
      item = this.handleCreatePolygon(item);

    let x = offsetX - this.objectSelected.prevPos.offsetX;
    let y = offsetY - this.objectSelected.prevPos.offsetY;


    // todo: can't move

    if (item.type === 'POLYGON') {
      for (let i = 0; i < item.position.length; i++) {
        item.position[i].offsetX += x;
        item.position[i].offsetY += y;
        item.polygons[i].offsetX = item.position[i].offsetX / this.props.width;
        item.polygons[i].offsetY = item.position[i].offsetY / this.props.height;
      }
    }
    if (item.type === 'RECTANGLE') {
      item.position.offsetX += x;
      item.position.offsetY += y;
      item.x = item.position.offsetX / this.props.width;
      item.y = item.position.offsetY / this.props.height;
    }
    // this.line[this.objectSelected.index] = item;

    this.line = this.line.map(lineItem => {
      if (lineItem.key === this.objectSelected?.position?.key) {
        return item;
      }
      return lineItem;
    });


    this.drawData();
  }

  onMouseMovePoint(offsetX, offsetY) {
    let line = clone(this.line);
    for (let i = 0; i < line.length; i++) {
      let item = line[i];
      if (item.type === 'RECTANGLE')
        line[i] = this.handleCreateRectangle(item);
      if (item.type === 'POLYGON')
        line[i] = this.handleCreatePolygon(item);
    }

    if (this.posMove.type === 'POLYGON') {
      line[this.posMove.index.i].position[this.posMove.index.j] = { offsetX, offsetY };
      line[this.posMove.index.i].polygons[this.posMove.index.j] = {
        offsetX: offsetX / this.props.width,
        offsetY: offsetY / this.props.height,
      };
      this.line = line;
      this.drawData();
    }
    if (this.posMove.type === 'RECTANGLE') {
      let recPoint = this.posMove.item;
      if (this.posMove.index.j === 2) {
        let width = recPoint.width + (offsetX - this.posMove.position.offsetX);
        let height = recPoint.height + (offsetY - this.posMove.position.offsetY);
        line[this.posMove.index.i].position = {
          offsetX: recPoint.offsetX,
          offsetY: recPoint.offsetY,
          width: width,
          height: height,
        };

        line[this.posMove.index.i].x = recPoint.offsetX / this.props.width;
        line[this.posMove.index.i].y = recPoint.offsetY / this.props.height;
        line[this.posMove.index.i].width = width / this.props.width;
        line[this.posMove.index.i].height = height / this.props.height;
      }
      if (this.posMove.index.j === 0) {
        let width = recPoint.width - (offsetX - this.posMove.position.offsetX);
        let height = recPoint.height - (offsetY - this.posMove.position.offsetY);
        line[this.posMove.index.i].position = { offsetX: offsetX, offsetY: offsetY, width: width, height: height };

        line[this.posMove.index.i].x = offsetX / this.props.width;
        line[this.posMove.index.i].y = offsetY / this.props.height;
        line[this.posMove.index.i].width = width / this.props.width;
        line[this.posMove.index.i].height = height / this.props.height;
      }
      if (this.posMove.index.j === 1) {
        let width = recPoint.width + (offsetX - this.posMove.position.offsetX);
        let height = recPoint.height - (offsetY - this.posMove.position.offsetY);
        line[this.posMove.index.i].position = {
          offsetX: recPoint.offsetX,
          offsetY: offsetY,
          width: width,
          height: height,
        };

        line[this.posMove.index.i].x = recPoint.offsetX / this.props.width;
        line[this.posMove.index.i].y = offsetY / this.props.height;
        line[this.posMove.index.i].width = width / this.props.width;
        line[this.posMove.index.i].height = height / this.props.height;
      }
      if (this.posMove.index.j === 3) {
        let width = recPoint.width - (offsetX - this.posMove.position.offsetX);
        let height = recPoint.height + (offsetY - this.posMove.position.offsetY);
        line[this.posMove.index.i].position = {
          offsetX: offsetX,
          offsetY: recPoint.offsetY,
          width: width,
          height: height,
        };

        line[this.posMove.index.i].x = offsetX / this.props.width;
        line[this.posMove.index.i].y = recPoint.offsetY / this.props.height;
        line[this.posMove.index.i].width = width / this.props.width;
        line[this.posMove.index.i].height = height / this.props.height;

      }
      this.line = line;
      this.drawData();
    }
  }

  onMouseMoveRectangle(offsetX, offsetY) {
    const offSetData = { offsetX, offsetY };
    this.position = {
      start: this.prevPos,
      stop: offSetData,
    };
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.beginPath();
    this.line.forEach(item => {
      if (item.drawing) {
        item.render(this);
      }
    });

    let rectangle = new Rectangle({
      type: 'RECTANGLE',
      position: {
        width: this.position.stop.offsetX - this.position.start.offsetX,
        height: this.position.stop.offsetY - this.position.start.offsetY,
        offsetX: this.position.start.offsetX,
        offsetY: this.position.start.offsetY,
      },
      active: true,
      strokeStyle: this.props.strokeStyle,
      activeStrokeStyle: this.props.activeStrokeStyle,
      display: true,
      disabled: false,
    });
    rectangle.render(this);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  onMouseMovePolygon(offsetX, offsetY) {
    const { data, activeIndex, screenPosition, zoom, width, height } = this.props;

    const offSetData = { offsetX, offsetY };
    this.position = {
      start: this.prevPosPolygon[this.prevPosPolygon.length - 1],
      stop: offSetData,
    };
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.line.forEach(item => {
      if (item.drawing)
        item.render(this);
    });
    this.ctx.beginPath();
    this.onDrawPolyline(this.prevPosPolygon);
    const itemSelected = data.data[activeIndex];
    const colorFill = itemSelected?.activeStrokeStyle || COLOR.ACTIVE;
    this.ctx.strokeStyle = colorFill;
    this.ctx.fillStyle = colorFill;

    const pointMoveTo = this.formatGetDataPolygon(this.prevPosPolygon[this.prevPosPolygon.length - 1].offsetX, this.prevPosPolygon[this.prevPosPolygon.length - 1].offsetY);

    this.ctx.moveTo(pointMoveTo.offsetX, pointMoveTo.offsetY);
    this.ctx.lineTo(offsetX, offsetY);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  endPaintEvent() {
    if (this.objectMove) {
      this.objectSelected = { check: false, index: 0, position: {} };
      this.objectMove = false;
      this.props.onEndMove(this.line);
    }
    if (this.movePoint) {
      this.plusTwoPoint();
      this.movePoint = false;
      this.posMove = { position: {}, index: {} };
      this.props.onEndMove(this.line);
    }
    if (!this.enabled) return;
    if (this.isPainting) {
      if (this.props.drawType === CONSTANTS.RECTANGLE) {
        this.endPaintEventRec();
      }
    } else {
      if (this.props.drawType === CONSTANTS.POLYGON) {
        this.endPaintEventPol();
      }
    }
  }

  plusTwoPoint() {
    if (!this.props.plusTwoPoint) return;
    return;
    if (this.posMove.type === 'POLYGON') {
      let dataBefore = this.line[this.posMove.index.i].position[this.posMove.index.j - 1]
        ? this.line[this.posMove.index.i].position[this.posMove.index.j - 1]
        : this.line[this.posMove.index.i].position[this.line[this.posMove.index.i].position.length - 1];

      let dataAfter = this.line[this.posMove.index.i].position[this.posMove.index.j + 1]
        ? this.line[this.posMove.index.i].position[this.posMove.index.j + 1]
        : this.line[this.posMove.index.i].position[0];

      let before = {
        offsetX: (dataBefore.offsetX + this.line[this.posMove.index.i].position[this.posMove.index.j].offsetX) / 2,
        offsetY: (dataBefore.offsetY + this.line[this.posMove.index.i].position[this.posMove.index.j].offsetY) / 2,
      };
      let after = {
        offsetX: (dataAfter.offsetX + this.line[this.posMove.index.i].position[this.posMove.index.j].offsetX) / 2,
        offsetY: (dataAfter.offsetY + this.line[this.posMove.index.i].position[this.posMove.index.j].offsetY) / 2,
      };
      this.line[this.posMove.index.i].position.splice(this.posMove.index.j, 0, before);
      this.line[this.posMove.index.i].position.splice(this.posMove.index.j + 2, 0, after);
      let polygons = [];
      this.line[this.posMove.index.i].position.forEach((item, index) => {
        const itemPush = {
          offsetX: item.offsetX / this.props.width,
          offsetY: item.offsetY / this.props.height,
        };
        polygons = [...polygons, itemPush];
      });
      this.line[this.posMove.index.i].polygons = polygons;


    }
  }

  endPaintEventRec() {
    this.isPainting = false;
    let width = this.position.stop.offsetX - this.position.start.offsetX;
    let height = this.position.stop.offsetY - this.position.start.offsetY;
    let rectangle = new Rectangle({
      type: 'RECTANGLE',
      position: {
        width: width / this.props.width,
        height: height / this.props.height,
        offsetX: this.position.start.offsetX / this.props.width,
        offsetY: this.position.start.offsetY / this.props.height,
      },
      strokeStyle: this.props.strokeStyle,
      activeStrokeStyle: this.props.activeStrokeStyle,
      display: true,
      active: false,
      disabled: false,
    });
    rectangle.render(this);

    this.line.push(rectangle);
    this.ctx.stroke();
    this.props.onEndDraw(this.line[this.line.length - 1]);
  }

  endPaintEventPol() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.beginPath();
    this.line.map(item => {
      if (item.display &&
        ((item.polygons && item.polygons.length) || (item.position && Object.keys(item.position).length))) {
        item.render(this);
      }
    });
    this.ctx.stroke();
    this.ctx.closePath();
    this.props.onEndDraw(this.line[this.line.length - 1]);
  }

  onMouseOut() {
    if (this.movePoint) {
      this.movePoint = false;
    }
  }

  onDrawPolyline(points) {
    try {
      const { screenPosition, zoom, data, activeIndex, width, height } = this.props;
      const itemSelected = data.data[activeIndex];
      const colorFill = itemSelected?.activeStrokeStyle || COLOR.ACTIVE;

      const pointMoveTo = this.formatGetDataPolygon(points[0].offsetX, points[0].offsetY);

      this.ctx.moveTo(pointMoveTo.offsetX, pointMoveTo.offsetY);
      for (let i = 1; i < points.length; i++) {

        const item = this.formatGetDataPolygon(points[i].offsetX, points[i].offsetY);
        const prevItem = this.formatGetDataPolygon(points[i - 1].offsetX, points[i - 1].offsetY);

        this.ctx.strokeStyle = colorFill;
        this.ctx.fillStyle = colorFill;
        this.ctx.fillRect(prevItem.offsetX - CONSTANTS.POINT_SIZE / 2, prevItem.offsetY - CONSTANTS.POINT_SIZE / 2, CONSTANTS.POINT_SIZE, CONSTANTS.POINT_SIZE);
        this.ctx.fillRect(item.offsetX - CONSTANTS.POINT_SIZE / 2, item.offsetY - CONSTANTS.POINT_SIZE / 2, CONSTANTS.POINT_SIZE, CONSTANTS.POINT_SIZE);
        this.ctx.moveTo(prevItem.offsetX, prevItem.offsetY);
        this.ctx.lineTo(item.offsetX, item.offsetY);
      }
    } catch (e) {
    }
  }

  handleCreateRectangle(item) {
    let itemRectangle = clone(item);
    itemRectangle = new Rectangle(itemRectangle);
    Object.entries(item).forEach(([key, value]) => {
      if (!itemRectangle[key]) {
        itemRectangle[key] = value;
      }
    });
    return itemRectangle;
  }

  handleCreatePolygon(item) {
    let itemPolygon = clone(item);
    itemPolygon = new Polygon(itemPolygon);
    Object.entries(item).forEach(([key, value]) => {
      if (!itemPolygon[key]) {
        itemPolygon[key] = value;
      }
    });
    return itemPolygon;
  }

  initData() {
    this.canvas.width = this.props.width;
    this.canvas.height = this.props.height;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineWidth = this.props.lineWidth;
  }

  drawData() {
    const { thietBiSelected, thietBiNew, batThuongNew, thietBiEditing, batThuongEditing } = this.props;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.beginPath();
    this.line.forEach(item => {
      if (this.checkRenderCanvas(item)) {
        item.active = false;
        if (thietBiSelected && !batThuongEditing) {
          item.active = item.key === thietBiSelected.key;
        }
        if (thietBiSelected && batThuongEditing) {
          item.active = item.key === batThuongEditing.key;
        }
        if (thietBiNew) {
          item.active = item.key === thietBiNew.key;
        }
        if (batThuongNew) {
          item.active = item.key === batThuongNew.key;
        }

        // item.drawing = thietBiEditing?.key === item?.key || batThuongEditing?.key === item.key;
        item.drawing = [thietBiEditing?.key, batThuongEditing?.key, thietBiNew?.key, batThuongNew?.key].includes(item.key);
        item.render(this);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    });
  }

  checkRenderCanvas(canvasItem) {
    const { thietBiSelected, thietBiNew, batThuongNew, thietBiEditing, batThuongEditing } = this.props;
    if (!thietBiSelected && !thietBiNew && !batThuongNew &&
      !thietBiEditing && !batThuongEditing && !canvasItem.tinhTrangKbtId) {
      return true;
    }
    const isSelectThietBi = thietBiSelected?.key === canvasItem.key;
    const isBatThuongCuaThietBi = thietBiSelected && canvasItem?.thietBiPhatHienId === thietBiSelected?.key;
    const isAddThietBi = thietBiNew && thietBiNew?.key === canvasItem.key;
    const isAddBatThuong = batThuongNew && batThuongNew?.key === canvasItem.key;
    const isEditThietBi = thietBiEditing?.key === canvasItem.key;
    const isEditBatThuong = batThuongEditing?.key === canvasItem.key;
    return (isSelectThietBi && !batThuongEditing && !batThuongNew)
      || (isBatThuongCuaThietBi && !thietBiEditing && !batThuongEditing && !batThuongNew)
      || isAddThietBi
      || isAddBatThuong
      || isEditThietBi
      || isEditBatThuong;
  }

  checkPointClicked(offsetX, offsetY) {
    let check = false;
    for (let i = 0; i < this.line.length; i++) {
      let item = this.line[i];
      if (item.drawing && item.type === 'RECTANGLE') {
        check = checkRangePoint(offsetX, offsetY, item.position.offsetX, item.position.offsetY, 10) ||
          checkRangePoint(offsetX, offsetY, item.position.offsetX + item.position.width, item.position.offsetY, 10) ||
          checkRangePoint(offsetX, offsetY, item.position.offsetX, item.position.offsetY + item.position.height, 10) ||
          checkRangePoint(offsetX, offsetY, item.position.offsetX + item.position.width, item.position.offsetY + item.position.height, 10);
        if (check) {
          if (checkRangePoint(offsetX, offsetY, item.position.offsetX, item.position.offsetY, 10)) return {
            check: true,
            type: item.type,
            position: { offsetX: item.position.offsetX, offsetY: item.position.offsetY },
            index: { i: i, j: 0 },
            item: item.position,
          };
          if (checkRangePoint(offsetX, offsetY, item.position.offsetX + item.position.width, item.position.offsetY, 10)) return {
            check: true,
            type: item.type,
            position: { offsetX: item.position.offsetX + item.position.width, offsetY: item.position.offsetY },
            index: { i: i, j: 1 },
            item: item.position,
          };
          if (checkRangePoint(offsetX, offsetY, item.position.offsetX + item.position.width, item.position.offsetY + item.position.height, 10)) return {
            check: true,
            type: item.type,
            position: {
              offsetX: item.position.offsetX + item.position.width,
              offsetY: item.position.offsetY + item.position.height,
            },
            index: { i: i, j: 2 },
            item: item.position,
          };
          if (checkRangePoint(offsetX, offsetY, item.position.offsetX, item.position.offsetY + item.position.height, 10)) return {
            check: true,
            type: item.type,
            position: { offsetX: item.position.offsetX, offsetY: item.position.offsetY + item.position.height },
            index: { i: i, j: 3 },
            item: item.position,
          };
        }
      }
      if (item.drawing && item.type === 'POLYGON') {
        for (let j = 0; j < item.position.length; j++) {
          let point = item.position[j];
          check = checkRangePoint(offsetX, offsetY, point.offsetX, point.offsetY, 10);
          if (check) {
            return {
              check: true,
              type: item.type,
              position: { offsetX: point.offsetX, offsetY: point.offsetY },
              index: { i: i, j: j },
            };
          }
        }
      }
    }
    return { check: check };
  }

  value(A, B, M) {
    return (M.offsetX - A.offsetX) * (B.offsetY - A.offsetY) - (M.offsetY - A.offsetY) * (B.offsetX - A.offsetX);
  }

  otherSide(A, B, C, D) {
    return (this.value(A, B, C) * this.value(A, B, D) <= 0) ? 1 : 0;
  }

  checkIntersecting(A, B, C, D) {
    return (this.otherSide(A, B, C, D) === 1 && this.otherSide(C, D, A, B) === 1);
  }

  render() {
    return (
      <canvas id={this.props.id}
              ref={(ref) => (this.canvas = ref)}
              style={{ background: 'transparent' }}
              onMouseDown={this.onMouseDown}
              onMouseLeave={this.endPaintEvent}
              onMouseUp={this.endPaintEvent}
              onMouseMove={this.onMouseMove}
              onMouseOut={this.onMouseOut}
      />
    );
  }
}

Canvas.defaultProps = {
  drawType: 'RECTANGLE', //POLYGON || RECTANGLE
  enabled: false,
  plusTwoPoint: true,
  data: { data: [] },
  warning: '.........warning',
  activeIndex: -1,
  width: 100,
  height: 100,
  lineWidth: 1,
  strokeStyle: COLOR.BAT_THUONG,
  activeStrokeStyle: COLOR.ACTIVE,
  activeIndexChange: () => null,
  onEndDraw: () => null,
  onEndMove: () => null,
};
Canvas.propTypes = {
  prefixCls: PropTypes.string,
  className: PropTypes.string,
  showIndex: PropTypes.bool,
  showPreview: PropTypes.bool,

  drawType: PropTypes.string, //POLYGON || RECTANGLE
  enabled: PropTypes.bool,
  onEndDraw: PropTypes.func,
  onEndMove: PropTypes.func,
  plusTwoPoint: PropTypes.bool,
  data: PropTypes.object,
  warning: PropTypes.string,
  activeIndex: PropTypes.number,
  activeIndexChange: PropTypes.func,
  width: PropTypes.any,
  height: PropTypes.any,
  lineWidth: PropTypes.number,
  strokeStyle: PropTypes.string,
  activeStrokeStyle: PropTypes.string,
};

export default Canvas;
