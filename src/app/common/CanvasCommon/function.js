export function getPolygons(canvasInput) {
  if (!canvasInput) return [];
  let polygons = [];
  if (canvasInput.type === 'POLYGON') {
    polygons = JSON.parse(JSON.stringify(canvasInput.position));
  }
  if (canvasInput.type === 'RECTANGLE') {
    const offsetX = canvasInput.position?.offsetX || canvasInput.x;
    const offsetY = canvasInput.position?.offsetY || canvasInput.y;
    const width = canvasInput.position?.width || canvasInput.width;
    const height = canvasInput.position?.height || canvasInput.height;
    polygons = [
      { offsetX: offsetX, offsetY: offsetY },
      { offsetX: offsetX + width, offsetY: offsetY },
      { offsetX: offsetX + width, offsetY: offsetY + height },
      { offsetX: offsetX, offsetY: offsetY + height },
    ];
  }
  return polygons;
}

export function convertPolygonToOffset(polygons) {
  let xMin = polygons[0].offsetX;
  let yMin = polygons[0].offsetY;
  let xMax = polygons[0].offsetX;
  let yMax = polygons[0].offsetY;
  polygons.forEach(polygon => {
    xMin = xMin < polygon.offsetX ? xMin : polygon.offsetX;
    yMin = yMin < polygon.offsetY ? yMin : polygon.offsetY;
    xMax = xMax > polygon.offsetX ? xMax : polygon.offsetX;
    yMax = yMax > polygon.offsetY ? yMax : polygon.offsetY;
  });

  return {
    offsetX: xMin,
    offsetY: yMin,
    width: xMax - xMin,
    height: yMax - yMin,
  };
}

export function checkRangePoint(offsetX, offsetY, firstX, firstY, range) {
  return offsetX >= (firstX - range) && offsetX <= (firstX + range) && offsetY >= (firstY - range) && offsetY <= (firstY + range);
}
