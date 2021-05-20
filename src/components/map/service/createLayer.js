import * as SMap from "@/assets/plugin/map.js";
const { GoogleTileLayer,
  TDTileLayer,
  GeoWmtsTileLayer,
  GeoWmsImageLayer,
  GeoWfsVectorLayer } = SMap;

export class LayerFactory {
  constructor() {}

  getGoogleTileLayer = (type, tileOpt = {}, sourceOpt = {}) => {
    return new GoogleTileLayer(type, tileOpt, sourceOpt);
  };

  getTDTileLayer = (type, tileOpt = {}, sourceOpt = {}) => {
    return new TDTileLayer(type, tileOpt, sourceOpt);
  };
  getLayerArrayFromData(layerConfig) {
    const layerArray = [];
    if (layerConfig && layerConfig.length) {
      for (let i = 0, ilen = layerConfig.length; i < ilen; i++) {
        const params = layerConfig[i];
        const layer = this.createGeoServerLayer(params);
        params.layerInstance = layer;
        params.opacity = 100;
        layerArray.push(params);
      }
    }
    return layerArray;
  }
  /**
   * 根据配置生成geoserver图层
   * @param layerParams 图层配置
   */
  createGeoServerLayer(layerParams) {
    const type = layerParams.type.toLocaleLowerCase();
    switch (type) {
      case "wmts":
        return this._createWMTSLayer(layerParams);
      case "wms":
        return this._createWMSLayer(layerParams);
      case "wfs":
        return this._createWFSLayer(layerParams);
      case "foshan":
        return this._createFoshanLayer(layerParams)
      case "vectortile":
        return this._createVectorTileLayer(layerParams);
    }
  }

  // 创建WMS源数据
  createWMSSource(layerParams) {
    const params = { LAYERS: layerParams.layer };
    const customParams = this._getCustomParams(layerParams.customParams);
    if (customParams) {
      params[layerParams.customParams.key] = layerParams.customParams.value;
    }
    const tileWMS = new ImageWMS({
      url: layerParams.url
        ? layerParams.url
        : layerParams.geoserverUrl + "hlxj/wms",
      params,
      serverType: "geoserver",
      crossOrigin: "anonymous",
    });
    return tileWMS;
  }

  // 创建图层(xyz方式)
  _createWMTSLayer(layerParams) {
    const url = layerParams.url
      ? layerParams.url
      : layerParams.geoserverUrl + `gwc/service/wmts`;
    const wmsUrl = this._getWmsUrl(layerParams);
    const wmtsLayer = new GeoWmtsTileLayer({ ...layerParams, url, wmsUrl },{
      url:`http://10.168.74.215:8080/geoserver/gwc/service/wmts?Service=WMTS&layer=${layerParams.layer}&Version=1.0.0&Request=GetTile&Format=image/png&` +
      `tilematrixset=My_GoogleCRS84Quad&TileMatrix=GoogleCRS84Quad:{z}&TileRow={y}&TileCol={x}`,
      projection: 'EPSG:4326',
    });
    return wmtsLayer;
  }
  _createFoshanLayer(layerParams){
    const url = layerParams.url
    const map = new GeoWmtsTileLayer({
      url:`${layerParams.url}/tile/{z}/{y}/{x}`,
    },{
      projection:"EPSG:4326",
    })
    return map;
  }
  _createWMSLayer(layerParams) {
    const url = this._getWmsUrl(layerParams);
    const wmsLayer = new GeoWmsImageLayer({ ...layerParams, url,
     
    },{
      // imageLoadFunction(...data){
      //   console.log(data);
      // },
      url:url,
      imageLoadFunction:layerParams.imageLoadFunction||null,
      params:{
        ...layerParams.params
      }
    });
    return wmsLayer;
  }

  _getWmsUrl(layerParams) {
    return layerParams.url
      ? layerParams.url
      : layerParams.geoserverUrl + `jwhl/wms`;
  }

  _createWFSLayer(layerParams) {
    const url = layerParams.url
      ? layerParams.url
      : layerParams.geoserverUrl + `jwhl/wfs`;
    const wfs = new GeoWfsVectorLayer({ ...layerParams, url });
    return wfs;
  }

  _getCustomParams(originParams) {
    let customParams = "";
    if (!!originParams && originParams.value) {
      customParams = "&" + originParams.key + "=" + originParams.value;
    }
    return customParams;
  }

  _createVectorTileLayer(layerParams) {
    const url = layerParams.url
      ? layerParams.url
      : layerParams.geoserverUrl + `gwc/service/tms/1.0.0/`;
    const params = {
      ...layerParams,
      url,
      updateWhileInteracting: false,
      useInterimTilesOnError: false,
    };
    const vTile = new GeoVectorTileLayer(params);
    return vTile;
  }
}
