import { CONSTANTS } from "@constants";
import { COLOR } from "./ColorConstants";

export default class Polygon {
  constructor(args) {
    // console.log(args)
    this.position = args.position;
    this.active = args.active || false;
    this.drawing = args.drawing;
    this.activeStrokeStyle = args.activeStrokeStyle;
    this.strokeStyle = args.strokeStyle;
    this.type = CONSTANTS.POLYGON;
    this.enableMove = args.enableMove;
    this.display = args.display; //|| true
    this.disabled = args.disabled;
    this.width = args.width;
    this.height = args.height;
    this.x = args.x;
    this.y = args.y;
    this.create_by = args.create_by;
    this.comment = args.comment;
    this.image_id = args.image_id;
    this.created_at = args.created_at;
    this._id = args._id;
    this.label = args.label ? args.label.trim() : "";
  }

  drawLine(context, points) {
    context.strokeStyle = this.active ? this.activeStrokeStyle : this.strokeStyle;
    context.fillStyle = this.active ? this.activeStrokeStyle : this.strokeStyle;

    const polygonDataset = [...points, points[0]];
    for (let i = 0; i < points.length; i++) {
      context.moveTo(polygonDataset[i].offsetX, polygonDataset[i].offsetY);
      context.lineTo(polygonDataset[i + 1].offsetX, polygonDataset[i + 1].offsetY);
    }
    context.stroke();
  }

  drawLabel(context, points) {
    let offsetXText = points[0].offsetX;
    let offsetYText = points[0].offsetY;

    points.forEach((point) => {
      if (offsetYText < point.offsetY) {
        offsetXText = point.offsetX;
        offsetYText = point.offsetY;
      }
    });

    if (this.label) {
      context.font = "12px Segoe UI";
      context.fillRect(
        offsetXText - context.measureText(this.label).width / 2,
        offsetYText,
        context.measureText(this.label).width + 10,
        16
      );
      context.fillStyle = this.active ? "#ffffff" : this.strokeStyle === COLOR.BAT_THUONG ? "#ffffff" : "#000";
      context.fillText(this.label, offsetXText - context.measureText(this.label).width / 2 + 3, offsetYText + 12);
    }
  }

  drawPoint(context, points) {
    if (!this.drawing) return;

    const polygonDataset = [...points, points[0]];

    for (let i = 0; i < points.length; i++) {
      const item1 = polygonDataset[i];
      const item2 = polygonDataset[i + 1];
      context.beginPath();
      context.fillStyle = COLOR.ACTIVE;
      context.fillRect(
        item1.offsetX - CONSTANTS.POINT_SIZE / 2,
        item1.offsetY - CONSTANTS.POINT_SIZE / 2,
        CONSTANTS.POINT_SIZE,
        CONSTANTS.POINT_SIZE
      );
      context.closePath();

      // draw midpoint
      /*context.beginPath();
      context.fillStyle = COLOR.MID_POINT;
      const midpoint = {
        offsetX: (item1.offsetX + item2.offsetX) / 2,
        offsetY: (item1.offsetY + item2.offsetY) / 2,
      };
      context.fillRect(midpoint.offsetX - CONSTANTS.POINT_SIZE / 2, midpoint.offsetY - CONSTANTS.POINT_SIZE / 2, CONSTANTS.POINT_SIZE, CONSTANTS.POINT_SIZE);
      context.closePath();*/
    }
    context.stroke();
  }

  render(self) {
    const context = self.ctx;
    const points = this.position;

    if (!this.display || points.length < 2) return null;
    if (!points[0]?.offsetX || !points[0]?.offsetY) return null;

    context.beginPath();
    this.drawLine(context, points);
    this.drawLabel(context, points);
    context.closePath();

    this.drawPoint(context, points);
  }
}
