import * as SMap from "@/assets/plugin/map.js";
const {
  Map,
  TDTileLayer,
  ZoomControl,
  MousePositionControl,
  ScaleLineControl,
  GoogleTileLayer,
  AttributionControl,
  MarkerPointControl,
  ZoomOutControl,
  ZoomInControl,
  MeasureAngleControl,
  MeasureAreaControl,
  MeasureLineControl,
  ToolBarControl,
  WGS84ToWebMercator,
  CenterAndZoomControl,
  GeoWmtsTileLayer
} = SMap;

export class MapService {
  map;
  constructor() {}
  baseLayers = [];
  getWindowScale() {
    const innerWidth = parseInt(window.innerWidth.toString(), 10);
    let scale = 1;
    if (innerWidth > 1920) {
      scale = innerWidth / 1920;
    }
    return scale;
  }
  initMap(ele, control) {
    // let center = [12607286.1336, 2650440.1344];
    // try {
    //   center = WGS84ToWebMercator([113.030001, 23.082001]);
    //   // eslint-disable-next-line no-empty
    // } catch (e) {}
    // // 设置地图最大、最小缩放级别
    // const mapOptions = {
    //   minZoom: 2,
    //   maxZoom: 18,
    //   extent: [
    //     ...WGS84ToWebMercator([70, 0]),
    //     ...WGS84ToWebMercator([130, 50]),
    //   ],
    // };
    let center = [12607286.1336, 2650440.1344];
    try {
      center = [113.030001, 23.082001];
      
      // eslint-disable-next-line no-empty
    } catch (e) {}
    // 设置地图最大、最小缩放级别
    const mapOptions = {
      minZoom: 10,
      maxZoom: 20,
      projection:"EPSG:4326",
      // extent: [
      //   ...[70, 0],
      //  ...[130, 50],
      // ],
    };
    this.map = new Map(ele, mapOptions);
    this.map.centerAndZoom(center, 12);
    // 添加相应的地图图层
    // this.map.addLayer(new TDTileLayer('electronic'));
    // this.map.addLayer(new TDTileLayer('road'));
    control.zoom && this.map.addControl(new ZoomControl());
    control.mouse && this.map.addControl(new MousePositionControl());
    control.scale && this.map.addControl(new ScaleLineControl());
    this.map.addControl(new AttributionControl({ collapsible: false }));
    if (control.control) {
      const options = {
        controls: [
          new ZoomOutControl(),
          new ZoomInControl(),
          new MeasureAngleControl(),
          new MeasureAreaControl(),
          new MeasureLineControl(),
          new MarkerPointControl(),
        ],
      };
      this.map.addControl(new ToolBarControl(options));
    }
   
    // const codes = this.configService.unitInfo.codes;
    // codes &&
    //   this.mapMaskService.createMapMask(codes.split(",") || [], this.map);
    // this.getBaseLayers().forEach((item) => {
    //   this.map.addLayer(item);
    // });
    this.getFoShanMap();
    const centerAndZoomControl =new CenterAndZoomControl();
    centerAndZoomControl.setCenterAndZoom(center, 12);
    // 将控件添加到地图上
    this.map.addControl(centerAndZoomControl);
    return this.map;
  }
  getFoShanMap(){
    const map = new GeoWmtsTileLayer({
      url:'http://19.128.104.232:12345/ServiceAccess/MapService-T/佛山电子地图_MapService-T_CGCS2000/13954a5079cbad20a5e041fabe50eb85/tile/{z}/{y}/{x}',
    },{
      projection:"EPSG:4326",
    })
    this.map.addLayer(map);
  }
  getGoogleTileLayer = (type) => {
    return new GoogleTileLayer(type);
  };

  getTDTileLayer = (type) => {
    return new TDTileLayer(type);
  };
  getBaseLayers() {
    const cBaseLayers = this._getLayerParams([
      { type: "tianditusatellite", hasLabel: true },
      { type: "tiandituelectronic", hasLabel: true },
    ]);
    const baseLayersVisible = this._getBLayersVisible();
    this.baseLayers = [];
    const layerFn = {
      google: this.getGoogleTileLayer.bind(this),
      tianditu: this.getTDTileLayer.bind(this),
    };
    for (const layerType in cBaseLayers) {
      if (cBaseLayers.hasOwnProperty(layerType)) {
        if (Array.isArray(cBaseLayers[layerType])) {
          for (const subLayerType of cBaseLayers[layerType]) {
            if (layerFn[layerType]) {
              const baseLayer = layerFn[layerType](subLayerType);
              const layerId = layerType + subLayerType;
              baseLayer.set("id", layerId);
              baseLayer.set("isBaseLayer", true);
              const visible = baseLayersVisible[layerId] || false;
              baseLayer.setAttributions(this.getAttributionHtml(layerType));
              baseLayer.setVisible(visible);
              this.baseLayers.push(baseLayer);
            }
          }
        }
      }
    }
    return this.baseLayers;
  }
  getAttributionHtml(type) {
    let info = "";
    if (type === "google") {
      info = " 地图数据 © 2020 Google";
    } else if (type === "tianditu") {
      info = " © 国家地理信息公共服务平台 - GS(2019)1719号";
    }
    return `<div class="map-attribution">
            <span class="attribution-info"> ${info}</span></div>
        `;
  }
  // 获取底图的可见性
  _getBLayersVisible() {
    const defaultLayers = {
      mapType: "tianditusatellite",
      tianditusatellite: [true, "tiandituroad"],
      tiandituelectronic: [true, "tiandituroad"],
    };
    // 设置默认底图可见，标注图层根据配置设置可见性
    const bLayerVisibleMap = {};
    const vSubLayerId = defaultLayers.mapType;
    bLayerVisibleMap[vSubLayerId] = true;
    const activeLayer = defaultLayers[defaultLayers.mapType];
    // 路网图层是否可见
    if (!!activeLayer && !!activeLayer[0]) {
      bLayerVisibleMap[activeLayer[1]] = true;
    }
    return bLayerVisibleMap;
  }

  // 判断底图类型 'google'|'tianditu'
  _getLayerType(layerType) {
    layerType = layerType.toLocaleLowerCase();
    let type;
    if (layerType.indexOf("google") > -1) {
      type = "google";
    } else if (layerType.indexOf("tianditu") > -1) {
      type = "tianditu";
    }
    return type;
  }

  // 获取底图风格 'satellite'|'electronic'|'road'
  _getLayerStyle(layerType) {
    layerType = layerType.toLocaleLowerCase();
    let style;
    if (layerType.indexOf("satellite") > -1) {
      style = "satellite";
    } else if (layerType.indexOf("electronic") > -1) {
      style = "electronic";
    } else if (layerType.indexOf("road") > -1) {
      style = "road";
    }
    return style;
  }

  /**
   * 解析配置，组装成{google:['satellite']}文件，用以创建地图
   * @param layerConfigs 图层配置
   */
  _getLayerParams(layerConfigs) {
    const layerConfig = {};
    layerConfigs.forEach((lConfig) => {
      const type = this._getLayerType(lConfig.type);
      if (!layerConfig[type]) {
        layerConfig[type] = [];
      }
      const style = this._getLayerStyle(lConfig.type);
      layerConfig[type].push(style);
      if (lConfig.hasLabel) {
        const index = layerConfig[type].indexOf("road");
        if (index !== -1) {
          layerConfig[type].splice(index, 1);
        }
        layerConfig[type].push("road");
      }
    });
    return layerConfig;
  }
}


// export {SMap}