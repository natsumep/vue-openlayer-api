import * as SMap from "@/assets/plugin/map.js";
const { GeoWmtsTileLayer } = SMap;
/**
 * 基础底图类型的模式，目前支持两种:
 * * All：卫星图+电子地图
 * * Satellite： 卫星图
 *
 * @export
 * @enum {number}
 */
const BaselayersTypeModle = {
  All: 1,
  Satellite: 2,
};

export class BaselayersManager {
  preName = "customBaseLayer_"; // 底图前缀
  baseLayersChangeHandles = [];
  typeModle = BaselayersTypeModle.All;
  defaultLayers = {
    mapType: "foshanMapgLayer",
    // this.typeModle === BaselayersTypeModle.All ? "tiandituMapgLayer" : "tiandituSatellite",
    // googleSatellite: [true, "googleRoadLayer"],
    tiandituSatellite: [true, "tiandituSatelliteRoadLayer"],
    tiandituMapgLayer: [true, "tiandituMapgLayerRoadLayer"],
    foshanMapgLayer: true,
  };
  baseLayers = [];
  constructor(mapSet) {
    if(mapSet){
      this.defaultLayers = mapSet
    }
  }
  getBaseLayerId(layerId) {
    return this.preName + layerId;
  }
  /**
   * 加载底图，当未配置时，加载默认的底图们，即谷歌地图和天地图的 卫星图、电子地图、混合图（标注图层）
   *
   * @
   * @returns
   * @memberof MapService
   */
  getBaseLayers() {
    const cBaseLayers = this.getBaselayerTypesConfig();
    const baseLayersVisible = this.getBLayersVisible();
    this.baseLayers = [];
    for (const layerType in cBaseLayers) {
      if (cBaseLayers.hasOwnProperty(layerType)) {
        if (
          (layerType === "google" ||
            layerType === "tianditu" ||
            layerType === "foshan") &&
          Array.isArray(cBaseLayers[layerType])
        ) {
          for (const subLayerType of cBaseLayers[layerType]) {
            const layerId = this.getBaseLayerId(layerType + subLayerType);
            const baseLayer =
              layerType === "tianditu"
                ? this.getTDTMap(subLayerType, layerId)
                : this.getFoShanMap(subLayerType, layerId);
            baseLayer["id"] = layerId;
            const visible = baseLayersVisible[layerId] || false;
            baseLayer.setVisible(visible);
            this.baseLayers.push(baseLayer);
          }
        }
      }
    }
    return this.baseLayers;
  }
  getBaselayerTypesConfig() {
    return {
      // google: ["Satellite", "MapgLayer", "RoadLayer"],
      tianditu: [
        "Satellite",
        "MapgLayer",
        "SatelliteRoadLayer",
        "MapgLayerRoadLayer",
      ],
      foshan: ["MapgLayer"],
    };
  }
  getBaselayerTypes(typeMode) {
    if (typeMode !== void 0 && typeMode === BaselayersTypeModle.Satellite) {
      // return ["googleSatellite", "tiandituSatellite"];
      return ["tiandituSatellite"];
    }
    const arr = [];
    for(let i in this.defaultLayers){
      if(i!=='mapType'){
        arr.push(i)
      }
    }
    return arr;
    // return ["tiandituSatellite", "tiandituMapgLayer", "foshanMapgLayer"];
    // return ["googleSatellite", "googleMapgLayer", "tiandituSatellite", "tiandituMapgLayer"];
  }
  getFoShanMap(_type, id) {
    return new GeoWmtsTileLayer(
      {
        id,
        url:
          "http://19.128.104.232:12345/ServiceAccess/MapService-T/佛山电子地图_MapService-T_CGCS2000/13954a5079cbad20a5e041fabe50eb85/tile/{z}/{y}/{x}",
      },
      {
        projection: "EPSG:4326",
      }
    );
  }
  getTDTMapUrl(type) {
    let mapType = "";
    switch (type) {
      case "Satellite": // 影像
        mapType = "img_c";
        break;
      case "MapgLayer": // 电子
        mapType = "vec_c";
        break;
      case "SatelliteRoadLayer":
        mapType = "cia_c";
        break;
      case "MapgLayerRoadLayer":
        mapType = "cva_c";
        break;
    }
    return `https://t{0-7}.tianditu.gov.cn/DataServer?tk=19a051ef5301849b888e322e34a162ee&T=${mapType}&x={x}&y={y}&l={z}`;
  }
  getTDTMap(type, id) {
    const url = this.getTDTMapUrl(type);
    return new GeoWmtsTileLayer(
      {
        url,
        id,
      },
      {
        url,
        projection: "EPSG:4326",
      }
    );
  }
  /**
   * 从 localStorage中 获取默认显示的底图，若没有，则设置为天地图，并写入 localStorage 中
   *
   * @
   * @type {function ()}
   * @memberof MapService
   */
  getBLayersVisible() {
    const defaultLayers = this.getDefaultLayers();
    // 设置默认底图可见，标注图层根据配置设置可见性
    // tslint:disable-next-line:prefer-const
    let bLayerVisibleMap = {};
    const vSubLayerId = this.getBaseLayerId(defaultLayers.mapType);
    bLayerVisibleMap[vSubLayerId] = true;
    const activeLayer = defaultLayers[defaultLayers.mapType];
    // 路网图层是否可见
    !!activeLayer &&
      !!activeLayer[0] &&
      (bLayerVisibleMap[this.getBaseLayerId(activeLayer[1])] = true);
    return bLayerVisibleMap;
  }
  getDefaultLayers() {
    // try {
      // let storeMap = localStorage.getItem("_defaultMap");
      // if (!!storeMap) {
      //   defaultLayers = JSON.parse(storeMap);
      //   // FIXME google 被禁用，暂时这么做
      //   if (defaultLayers.mapType.indexOf("google") > -1) {
      //     localStorage.removeItem("_defaultMap");
      //   } else {
      //     return defaultLayers;
      //   }
      // }
      
      // this.setDefaultLayers(defaultLayers);

      return this.defaultLayers;
    // } catch (error) {}
  }
  /**
   * 将底图配置缓存到 localStorage 中
   *
   * @param {DefaultBaseLayers} defaultLayers
   * @memberof BaselayersManager
   */
  setDefaultLayers(defaultLayers) {
    // localStorage.setItem("_defaultMap", JSON.stringify(defaultLayers));
  }

  /**
   * 刷新底图，用于分屏对比，同步刷新
   *
   * @memberof MapService
   */
  refreshBaseLayersVisible(baseLayers) {
    const baseLayersVisible = this.getBLayersVisible();
    baseLayers.forEach((baseLayer) => {
      const layerId = baseLayer["ol_uid"];
      if (this.isBaseLayer(layerId)) {
        const visible = baseLayersVisible[layerId] || false;
        baseLayer.setVisible(visible);
      }
    });
  }
  // 是否是基础地图
  isBaseLayer(layerId) {
    return layerId.indexOf(this.preName) > -1;
  }

  /**
   * 监听基础底图类型模式的改变，并传入回调
   *
   *
   * @memberof BaselayersManager
   */
  onTypeModleChange(callback) {
    this.baseLayersChangeHandles.push(callback);
  }
  /**
   * 取消对基础底图类型模式改变的监听，并传入回调，用于取消
   *
   *
   * @memberof BaselayersManager
   */
  unTypeModleChange(callback) {
    for (let index = 0; index < this.baseLayersChangeHandles.length; index++) {
      const handle = this.baseLayersChangeHandles[index];
      if (handle.toString() == callback.toString()) {
        this.baseLayersChangeHandles.splice(index, 1);
      }
    }
  }
  /**
   * 设置基础底图类型的模式，目前支持两种:
   * * All：卫星图+电子地图
   * * Satellite： 卫星图
   * 目前在 Satellite 模式下，只将默认显示地图 tiandituMapgLayer 修改为 tiandituSatellite，
   * 所有底图依然加入地图中。
   *
   * @param {BaselayersTypeModle} typeModel
   * @memberof BaselayersManager
   */
  setTypeModle(typeModel) {
    if (this.typeModle !== typeModel) {
      this.typeModle = typeModel;
      this.typeModleChange();
    }
  }
  /**
   * 基础底图类型模式改变
   *
   * @
   * @memberof BaselayersManager
   */
  typeModleChange() {
    if (this.typeModle === BaselayersTypeModle.Satellite) {
      const defaultLayers = JSON.parse(localStorage.getItem("_defaultMap"));
      if (defaultLayers.mapType.indexOf("Satellite") < 0) {
        defaultLayers.mapType = "tiandituSatellite";
        this.setDefaultLayers(defaultLayers);
      }
    }
    const baseLayersVisible = this.getBLayersVisible();
    for (const baseLayer of this.baseLayers) {
      const layerId = baseLayer["ol_uid"];
      const visible = baseLayersVisible[layerId] || false;
      baseLayer.setVisible(visible);
    }
    for (const handle of this.baseLayersChangeHandles) {
      handle(this.typeModle);
    }
  }
  getTypeModle() {
    return this.typeModle;
  }
}
