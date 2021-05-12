import * as SMap from "@/assets/plugin/map.js";
import { getUUID, deepClone } from "./utils";
const { InfoWindow } = SMap;
import Vue from "vue";
export class OpenInfoWindow {
  infoWindow = null;
  infoWindowConenteId = "id" + "__" + getUUID();
  infoWindowContent = "";
  isVue = false;
  vueComponent  = null;
  constructor(id, option, map) {
    this.map = map;
    this.id = id;
    const { parent, content } = option;
    this.componentParent = parent
    this.infoWindowContent = content;
     
  }
  initVueContent(content, data) {
    let propsData = {
      ...data,
    };
    propsData["layerid"] = this.id;
    // propsData["lydata"] = this.options.content.data;
    // propsData["lyoption"] = this.options;
    const com =  Vue.extend(content)
    let instance = new com({
      // parent: this.componentParent,
      propsData: propsData
    })
    instance.vm = instance.$mount();
    this.vueComponent = instance;
    return instance.vm.$el;
  }
  setContent(contentTem, titleTem, data) {
    let content = contentTem || this.infoWindowContent;
    const title = titleTem;
    if (this.isVue) {
      content = this.initVueContent(contentTem, data);
      this.infoWindow.setContainer({
        content,
        title,
      });
    } else {
      this.infoWindow.setInfoTemple({
        content,
        title,
      });
    }
  }
  showInfoWinodow(coordinate, data, title) {
    this.createInfoWindow();
    // this.infoWindow && this.infoWindow.close();
    if (this.isVue) {
      const content = this.initVueContent(this.infoWindowContent,data);
      this.infoWindow.setContainerAndPosition(coordinate, { title, content });
    } else {
      this.infoWindow.setTitle(title);
      this.infoWindow.setFeatures(coordinate, [{ ...data, title }]);
    }
  }
  createInfoWindow(center) {
    if (this.infoWindow) {
      return;
    }
    this.infoWindow = new InfoWindow({
      position: center,
      isAutoPosition: true,
      enableDrag: true,
      closeCallback: () => {
        if(this.isVue){
          this.vueComponent && this.vueComponent.$destroy();
        }
        this.onClose && this.onClose();
      },
    });

    // 添加信息窗口
    this.map.addOverlay(this.infoWindow);
    if (!this.isVue) {
      this.infoWindow.setInfoTemple({
        title: "<span>${title}</span>",
        content: `
        <div id="${this.infoWindowConenteId}">
          ${(!this.isVue && this.infoWindowContent) || ""}
        </dib>`,
      });
    }
  }
}

const indowWindowList = {};

/**
 * 创建infowindow
 * 传入唯一id  每个id 单独享受一个弹窗
 * option :{
 *  parent: this,  // 如果是vue组件
 *  content: vueComponent, // import 的vue组件
 *  event: event, //如果是地图上点击事件 可以直接传event  包含 coordinate 和 data;
 *  coordinate: [111,11], // 经纬度坐标 ，如果存在 忽略event的坐标
 *  data: any,   // 可以传入vue 的数据 如果存在  忽略event中的data
 *  title: string, // 弹窗的标题
 * }
 *
 *
 */

export function showInfoWindow(id, option, map) {
  let { event, coordinate, data, content, title ,onClose } = option;
  if (!indowWindowList[id]) {
    indowWindowList[id] = new OpenInfoWindow(id, option, map);
  } else {
    indowWindowList[id].setContent(content, title, data);
  }
  onClose && (indowWindowList[id].onClose = onClose);
  if (!data) {
    data = event.data.data;
  }
  if (!coordinate) {
    coordinate = event.feature.getGeometry().getCoordinates();
  }
  if (typeof content === "object") {
    indowWindowList[id].isVue = true;

    // document.getElementById(this.id).appendChild(instance.vm.$el);
  }
  indowWindowList[id].showInfoWinodow(coordinate, data, title);
}
