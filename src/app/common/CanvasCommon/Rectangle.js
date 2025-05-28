import { CONSTANTS } from "@constants";
import { COLOR } from "./ColorConstants";

export default class Rectangle {
  constructor(args) {
    // console.log(args);
    this.position = args.position;
    this.active = args.active || false;
    this.drawing = args.drawing;
    this.activeStrokeStyle = args.activeStrokeStyle;
    this.strokeStyle = args.strokeStyle;
    this.type = CONSTANTS.RECTANGLE;
    this.enableMove = args.enableMove;
    this.display = args.display; //|| true
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

  drawLine(context) {
    context.rect(this.position.offsetX, this.position.offsetY, this.position.width, this.position.height);
    context.stroke();
  }

  drawLabel(context) {
    const offsetXAvg = this.position.width < 0 ? this.position.offsetX + this.position.width : this.position.offsetX;
    const offsetYAvg = this.position.height < 0 ? this.position.offsetY + this.position.height : this.position.offsetY;

    if (this.label) {
      context.font = "12px Segoe UI";
      context.fillRect(offsetXAvg - 1, offsetYAvg - 15, context.measureText(this.label).width + 10, 15);
      context.fillStyle = this.active
        ? COLOR.REVERSE_ACTIVE
        : this.strokeStyle === COLOR.BAT_THUONG
        ? COLOR.REVERSE_BAT_THUONG
        : COLOR.DEFAULT;
      context.fillText(this.label, offsetXAvg + 3, offsetYAvg - 3);
    }
    context.stroke();
  }

  drawPoint(context) {
    if (!this.drawing) return;

    context.fillStyle = COLOR.ACTIVE;
    context.fillRect(
      this.position.offsetX - CONSTANTS.POINT_SIZE / 2,
      this.position.offsetY - CONSTANTS.POINT_SIZE / 2,
      CONSTANTS.POINT_SIZE,
      CONSTANTS.POINT_SIZE
    );
    context.fillRect(
      this.position.offsetX + this.position.width - CONSTANTS.POINT_SIZE / 2,
      this.position.offsetY - CONSTANTS.POINT_SIZE / 2,
      CONSTANTS.POINT_SIZE,
      CONSTANTS.POINT_SIZE
    );
    context.fillRect(
      this.position.offsetX - CONSTANTS.POINT_SIZE / 2,
      this.position.offsetY + this.position.height - CONSTANTS.POINT_SIZE / 2,
      CONSTANTS.POINT_SIZE,
      CONSTANTS.POINT_SIZE
    );
    context.fillRect(
      this.position.offsetX + this.position.width - CONSTANTS.POINT_SIZE / 2,
      this.position.offsetY + this.position.height - CONSTANTS.POINT_SIZE / 2,
      CONSTANTS.POINT_SIZE,
      CONSTANTS.POINT_SIZE
    );
    context.stroke();
  }

  render(self) {
    if (!this.display) return null;
    const context = self.ctx;

    context.beginPath();
    context.strokeStyle = this.active ? this.activeStrokeStyle : this.strokeStyle;
    context.fillStyle = this.active ? this.activeStrokeStyle : this.strokeStyle;

    this.drawLine(context);
    this.drawPoint(context);
    this.drawLabel(context);

    context.closePath();
  }
}
