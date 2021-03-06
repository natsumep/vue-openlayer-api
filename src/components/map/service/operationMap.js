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
  Label,
  Feature,
  ShapeStyle,
  circularPolygon,
  PathPlay,
  DrawAndSelect,
  LinePlayer,
} = SMap;
import mapMark from "@/assets/images/map-marker.png";
import { deepClone } from "./utils"
// import mapMark from "@/assets/plugin/images/clear.png";

const defaultPointStyle = {
  icon: {
    src: mapMark,
    anchor: [0.5, 1],
    scale:1,
  },
  circle: {
    radius: 16,
    fill: {
      color: "red",
    },
    stroke: {
      color: "red",
    },
    scale:1,
  },
  text: {
    scale:1,
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

export function showPoints(vectorLayer, points, style,map) {
  let styleInfo = getMergeStyle(style);
  const multiPointerFeature = [];
  points.forEach((item) => {
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
      styleInfo = getMergeStyle(st);
    }
    if (style.imageText) {
      const st = {
        text: style.imageText,
      };
      let sty = getMergeStyle({
        ...st,
        icon:{
          ...style.icon,
          opacity:1,
        }
      })
      multiPointerFeature.push( new PointFeature({ coordinate:coordinate.map(item=>item*1), data:{
        __point_lable__:true,
      } }, ()=>{
        const zoom = map.getView().getZoom();
        if(zoom< 12){
           let _sty = deepClone(sty);
          const zo = Math.pow(.7,12- zoom );
          _sty.icon && ( _sty.icon.scale = _sty.icon.scale * zo)
          _sty.text && (_sty.text.scale = _sty.text.scale * zo)
          _sty.circle &&( _sty.circle.scale = _sty.circle.scale * zo)
          _sty.text && _sty.text.offsetY && (_sty.text.offsetY = _sty.text.offsetY * zo)
          return  getPointStyle(_sty)
        }
        const style =  getPointStyle(sty)
        return style
      }));
    }
    // multiPointerFeature.push(new PointFeature({ coordinate, data }, styleInfo));
    multiPointerFeature.push(new PointFeature({ coordinate:coordinate.map(item=>item*1), data }, ()=>{
      const zoom = map.getView().getZoom();
      if(zoom< 12){
        let _styleInfo = deepClone(styleInfo);
        const zo = Math.pow(.7,12- zoom );
        _styleInfo.icon && ( _styleInfo.icon.scale = _styleInfo.icon.scale  * zo)
         _styleInfo.text && (_styleInfo.text.scale = _styleInfo.text.scale * zo)
        _styleInfo.circle &&( _styleInfo.circle.scale = _styleInfo.circle.scale  * zo)
        _styleInfo.text && _styleInfo.text.offsetY && (_styleInfo.text.offsetY = _styleInfo.text.offsetY * zo)
        return getPointStyle(_styleInfo)
      }
      const style =  getPointStyle(styleInfo)
      return style
    }));

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
  const de = {
    stroke: { color: "blue", width: 2 },
    fill: { color: "rgba(0,0,0, .2)" },
  };
  s = {
    ...de,
    ...s,
  };
  return s ? new PolygonStyle(s) : undefined;
}

export function showPolygons(vectorLayer, polygons, style) {
  const styleInfo = getPolygonStyle(style);
  const multiLineFeature = polygons.map((item) => {
    const coordinates = item.polygon || item;
    const data = item.data || null;
    return new PolygonFeature({ coordinates, data }, styleInfo);
  });
  vectorLayer.addFeatures(multiLineFeature);
}

export function showHeatMapPoints(vectorLayer, points) {
  vectorLayer
    .getSource()
    .addFeatures(points.map((item) => new PointFeature({ coordinate: item })));
}
export function showMultiPolygons(vectorLayer, polygons, style) {
  const styleInfo = getPolygonStyle(style);
  const multiLineFeature = polygons.map((item) => {
    const coordinates = item.polygon || item;
    const data = item.data || null;
    return new MultiPolygonFeature({ coordinates, data }, styleInfo);
  });
  vectorLayer.addFeatures(multiLineFeature);
}
export function showClusterPoint() {}

export function getSelectByPoint(layers, point, radius) {
  // var circleIn3857 = new Circle(
  //   transform(point, "EPSG:4326", "EPSG:3857"),
  //   radius
  // );
  // var circleIn4326 = circleIn3857.transform("EPSG:3857", "EPSG:4326");
  var circle4326 = circularPolygon(point, radius, 500);

  const ev = getPolyginLayerSelece(circle4326, layers);
  ev.data = ev.data.filter((item) => {
    return !(item.data && item.data.__point_lable__);
  });
  return {
    ...ev,
    extent: circle4326.getExtent(),
    geometry: circle4326,
  };
}
export function getSelectByPolygon(layers, data) {
  const polygin = new MultiPolygonFeature({
    coordinates: data,
  });
  const polygon = polygin.getGeometry();
  const ev = getPolyginLayerSelece(polygon, layers);
  ev.data = ev.data.filter((item) => {
    return !(item.data && item.data.__point_lable__);
  });
  return {
    ...ev,
    extent: polygon.getExtent(),
    geometry: polygon,
  };
}

function showMarkerPoint(map, point, option) {
  const mark = new Marker({ ...option, position: point });
  map.addOverlay(mark);
  return mark;
}

export function showMarker(map, point, option, textOption) {
  return showMarkerPoint(map, point, option);
}

export function removeMarker(map, mark) {
  map.removeOverlay(mark);
}

// eslint-disable-next-line no-unused-vars
let getRadius = (map, radius) => {
  let metersPerUnit = map.getView().getProjection().getMetersPerUnit();

  let circleRadius = radius / metersPerUnit;

  return circleRadius;
};
export class CircleFeature extends Feature {
  constructor(opts, style) {
    const { point, radius } = opts;
    const circleIn3857 = new Circle(point, radius);
    const geometry = circleIn3857;
    super({ geometry, ...opts });
    if (style) {
      this.setStyle(style);
    }
  }
}

export function showCircle(vectorLayer, circleOption, style, map) {
  const styleInfo = getPolygonStyle(style);
  // const radius = getRadius(map,circleOption.radius)
  // const feature = new CircleFeature(circleOption, styleInfo);
  var circle4326 = circularPolygon(
    circleOption.point,
    circleOption.radius,
    500
  );
  const feature = new Feature({
    geometry: circle4326,
    data: { isCircle: true, ...circleOption },
  });
  feature.setStyle(styleInfo);
  vectorLayer.addFeature(feature);
}

export function showPathPlay(map, coordinates, option) {
  let metersPerUnit = map.getView().getProjection().getMetersPerUnit();
  const player = new SMap.LinePlayer({
    speed: 500 / metersPerUnit,
  });
  const pathPlay = new SMap.PathPlay({
    map,
    player,
    needPlayer: true,
    ...option,
  });
  const pathData = coordinates.map((line) => {
    return line.map((point) => {
      if (Array.isArray(point) && point.length === 2) {
        return {
          coordinate: point,
          type: "angle",
        };
      } else {
        return point;
      }
    });
  });
  pathData[0][0].type = "start";
  pathData[pathData.length - 1][pathData[pathData.length - 1].length - 1].type =
    "end";
  pathPlay.addPath(pathData);
  return pathPlay;
}
