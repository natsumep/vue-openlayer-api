import * as SMap from "@/assets/plugin/map.js";
const {VectorLayer } = SMap;
import { getUUID } from "./utils"
export class LayerService{
  map = null;
  layerList = {}
  constructor(map){
    this.map = map;
  }
  createLayer(id = getUUID(),callback){
    if(!this.layerList[id]){
      const vectorLayer = new VectorLayer({
        id,
      });
      this.layerList[id] = vectorLayer;
      // this.layerList[id].eventManager.addEvent("click",(e)=>{
      //   e.data.data && e.data.data.click && e.data.data.click(e.data,e)
      //   callback && callback(e.data,e)
      //   console.log(e)
      // })
      this.layerList[id].on("singleclick",(e)=>{
        e.data.data && e.data.data.click && e.data.data.click(e,e.data,)
        callback && callback(e,e.data,)
      })
      this.map.addLayer(vectorLayer);

      
    }
    return {layer:this.layerList[id],id}
  }
  destroyLayer(layer){
    try{
      if(typeof layer === 'number'){
        const la = this.map.getLayerById(layer);
        la && this.map.removeLayer(la)
      }else{
        this.map.removeLayer(layer)
      }
      layer.clear();
      return true
    }catch(e){
      console.error(e);
      return false
    }
  }
  getLayerById(id){
    return this.layerList[id] || null;
  }
  getAllLayer(){
    return Object.values(this.layerList);
  }
  setVisible(id,visible){
    const layer = this.getLayerById(id)
    layer.setVisible(visible)
  }
  clearLayer(id){
    const layer = this.getLayerById(id)
    layer.clear()
  }
}