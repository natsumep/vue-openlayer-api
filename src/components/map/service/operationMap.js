import * as SMap from "@/assets/plugin/map.js";
const { PointFeature, IconStyle , LineFeature ,PolygonFeature , LineStyle,PolygonStyle , CircleStyle} = SMap;
import mapMark from "@/assets/images/map-marker.png";

const defaultPointStyle = {
  icon: {
    src: mapMark,
    anchor: [0.5, 1],
  },
  circle:{
    radius:16,
    fill:{
      color:"red",
    },
    stroke:{
      color:'red',
    }
  },
  text: {
    font:" 14px sans-serif"
  },
};
function getPointStyle(style = {}) {
  const {type }= style;
  const s = {
    icon:{
      ...defaultPointStyle.icon,

      ...style.icon,
    },
    text:{
      ...defaultPointStyle.text,

      ...style.text,
    },
    circle:{
      ...defaultPointStyle.circle,

      ...style.circle,
    }
  };
  if(type === "circle"){
    delete s.icon;
    return new CircleStyle(s);
  }else{
    delete s.circle
  }
  return new IconStyle(s);
}


export function showPoints(vectorLayer, points, style) {
  let styleInfo = getPointStyle(style)
  const multiPointerFeature = points.map(item=>{
    const coordinate = item.point || item;
    const data = item.data || null;
    const showPointText = item.data  && item.data.showPointText;
    if(showPointText){
      const st = {
        ...style,
        text:{
          ...style.text,
          text:showPointText
        }
      }
      styleInfo =  getPointStyle(st)
    }
    return new PointFeature(
      { coordinate , data },
      styleInfo
    )
  });
  vectorLayer.addFeatures(multiPointerFeature);
}
function getLineStyle(s){
  return s? new LineStyle(s):undefined;

}

export function showLines(vectorLayer, lines, style){
  const styleInfo = getLineStyle(style)
  const multiLineFeature = lines.map(item=>{
    const coordinate = item.line || item;
    const data = item.data || null;
    return new LineFeature(
      { coordinate , data },
      styleInfo
    )
  });
  vectorLayer.addFeatures(multiLineFeature);
}

function getPolygonStyle(s){
  return s? new PolygonStyle(s):undefined;
}

export function showPolygons(vectorLayer, polygons, style){
  const styleInfo = getPolygonStyle(style)
  const multiLineFeature = polygons.map(item=>{
    const coordinate = item.polygon || item;
    const data = item.data || null;
    return new PolygonFeature(
      { coordinate , data },
      styleInfo
    )
  });
  vectorLayer.addFeatures(multiLineFeature);
}


export function showClusterPoint() {}
