## 地图组件开发文档参考

### 加载地图组件

```js
<template>
    <MapView/>
</template>

import MapView from "./components/map/MapView.vue";  // 这个根据实际情况找到MapView组件
export default {
  // ...
  components: {   // 组件注册 也可以全局注册
    MapView,
  },
  // ...
}
// 全局注册
Vue.component('MapView', MapView)；
```

### 组件参数 Attributes

> 组件支持
> | 参数 | 说明 | 类型 | 可选值 | 默认值 |
> | ----------------- | ------------------------------------- | ------- | ---------- | ------ |
> | layerList | 图层管理中的图层列表,详细说明参考下方 | Array | - | [] |
> | showLayerControl | 是否显示图层管理控件 | Boolean | true/false | true |
> | showSelectControl | 是否显示地图框选控件 | Boolean | true/false | true |

#### layerList 图层管理参数说明

> layerList 的配置字段说明

| 参数           | 说明                                     | 值      | 默认值 |
| -------------- | ---------------------------------------- | ------- | ------ |
| name           | 分组名称                                 | string  | -      |
| layers         | 图层数据列表                             | array   | []     |
| visible        | 当前分组是否展开                         | boolean | true   |
| layers.visible | 当前图层是否默认勾选                     | boolean | false  |
| layers.extent  | 当前图层的边界范围，图层发布后可以获取到 | array   | 全部   |
| layers.label   | 图层名称，在图层管理控件中显示的名称     | string  | -      |
| layers.type    | 图层类型，默认给 `wmts`（瓦片）          | string  | -      |
| layers.layer   | 图层 id，图层发布后可以获取到            | string  | -      |

### 组件事件 Events

| 事件名称     | 说明                           | 回调参数                                 |
| ------------ | ------------------------------ | ---------------------------------------- |
| map-init     | 地图渲染成功触发               | 返回图层组件实例，通过该实例调用地图方法 |
| select-layer | 地图框选组件在地图上框选后触发 | 返回地图框选后的数据，具体数据见下方     |

#### select-layer 返回数据

| 参数            | 类型         | 说明                                                     |
| --------------- | ------------ | -------------------------------------------------------- |
| data            | Array        | 框选到的数据组 每个数据代表一个点 or 线 or 面            |
| data.data       | any          | 渲染数据时传入的 data 数据，传入方式参考下方，渲染点线面 |
| data.coordinate | coordinate[] | 当前元素的数据，点 or 线 or 面                           |

### 地图实例方法

#### 图层相关

> 点线面数据都是渲染在图层上的，一个图层可以渲染多个点线面数据, 目前仅支持清除当前图层上的所有数据，可以根据具体的业务规则，新增多个图层，以便清理数据

| 方法名                 | 说明                                                                                             | 参数                                                                                                                                                                               | 返回            | 调用                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------- |
| createLayer            | 创建一个图层，该图层用于承载地图数据（点线面）                                                   | 图层 id 可以不传，默认会生成一个图层 id（uuid）建议根据业务自己生成一个，重复创建同一个 id 图层 会返回第一次创建的图层。 图层点击事件，如果点击了该图层中的点线面元素 会触发该事件 | 返回一个图层 id | (layerid?: string,clickCallback?: function)=> layerid |
| removeLayer(id)        | 从地图移除一个图层，移除的图层会自动清理上面的所有数据；如果移除了，需要再次调用创建图层的方法， | 需要移除的图层 id；必传                                                                                                                                                            | viod            | (layerid: string)=> void                              |
| clearLayer(id)         | 清理当前图层上的所有数据                                                                         | 需要移除的图层 id；必传                                                                                                                                                            | void            | (layerid: string)=> void                              |
| setVisible(id,visible) | 显示或者隐藏当前的图层                                                                           | 需要移除的图层 id , 是否显示                                                                                                                                                       | void            | (layerid: string,visible:boolean)=> void              |

> 特殊说明: 图层的点击事件 会返回当前点击的元素的坐标信息和传入的 data 数据~ 如果给渲染的元素绑定了事件，两个都会触发

#### clickCallback(e,data) 参数说明
|参数|类型| 说明|
|-|-|-|
|e|object| 返回点击的一些信息，在创建弹窗传入可以通过传入e 而省略掉coordinate和data的传入|
|e.originEvent| object| 类似click 的event，通常用不上 |
|e.data| any| 和下方的data是同一个对象 |
|data|any|点击的要素 渲染时传入的data数据，没有为null|


```js
// 创建图层
export default {
  data(){
    return {
      _map:null,
			dataLayer:{}
    }
  },
  methods: {
    // 必须要在地图渲染完毕的回调中使用！！！ 否则可能拿不到地图实例~
    mapInit(evt){
			this._map = evt;
			const dataLayer = this.createLayer('data');
      this._map.showOneStylePoints([[113.137599, 23.031483],[113.136599, 23.021483]],{
				text:{
					text:"data"
				}
			},this.dataLayer.data)
		},
		createLayer(name){
			const layer = this._map.createLayer();
			this.dataLayer[name]=layer;
		}
  },

```

#### 渲染点数据

> 目前支持渲染同一个样式的多个点，和不同样式的多点组合

| 方法名              | 说明                   | 参数                                                   | 返回 | 调用                                          |
| ------------------- | ---------------------- | ------------------------------------------------------ | ---- | --------------------------------------------- | -------------------------------------------------------------------- |
| showOneStylePoints  | 渲染同一个样式的多个点 | (coordinates,style,layerid)经纬度点数组，样式，图层 id | void | (coordinates: coordinate[]                    | {point:coordinate,data:any}[] ,style:iconStyle,layerid:string)=>void |
| showMoerStylePoints | 渲染不同样式的多点组合 | (pointsInfo,layerid)点数组，图层 id                    | void | (pointsInfo:pointInfo[],layerid:string)=>void |

##### coordinates

> 经纬度数组 例如：[[113.137599, 23.031483]] ps:[经度，纬度]  
> 数组内支持放一个 data 对象和经纬度数组， 例如 {point:coordinate,data:{value:1232,click:()=>{}}}
> 特殊说明： 如果 data 里面包含 click 这个参数且这个参数是一个函数， 那么 点击该点会触发该函数

###### 不需要信息的点

| 名称        | 类型         | 说明                                                     |
| ----------- | ------------ | -------------------------------------------------------- |
| coordinates | coordinate[] | 经纬度数组 例如：[113.137599, 23.031483] ps:[经度，纬度] |

###### 需要包含信息的点数据

| 名称       | 类型        | 说明                                                     |
| ---------- | ----------- | -------------------------------------------------------- |
| point      | coordinates | 经纬度数组 例如：[113.137599, 23.031483] ps:[经度，纬度] |
| data       | object      | 事件或者框选能获取到的信息                               |
| data.click | function    | 触发单个点的点击事件                                     |
| data.\*    | any         | 自定义数据                                               |

##### iconStyle

> 配置点的样式，支持图片，和文字下标

| 名称   | 类型             | 说明                                                                                          |
| ------ | ---------------- | --------------------------------------------------------------------------------------------- |
| icon   | IconOptions      | 设置图片样式 ps: 仅点数据支持                                                                 |
| text   | InnerTextOptions | 设置文字样式，若没有则不显示文字                                                              |
| type   | string           | 设置点的样式，没有为图片 icon , 如果为 circle ,渲染成一个圆 ，支持填充和边框 ps: 仅点数据支持 |
| circle | CircleOptions    | 圆的样式配置,仅当 type 设置成 circle 时生效， ps: 仅点数据支持                                |

##### CircleOptions

| 名称   | 类型          | 说明                                 |
| ------ | ------------- | ------------------------------------ |
| radius | number        | 设置半径                             |
| fill   | FillOptions   | 设置填充                             |
| stroke | StrokeOptions | 设置画笔，画笔通常用来描绘图形的边界 |

###### FillOptions

| 名称  | 类型              | 说明                  |
| ----- | ----------------- | --------------------- |
| 名称  | 类型              | 说明                  |
| color | Color / ColorLike | 复合 css 规范的颜色值 |

###### StrokeOptions

| 名称           | 类型              | 说明                                                      |
| -------------- | ----------------- | --------------------------------------------------------- |
| color          | Color / ColorLike | 复合 css 规范的颜色值                                     |
| width          | number            | 画笔宽度                                                  |
| lineCap        | string            | 线段末端样式，默认 round 即圆形线帽                       |
| lineJoin       | string            | 当两条线条交汇时，交汇处样式，默认 round 即圆形           |
| lineDash       | number[]          | 描绘实线虚线相间的线段，从实线开始描绘，默认 null，即实线 |
| lineDashOffset | number            | 虚线样式起始偏移量，默认 0                                |
| miterLimit     | number            | 斜接长度，即在两条线交汇处内角和外角之间的距离，默认 10。 |

##### IconOptions

> 样式的具体配置

| 名称         | 类型          | 说明                                                               |
| ------------ | ------------- | ------------------------------------------------------------------ | --- | --------------------------------------- |
| src          | string        | 设置自定义图片路径，否则使用默认图片                               |
| size         | Array<number> | 设置图片的大小，第一个元素代表宽度，第二个代表高度，一般不需要设置 |
| offset       | Array<number> | 图片偏移，默认[0, 0]，一般不需要设置                               |
| offsetOrigin | string        | 偏移原点，可选值 bottom-left，bottom-right，top-left，             |     | top-right，默认 top-left 一般不需要设置 |
| opacity      | number        | icon 透明度，默认 1                                                |
| scale        | number        | 缩放程度，默认 1，如果图片大小刚好 ，可以不用设置                  |

##### InnerTextOptions

> 点下面的文字配置说明

| 名称      | 类型          | 说明                                                                                                                                                                                                     |
| --------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| text      | string        | 文字内容                                                                                                                                                                                                 |
| font      | string        | css 字体大小，查看 [https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font) 默认 10px sans-serif |
| offsetX   | number        | 水平偏移，默认 0                                                                                                                                                                                         |
| offsetY   | number        | 垂直偏移，默认 0                                                                                                                                                                                         |
| textAlign | string        | 文字布局，可能的值 left, right, center, end 或者 start。默认 center                                                                                                                                      |
| padding   | Array<number> | 设置文字内内边距，默认[0, 0, 0, 0]                                                                                                                                                                       |

##### pointInfo 相关

```js
// 参考配置
showMoerStylePoints(
  [
    {
      points: [
        [111, 12],
        {
          point: [111, 11],
          data: {
            value: "test",
            click: () => {},
          },
        },
      ],
      style: {
        // ... 具体的样式配置
      },
    },
  ],
  "layerId_test"
);
```

| 名称   | 类型        | 说明                                   |
| ------ | ----------- | -------------------------------------- |
| points | coordinates | 点的类型数组，参考上放的点数据传入方式 |
| style  | iconStyle   | 参考上方 点的样式                      |

```js
// 创建图层
export default {
  data(){
    return {
      _map:null,
			dataLayer:{}
    }
  },
  methods: {
    // 必须要在地图渲染完毕的回调中使用！！！ 否则可能拿不到地图实例~
    mapInit(evt){
			this._map = evt;
      const dataLayer = this.createLayer('dataLayer','dataLayer_id',(data,event)=>{console.log(data,event)});
      const moreStyleLayer = this.createLayer('moreStyleLayer','moreStyleLayer_id',(data,event)=>{console.log(data,event)});
      // 所有的点都是统一的样式
      this._map.showOneStylePoints([[113.137599, 23.031483],{point:[113.136599, 23.021483], data:{
          value:"test",
          click:()=>{}
        }
        }],{
				text:{
					text:"data"
				}
      },this.dataLayer.dataLayer)

      // 根据不同的类型显示不同的点的样式
       this._map.showMoerStylePoints([
         // 第一组点
         {
           // 点的数组，如果只是展示 可以直接给经纬度数组，如果有点击 或者框选，需要传入对象数组！。
           points:[
             [113.137599, 23.031483],
            {
              point:[113.136599, 23.021483], data:{
                value:"test",
                click:()=>{}
              }
            }
          ],
          // 配置点的样式
        	style:{
            text:{
              text:"data"
            }
          }
         },
        // 第二组点~
        // ...
       ],
       this.dataLayer.moreStyleLayer
       )
		},
		createLayer(name,id,callback){
			const layer = this._map.createLayer(id,callback);
			this.dataLayer[name]=layer;
		}
  },
```

#### 渲染线数据数据

> ps: 方法参考渲染点数据的 api 区别的话 一个是传入点数组， 线是传入,线的数组 :[[111,11],[111,11],[111,11]];
> 默认颜色为 蓝色，线宽为 2

| 名称               | 类型 | 说明                 |
| ------------------ | ---- | -------------------- |
| showMoerStyleLines | -    | 渲染多种样式的线数组 |
| showOneStyleLines  | -    | 渲染同种样式的先数组 |

> 和点 api 的区别 point 替换为 line points 替换为 lines

##### 线的样式配置

> text 参考上面的文字样式

| 名称   | 类型             | 说明                 |
| ------ | ---------------- | -------------------- |
| text   | InnerTextOptions | 可选参数，文本对象   |
| stroke | StrokeOptions    | 可选参数，线对象     |
| fill   | FillOptions      | 可选参数，线填充对象 |

###### FillOptions

> 仅支持配置颜色

| 名称  | 类型  | 说明                            |
| ----- | ----- | ------------------------------- |
| color | Color | ColorLike 复合 css 规范的颜色值 |

###### StrokeOptions

| 名称           | 类型     | 说明                                                      |
| -------------- | -------- | --------------------------------------------------------- |
| color          | Color    | ColorLike 复合 css 规范的颜色值                           |
| width          | number   | 画笔宽度                                                  |
| lineCap        | string   | 线段末端样式，默认 round 即圆形线帽                       |
| lineJoin       | string   | 当两条线条交汇时，交汇处样式，默认 round 即圆形           |
| lineDash       | number[] | 描绘实线虚线相间的线段，从实线开始描绘，默认 null，即实线 |
| lineDashOffset | number   | 虚线样式起始偏移量，默认 0                                |
| miterLimit     | number   | 斜接长度，即在两条线交汇处内角和外角之间的距离，默认 10。 |

#### 渲染面数据数据

> ps: 方法参考渲染面数据的 api 区别的话 一个是传入点数组， 线是传入,线的数组 :[[[111,11],[111,11],[111,11]]];
> 默认颜色为 蓝色，线宽为 2 填充为半透明
> 样式参考线的样式

> 和线 api 的区别 line 替换为 polygon lines 替换为 polygons

| 名称                 | 类型 | 说明                 |
| -------------------- | ---- | -------------------- |
| showMoerStylePolygon | -    | 渲染多种样式的线数组 |
| showOneStylePolygon  | -    | 渲染同种样式的先数组 |



#### 加载地图弹窗
> 弹窗内容目前支持两种形式，一种是传入一段 `dom` 结构, 内部通过 `innerHTML` 的形式插入
> 另一种是 通过传入一个 `Vue` 组件 的形式传入，保留了 `Vue` 的响应式。

##### api
| 名称                 | 类型 | 说明                 |
| -------------------- | ---- | -------------------- |
| showInfoWindow| showInfoWindow(id,option) | 传入一个坐标和 内容 和 title 生成一个弹窗|

##### showInfoWindow 参数说明

| 名称                 | 类型 | 说明                 |
|-|-|-|
|id| string| 必传，同一个id的弹窗不会重复弹出，只会移动位置，如果需要弹出多个，需要传入不同的id|
|option| object| -|
|option.content| string/vueComponetn| 支持传入 dom 字符串和vue组件，填充到内容区|
|option.title|string| 弹窗的title|
|option.event| 地图点击事件的 event | 弹窗可以通过这个event 获取到 coordinate 和 data|
|option.coordinate| coordinate[]| 弹窗的坐标位置，如果传入该字段 ，会忽略event中的坐标 |
|option.data| 如果content是vue组件，那么data的所有字段会通过props的形式传入到组件中，组件必须要在props中声明对应的变量接收，如果是字符串dom 会通过对应的key替换dom字符串中的${key}|
|option.onClose| function| 弹窗关闭的回调事件|

> ps dom字符串中如果存在 ${name} 同时 data中存在name 属性 ，那么会dom中的 ${name } 替换成 data中的name的值； 起到一个插值替换的效果。
```js
let content = '<div>${name}</div>'
let data = {name:"test"};
// 渲染成
// '<div>test</div>'

```