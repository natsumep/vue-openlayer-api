import * as SMap from "@/assets/plugin/map.js";
const {
  VectorLayer,
  ClusterVectorLayer,
  IconStyle,
  getClusterStyle,
  Heatmap,
} = SMap;
// import {VectorLayer ,ClusterVectorLayer ,  IconStyle , getClusterStyle} from 'slol';

import { getUUID } from "./utils";
import { getPointStyle } from "./operationMap";
const defaultClusterOption = {
  distance: 100,
  minClusterResolution: 0.000005364418029785156,
};

export class LayerService {
  map = null;
  layerList = {};
  constructor(map) {
    this.map = map;
  }
  createLayer(id = getUUID(), callback, options = {}) {
    if (!this.layerList[id]) {
      const vectorLayer = new VectorLayer({
        id,
        ...options,
      });
      this.layerList[id] = vectorLayer;
      // this.layerList[id].eventManager.addEvent("click",(e)=>{
      //   e.data.data && e.data.data.click && e.data.data.click(e.data,e)
      //   callback && callback(e.data,e)
      //   console.log(e)
      // })
      this.layerList[id].hasAnimtion = options.hasAnimtion;
      this.layerList[id].eventOnClick = (e) => {
        let v, c;
        if (e.data && e.data.data && e.data.data.click) {
          v = e.data.data.click(e, e.data);
        }
        if (callback) {
          c = callback(e, e.data);
        }
        if (v === false || c === false) {
          return false;
        }
      };
      this.map.addLayer(vectorLayer);
    }
    return { layer: this.layerList[id], id };
  }
  destroyLayer(layer) {
    try {
      if (typeof layer === "number") {
        const la = this.map.getLayerById(layer);
        la && this.map.removeLayer(la);
      } else {
        this.map.removeLayer(layer);
      }
      layer.clear();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  getLayerById(id) {
    return this.layerList[id] || null;
  }
  getAllLayer() {
    return Object.values(this.layerList);
  }
  setVisible(layer, visible) {
    layer.setVisible(visible);
  }
  clearLayer(layer) {
    layer.clear();
  }

  createClusterLayer(id, option, callback) {
    if (!this.layerList[id]) {
      // const styleInfo = new Style(option.clusterStyleOptions)
      const vectorLayer = new ClusterVectorLayer({
        ...defaultClusterOption,
        ...option,
        // style:getClusterStyle
        // style:styleInfo.styleFunction.bind(styleInfo)
      });

      const clusterStyleOptions = option.clusterStyleOptions
        ? { ...option.clusterStyleOptions }
        : {};
      clusterStyleOptions.singleStyleFunction = (singleFeature) => {
        const style =
          (singleFeature.values_.features[0].values_.data &&
            singleFeature.values_.features[0].values_.data.style) ||
          null;
        if (!style) {
          const s = getPointStyle(option.singleStyle || {});
          return s;
        }
        return getPointStyle(style);
      };
      vectorLayer.setStyle((feature) => {
        //使用聚合图层样式
        return getClusterStyle(feature, clusterStyleOptions);
      });
      this.layerList[id] = vectorLayer;
      this.layerList[id].eventOnClick = (e) => {
        let c;
        if (callback) {
          c = callback(e, e.data);
        }
        if (c === false) {
          return false;
        }
      };
      this.map.addLayer(vectorLayer);
    }
    return { layer: this.layerList[id], id };
  }

  createHeatmap(id, option) {
    if (!this.layerList[id]) {
      const {
        gradient = ["#0000ff", "#0ff", "#0f0", "#ff0", "#f00"],
        radius = 8,
        blur = 15,
      } = option;
      const v = new VectorLayer().getSource();
      this.layerList[id] = new Heatmap({
        source: v,
        blur,
        radius,
        gradient,
        weight: function (feature) {
          return true;
        },
      });
    }
    this.map.addLayer(this.layerList[id]);
    return { layer: this.layerList[id], id };
  }
}

class Style {
  constructor(clusterOption) {
    this.clusterOption = clusterOption;
  }
  styleFunction(feature) {
    const features = feature.get("features");
    if (!features || !features.length) {
      if (!!feature) {
        return this.getSingleStye(feature);
      }
      return;
    }

    const size = features.length;
    // 所聚合点本身就有聚合的特征时

    if (size === 1) {
      return this.getSingleStye(features[0]);
    } else if (size > 1) {
      return this.getClusterBreakStyle(size);
    }
  }

  getSingleStye(singleFeature) {
    // const hasIconPath = singleFeature.get("properties") && singleFeature.get("properties")["iconPath"];
    const styleoption =
      (singleFeature.getProperties().data &&
        singleFeature.getProperties().data.style) ||
      {};
    const style = new IconStyle(
      styleoption
      // text:this.getText(name,{
      //   offsetY:-40
      // })
    );
    // style.setGeometry(singleFeature.getGeometry());
    // 如果没有传iconPath 对默认的样式做一层缓存  如果有就用自己的
    return style;
  }
  getClusterBreakStyle(size) {
    const style = new IconStyle(
      {
        ...this.clusterOption,
        text: {
          ...this.clusterOption.text,
          text: size,
        },
      }
      // text:this.getText(name,{
      //   offsetY:-40
      // })
    );
    return style;
  }
}
