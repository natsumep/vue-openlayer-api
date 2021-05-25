import { BaselayersManager } from "./baselayersManager";
export class MapSwitchService {
   defaultMap = null ;
   baseLayers= [];
   baselayersManager = null;
  constructor(map) {
    this.map = map;
    this.baselayersManager = new BaselayersManager();
    this.initBaseLayers();
    const layers = this.baselayersManager.getBaseLayers();
    layers.forEach(item=>{
      this.map.addLayer(item)
    })
  }
   setBaseLayers() {
    try {
      const layerTypes = this.baselayersManager.getBaselayerTypes(100);
      const mapType = this.defaultMap["mapType"];
      this.baseLayers.length = 0;
      for (const layerType of layerTypes) {
        let layerConfig;
        switch (layerType) {
          case "googleSatellite":
            layerConfig = {
              title: "google影像地图",
              labelLayer: {
                layerType: "googleRoadLayer"
              },
              name: "谷歌影像"
            };
            break;
          case "googleMapgLayer":
            layerConfig = {
              title: "google电子地图",
              labelLayer: null,
              name: "谷歌电子"
            };
            break;
          case "tiandituSatellite":
            layerConfig = {
              title: "天地图影像地图",
              labelLayer: {
                layerType: "tiandituSatelliteRoadLayer"
              },
              name: "天地影像"
            };
            break;
          case "tiandituMapgLayer":
            layerConfig = {
              title: "天地图电子地图",
              labelLayer: {
                layerType: "tiandituMapgLayerRoadLayer"
              },
              name: "天地电子"
            };
            break;
          case "foshanMapgLayer":
            layerConfig = {
              title: "佛山底图",
              labelLayer: null,
              name: "佛山底图"
            };
            break;
          default:
            break;
        }
        layerConfig.layerType = layerType;
        (layerConfig.active = mapType === layerType),
          !!layerConfig.labelLayer &&
            (layerConfig.labelLayer.active = this.defaultMap[layerType][0]);
        this.baseLayers.push(layerConfig);
      }
      this.activeDefaultLayerType(layerTypes, mapType);
    } catch (error) {}
  }
   activeDefaultLayerType(layerTypes, defaultType) {
    const index = layerTypes.findIndex(value => {
      return value === defaultType;
    });
    if (index !== layerTypes.length - 1) {
      const defaultLayer = this.baseLayers.splice(index, 1);
      this.baseLayers.push(defaultLayer[0]);
    }
  }

  /**
   * 设置 defaultMap 的状态，并通过 baselayersManager 更新到 localStorage 中。
   *
   * @param {BaseLayerCfg} baseLayerCfg 显示的底图配置
   * @param {boolean} isActive 是否显示
   * @param {boolean} isLabelLayer 是否是标签图层
   * @memberof MapSwitchService
   */
  defaultMapChanged(baseLayerCfg, isLabelLayer) {
    const layerTpye = baseLayerCfg.layerType;
    if (isLabelLayer) {
      const labelLayer = baseLayerCfg.labelLayer;
      this.defaultMap[layerTpye][0] = labelLayer.active;
    } else if (baseLayerCfg.active) {
      this.defaultMap.mapType = layerTpye;
    }
    // this.baselayersManager.setDefaultLayers(this.defaultMap);
  }

  setBaseLayerVisible(baseLayerCfg, visible) {
    const layerTpye = baseLayerCfg.layerType;
    this.setBaseLayerVisibleById(layerTpye, visible);
  }
  setBaseLayerVisibleById(layerId, visible) {
    let map = this.map;
    if (!!map) {
      const baseLayer = map.getLayerById(this.baselayersManager.getBaseLayerId(layerId));
      !!baseLayer && baseLayer.setVisible(visible);
    }
  }
  /**
   * 切换正在显示的底图类型
   * * 将旧地图组隐藏，显示新地图组
   * * 更新存储在 localStorage 中的 defaultMap
   * @param {BaseLayerCfg} from
   * @param {BaseLayerCfg} to
   * @memberof MapSwitchService
   */
  changeBaseLayerType(from, to) {
    this.setBaseLayerGroupVisible(from, false); // 旧图层
    this.setBaseLayerGroupVisible(to, true); // 新图层
    this.defaultMapChanged(to, false);
  }

  setBaseLayerGroupVisible(baseLayerCfg, visible) {
    if (baseLayerCfg === undefined) {
      return;
    }
    const layerType = baseLayerCfg.layerType;
    const labelLyType = this.defaultMap[layerType];
    if (!!labelLyType) {
      this.setBaseLayerVisibleById(labelLyType[1], !visible ? false : labelLyType[0]);
    }
    this.setBaseLayerVisibleById(layerType, visible);
  }

   initBaseLayers() {
    this.defaultMap = this.baselayersManager.getDefaultLayers();
    this.setBaseLayers();
  }
}
