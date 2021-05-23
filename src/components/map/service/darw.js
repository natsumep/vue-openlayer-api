import * as SMap from "@/assets/plugin/map.js";
const { DrawAndSelect } = SMap;
class ShowDarw {
  _darw = null;
  //  constructor()
  createDarw(map, layerList, val, callback, isCreate) {
    if (this._darw) {
      map.removeInteraction(this._darw);
      this._darw = null;
    }
    const type = val === "Rect" ? "Circle" : val;
    const rectangle = val === "Rect";
    const options = {
      type,
      rectangle,
      vectorLayer: isCreate ? [] : layerList,
      statusChange: (event) => {
        if (!isCreate) {
          event.data = event.data.filter((item) => {
            return !(item.data && item.data.__point_lable__);
          });
          callback && callback(event);
          // this.$emit("select-layer",event);
        } else {
          const type = val;
          const coordinates = event.geometry.getCoordinates();
          let point = null,
            radius = null;
          if (type === "Circle") {
            point = event.geometry.getCenter();
            radius =
              event.geometry.getRadius() *
              map.getView().getProjection().getMetersPerUnit();
          }
          callback &&
            callback({
              type,
              coordinates,
              point,
              radius,
              geometry: event.geometry,
            });
        }
        map.removeInteraction(this._darw);
        this._darw = null;
      },
    };
    // 添加DrawAndSelect控件
    this._darw = new DrawAndSelect(options);
    map.addInteraction(this._darw);
  }
}

export const showDarw = new ShowDarw();
