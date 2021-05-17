import * as SMap from "@/assets/plugin/map.js";

const {
  PointFeature,
  IconStyle,
  LineFeature,
  PolygonFeature,
  MultiPolygonFeature,
  LineStyle,
  PolygonStyle,
  CircleStyle,
  getPolyginLayerSelece,
  Circle,
  transform,
  Marker,
  Label
} = SMap;
// import mapMark from "@/assets/images/map-marker.png";
import mapMark from "@/assets/plugin/images/clear.png";

const defaultPointStyle = {
  icon: {
    src: mapMark,
    anchor: [0.5, 1],
  },
  circle: {
    radius: 16,
    fill: {
      color: "red",
    },
    stroke: {
      color: "red",
    },
  },
  text: {
    font: " 14px sans-serif",
  },
};
export function getMergeStyle(style = {}) {
  const { type } = style;
  const s = {
    icon: {
      ...defaultPointStyle.icon,
      ...style.icon,
    },
    text: {
      ...defaultPointStyle.text,
      ...style.text,
    },
    circle: {
      ...defaultPointStyle.circle,
      ...style.circle,
    },
  };
  if (type === "circle") {
    delete s.icon;
    return new CircleStyle(s);
  } else {
    delete s.circle;
  }
  return s;
}
export function getPointStyle(style = {}) {
  return new IconStyle(getMergeStyle(style));
}
export function showClusterPoints(vectorLayer, points) {
  const multiPointerFeature = points.map((item) => {
    const coordinate = item.point || item;
    const data = item.data || null;
    return new PointFeature({ coordinate, data });
  });
  vectorLayer.addFeatures(multiPointerFeature);
}

export function showPoints(vectorLayer, points, style) {
  let styleInfo = getPointStyle(style);
  const multiPointerFeature = points.map((item) => {
    const coordinate = item.point || item;
    const data = item.data || null;
    const showPointText = item.data && item.data.showPointText;
    if (showPointText) {
      const st = {
        ...style,
        text: {
          ...style.text,
          text: showPointText,
        },
      };
      styleInfo = getPointStyle(st);
    }
    return new PointFeature({ coordinate, data }, styleInfo);
  });
  vectorLayer.addFeatures(multiPointerFeature);
}
function getLineStyle(s) {
  return s ? new LineStyle(s) : undefined;
}

export function showLines(vectorLayer, lines, style) {
  const styleInfo = getLineStyle(style);
  const multiLineFeature = lines.map((item) => {
    const coordinate = item.line || item;
    const data = item.data || null;
    return new LineFeature({ coordinate, data }, styleInfo);
  });
  vectorLayer.addFeatures(multiLineFeature);
}

function getPolygonStyle(s) {
  return s ? new PolygonStyle(s) : undefined;
}

export function showPolygons(vectorLayer, polygons, style) {
  const styleInfo = getPolygonStyle(style);
  const multiLineFeature = polygons.map((item) => {
    const coordinate = item.polygon || item;
    const data = item.data || null;
    return new PolygonFeature({ coordinate, data }, styleInfo);
  });
  vectorLayer.addFeatures(multiLineFeature);
}

export function showHeatMapPoints(vectorLayer, points) {
  vectorLayer
    .getSource()
    .addFeatures(points.map((item) => new PointFeature({ coordinate: item })));
}

export function showClusterPoint() {}

export function getSelectByPoint(layers, point, width) {
  var circleIn3857 = new Circle(transform(point, 'EPSG:4326', 'EPSG:3857'), width);
  var circleIn4326 = circleIn3857.transform('EPSG:3857','EPSG:4326');
  return {...getPolyginLayerSelece(circleIn4326, layers),extent:circleIn4326.getExtent(),geometry:circleIn4326};
}
export function getSelectByPolygon(layers, data) {
  const polygin = new MultiPolygonFeature({
    coordinates:data,
  });
  const polygon = polygin.getGeometry();
  return {...getPolyginLayerSelece(polygon, layers),extent:polygon.getExtent(),geometry:polygon};
}


function showMarkerPoint(map,point,option){
  const mark = new Marker({...option,position:point});
  map.addOverlay(mark);
  return mark;
}

export function showMarker(map,point,option,textOption){
  return showMarkerPoint(map,point,option);
}

export function removeMarker(map,marks){
  marks.forEach(item=>{
    this.map.removeMarker(item);
  })
}