import * as SMap from "@/assets/plugin/map.js";
const {
	DrawAndSelect
} = SMap;
class ShowDarw{
  _darw = null;
  //  constructor()
  createDarw(map,layerList,val,callback){
    if(this._darw){
      map.removeInteraction(this._darw);
      this._darw = null;
    }
    const type = val === 'Rect'?'Circle':val;
    const rectangle = val==='Rect'
    const options = {
          type,
          rectangle,
          vectorLayer:layerList,
          statusChange: (event) =>{
            event.data = event.data.filter(item=>{
              return !(item.data && item.data.__point_lable__ );
            })
            callback&& callback(event)
            // this.$emit("select-layer",event);
            map.removeInteraction(this._darw);
            this._darw = null;
          }
      };
      // 添加DrawAndSelect控件
      this._darw = new DrawAndSelect(options)
      map.addInteraction(this._darw);
  }
}

export const showDarw = new ShowDarw()