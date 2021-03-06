## 地图组件开发文档参考

### 如何使用

将 src 下的 assets 中的所有文件 和 components 下的 map 移动到项目中对应的文件夹中。
demo 参考 app.vue 中的使用

> 部分组件依赖了 element-ui

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
> 特殊说明：关于点击事件， 如果存在多个图层叠加 会触发所有点击的事件 如果只想显示最上面的一个 需要在点击事件中返回 false ！必须是 false

| 方法名                 | 说明                                                                                             | 参数                                                                                                                                                                               | 返回            | 调用                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------- |
| createLayer            | 创建一个图层，该图层用于承载地图数据（点线面）                                                   | 图层 id 可以不传，默认会生成一个图层 id（uuid）建议根据业务自己生成一个，重复创建同一个 id 图层 会返回第一次创建的图层。 图层点击事件，如果点击了该图层中的点线面元素 会触发该事件 | 返回一个图层 id | (layerid?: string,clickCallback?: function,layerOptions:object)=> layer |
| removeLayer(layer)     | 从地图移除一个图层，移除的图层会自动清理上面的所有数据；如果移除了，需要再次调用创建图层的方法， | 需要移除的图层；必传                                                                                                                                                               | viod            | (layer: )=> void                                                        |
| clearLayer(id)         | 清理当前图层上的所有数据                                                                         | 需要移除的图层；必传                                                                                                                                                               | void            | (layer)=> void                                                          |
| setVisible(id,visible) | 显示或者隐藏当前的图层                                                                           | 需要显示或者隐藏的图层 , 是否显示                                                                                                                                                  | void            | (layerid: string,visible:boolean)=> void                                |

> 特殊说明: 图层的点击事件 会返回当前点击的元素的坐标信息和传入的 data 数据~ 如果给渲染的元素绑定了事件，两个都会触发

#### clickCallback(e,data) 参数说明

| 参数              | 类型          | 说明                                                                                |
| ----------------- | ------------- | ----------------------------------------------------------------------------------- |
| e                 | object        | 返回点击的一些信息，在创建弹窗传入可以通过传入 e 而省略掉 coordinate 和 data 的传入 |
| e.originEvent     | object        | 类似 click 的 event，通常用不上                                                     |
| e.data.coordinate | coordinates[] | 点击的要素的点线面数据                                                              |

| e.data.data | any | 和下方的 data 是同一个对象 |
| data | any | 点击的要素 渲染时传入的 data 数据，没有为 null |

#### layerOptions 创建图层配置参数

| 参数    | 类型      | 说明                                                                                             |
| ------- | --------- | ------------------------------------------------------------------------------------------------ |
| opacity | number    | 设置透明度，默认 1                                                                               |
| visible | boolean   | 图层可见性，默认 true                                                                            |
| zIndex  | number    | 设置图层层级                                                                                     |
| style   | StyleLike | 图层样式，该样式将应用在图层上的特征图形上 具体配置参考下方，如果给单个要素配置了样式 该样式无效 |

#### layer 图层方法说明

> 创建图层会返回一个图层， 该图层上存在一些方法可以直接调用。

| 名称       | 类型                       | 说明                   |
| ---------- | -------------------------- | ---------------------- |
| setOpacity | (opacity: number)=> void   | 设置图层透明度         |
| setStyle   | (style: StyleLike )=> void | 设置图层样式           |
| setVisible | (visible: boolean)=> void  | 设置图层可见性         |
| setZIndex  | (zIndex: number)=> void    | 设置图层层级           |
| clear      | ()=> void                  | 清除图层的所有 feature |

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

| 方法名              | 说明                   | 参数                                                   | 返回 | 调用                                                                                            |
| ------------------- | ---------------------- | ------------------------------------------------------ | ---- | ----------------------------------------------------------------------------------------------- |
| showOneStylePoints  | 渲染同一个样式的多个点 | (coordinates,style,layerid)经纬度点数组，样式，图层 id | void | (coordinates: coordinate[] {point:coordinate,data:any}[] ,style:iconStyle,layerid:string)=>void |
| showMoerStylePoints | 渲染不同样式的多点组合 | (pointsInfo,layerid)点数组，图层 id                    | void | (pointsInfo:pointInfo[],layerid:string)=>void                                                   |

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

| 名称      | 类型             | 说明                                                                                          |
| --------- | ---------------- | --------------------------------------------------------------------------------------------- |
| icon      | IconOptions      | 设置图片样式 ps: 仅点数据支持                                                                 |
| text      | InnerTextOptions | 设置文字样式，若没有则不显示文字                                                              |
| type      | string           | 设置点的样式，没有为图片 icon , 如果为 circle ,渲染成一个圆 ，支持填充和边框 ps: 仅点数据支持 |
| circle    | CircleOptions    | 圆的样式配置,仅当 type 设置成 circle 时生效， ps: 仅点数据支持                                |
| imageText | InnerTextOptions | 支持单个点配置两个文字 该选项仅点有效                                                         |

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

| 名称         | 类型          | 说明                                                                                          |
| ------------ | ------------- | --------------------------------------------------------------------------------------------- |
| src          | string        | 设置自定义图片路径，否则使用默认图片                                                          |
| size         | Array<number> | 设置图片的大小，第一个元素代表宽度，第二个代表高度，一般不需要设置                            |
| offset       | Array<number> | 图片偏移，默认[0, 0]，一般不需要设置                                                          |
| offsetOrigin | string        | 偏移原点，可选值 bottom-left，bottom-right，top-left, top-right，默认 top-left 一般不需要设置 |
| opacity      | number        | icon 透明度，默认 1                                                                           |
| scale        | number        | 缩放程度，默认 1，如果图片大小刚好 ，可以不用设置                                             |

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
| fill   | FillOptions      | 可选参数，线/面填充对象 |

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

> ps: 方法参考渲染先数据的 api 区别的话 一个是传入点数组， 线是传入面的数组 :[[[[111,11],[111,11],[111,11]]]];
> ps: 单面通常为一个三维数组 例如 [[[111,11],[112,12],[113,13],[114,14]]];
> ps: 多面通常为一个思维数组 例如 [[[[111,11],[112,12],[113,13],[114,14]]],[[[111,11],[112,12],[113,13],[114,14]]]];
> 这里传入的是一个面 or 多面的数组！！！；
> 默认颜色为 蓝色，线宽为 2 填充为半透明
> 样式参考线的样式

> 和线 api 的区别 line 替换为 polygon lines 替换为 polygons

| 名称                      | 类型 | 说明                   |
| ------------------------- | ---- | ---------------------- |
| showMoerStylePolygon      | -    | 渲染多种样式的面数组   |
| showOneStylePolygon       | -    | 渲染同种样式的面数组   |
| showMoerStyleMultiPolygon | -    | 渲染多种样式的多面数组 |
| showOneStyleMultiPolygon  | -    | 渲染同种样式的多面数组 |

#### 加载地图弹窗

> 弹窗内容目前支持两种形式，一种是传入一段 `dom` 结构, 内部通过 `innerHTML` 的形式插入
> 另一种是 通过传入一个 `Vue` 组件 的形式传入，保留了 `Vue` 的响应式。

##### api

| 名称           | 类型                      | 说明                                      |
| -------------- | ------------------------- | ----------------------------------------- |
| showInfoWindow | showInfoWindow(id,option) | 弹窗id, 传入一个坐标和 内容 和 title 生成一个弹窗 |

##### showInfoWindow 参数说明

| 名称              | 类型                           | 说明                                                                                                                                                                                                                                 |
| ----------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id                | string                         | 必传，同一个 id 的弹窗不会重复弹出，只会移动位置，如果需要弹出多个，需要传入不同的 id                                                                                                                                                |
| option            | object                         | -                                                                                                                                                                                                                                    |
| option.content    | string/vueComponetn            | 支持传入 dom 字符串和 vue 组件，填充到内容区                                                                                                                                                                                         |
| option.title      | string                         | 弹窗的 title                                                                                                                                                                                                                         |
| option.event      | 地图点击事件的 event           | 弹窗可以通过这个 event 获取到 coordinate 和 data                                                                                                                                                                                     |
| option.coordinate | coordinate[]                   | 弹窗的坐标位置，如果传入该字段 ，会忽略 event 中的坐标                                                                                                                                                                               |
| option.data       | object                         | 如果 content 是 vue 组件，那么 data 的所有字段会通过 props 的形式传入到组件中，组件必须要在 props 中声明对应的变量接收，如果是字符串 dom 会通过对应的 key 替换 dom 字符串中的${key},如果 data 是数组，弹窗内部支持切换，用于聚合图层 |
| option.onClose    | function                       | 弹窗关闭的回调事件                                                                                                                                                                                                                   |
| option.offset     | Array<number> （默认为[0，0]） | 放置叠加层时使用的像素偏移量。数组中的第一个元素是水平偏移量。正值将覆盖图右移。数组中的第二个元素是垂直偏移量。正值会将叠加层向下移动。                                                                                             |

> ps dom 字符串中如果存在 ${name} 同时 data 中存在 name 属性 ，那么会 dom 中的 ${name } 替换成 data 中的 name 的值； 起到一个插值替换的效果。

```js
let content = "<div>${name}</div>";
let data = { name: "test" };
// 渲染成
// '<div>test</div>'
```

### 聚合图层相关

> 聚合图层指在地图上显示的矢量数据，在一定距离内的数据对象将被整合成一个。 支持设置聚合距离，最小聚合的地图分辨率，以及不聚合时数据是否偏移。
> 特殊说明：聚合图层 在 18 级~ 20 级 不会聚合！！！

#### 使用，

> 和普通点 渲染一样， 聚合图层数据在渲染前需要创建一个聚合图层 ，聚合图层仅支持渲染点~

| 方法名                 | 说明                                                                                             | 参数                                                                                                                                                                                                    | 返回            | 调用                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------- |
| createClusterLayer     | 创建一个图层，该图层用于承载地图数据（点线面）                                                   | 图层 id 可以不传，默认会生成一个图层 id（uuid）建议根据业务自己生成一个，重复创建同一个 id 图层 会返回第一次创建的图层。/ 聚合图层相关配置， /图层点击事件，如果点击了该图层中的点线面元素 会触发该事件 | 返回一个图层 id | (layerid?: string,clusterOption:object,clickCallback?: function)=> layerid |
| removeLayer(id)        | 从地图移除一个图层，移除的图层会自动清理上面的所有数据；如果移除了，需要再次调用创建图层的方法， | 需要移除的图层 id；必传                                                                                                                                                                                 | viod            | (layerid: string)=> void                                                   |
| clearLayer(id)         | 清理当前图层上的所有数据                                                                         | 需要移除的图层 id；必传                                                                                                                                                                                 | void            | (layerid: string)=> void                                                   |
| setVisible(id,visible) | 显示或者隐藏当前的图层                                                                           | 需要移除的图层 id , 是否显示                                                                                                                                                                            | void            | (layerid: string,visible:boolean)=> void                                   |

#### clusterOption 参数说明

| 参数                | 类型    | 说明                                                                                                                        |
| ------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| distance            | number  | 聚合半径，单位：像素，默认值 100。非聚合时,且 canOffsetSingles 为 true，以这个值作为偏移的基础值（第 N 圈 偏移 N\*distance) |
| canOffsetSingles    | boolean | 当不聚合时，是否对重合点偏移，默认 false                                                                                    |
| className           | string  | 图层类名                                                                                                                    |
| opacity             | number  | 设置透明度，默认 1                                                                                                          |
| clusterStyleOptions | object  | 聚合图层样式配置，具体参考下方                                                                                              |

#### clusterStyleOptions 参数说明

| 参数        | 类型         | 说明                                                       |
| ----------- | ------------ | ---------------------------------------------------------- |
| numberGrade | number[]     | 将聚合数据分段默认为[10], 即默认分为 1, (1-10], >10        |
| styleGrade  | PointStyle[] | 根据分段配置样式，长度应为 numberGrade 长度 + 1。          |
| singleStyle | PointStyle   | 无聚合点样式, 如果单个点设置了特殊样式，会读取单个点的样式 |

> 若 styleGrade 数组中找不到对应配置样式，则采用默认样式。

#### PointStyle 参数说明

| 参数   | 类型             | 说明                             |
| ------ | ---------------- | -------------------------------- |
| circle | CircleOptions    | 设置原点样式                     |
| icon   | IconOptions      | 设置图片样式                     |
| text   | InnerTextOptions | 设置文字样式，若没有则不显示文字 |

> 具体样式参考上方配置
> 特殊说明：聚合点如果要显示数量，需要配置 text 字段，显示内容默认是聚合点的数量

#### clickCallback(e,data) 参数说明

| 参数              | 类型          | 说明                                                                                |
| ----------------- | ------------- | ----------------------------------------------------------------------------------- |
| e                 | object        | 返回点击的一些信息，在创建弹窗传入可以通过传入 e 而省略掉 coordinate 和 data 的传入 |
| e.originEvent     | object        | 类似 click 的 event，通常用不上                                                     |
| e.data.coordinate | coordinates[] | 点击的要素的点线面数据                                                              |

| e.data.data | any | 和下方的 data 是同一个对象 |
| data | any | 点击的要素 渲染时传入的 data 数据，没有为 null |

#### showClusterPoints 往聚合图层中添加点

| 方法              | 调用                                          | 说明                                                                |
| ----------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| showClusterPoints | (layerid: string , pints:coordinates[])=>void | 通过 map 对象调用 showClusterPoints 方法，传入聚合图层 id 和 点数组 |

### 热力图

> 用于将矢量点数据呈现为热图的图层

| 方法名                 | 说明                                                                                             | 参数                                                                                                                                           | 返回            | 调用                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------- |
| createHeatMapLayer     | 创建一个图层，该图层用于承载地图数据（点线面）                                                   | 图层 id 可以不传，默认会生成一个图层 id（uuid）建议根据业务自己生成一个，重复创建同一个 id 图层 会返回第一次创建的图层。/ 聚合图层相关配置， / | 返回一个图层 id | (layerid?: string,heatMapOption:object)=> layerid |
| removeLayer(id)        | 从地图移除一个图层，移除的图层会自动清理上面的所有数据；如果移除了，需要再次调用创建图层的方法， | 需要移除的图层 id；必传                                                                                                                        | viod            | (layerid: string)=> void                          |
| clearLayer(id)         | 清理当前图层上的所有数据                                                                         | 需要移除的图层 id；必传                                                                                                                        | void            | (layerid: string)=> void                          |
| setVisible(id,visible) | 显示或者隐藏当前的图层                                                                           | 需要移除的图层 id , 是否显示                                                                                                                   | void            | (layerid: string,visible:boolean)=> void          |

#### heatMapOption 热力图 图层配置说明

| 参数     | 类型     | 说明                                                                                      |
| -------- | -------- | ----------------------------------------------------------------------------------------- |
| radius   | number   | 半径大小（以像素为单位） 默认为 8                                                         |
| blur     | number   | 模糊大小（以像素为单位）默认为 15                                                         |
| gradient | string[] | 热图的颜色渐变，指定为 CSS 颜色字符串数组 默认为 ['#00f', '#0ff', '#0f0', '#ff0', '#f00'] |

### 往热力图添加点 showHeatMapPoints

| 方法              | 调用                                          | 说明                                                                |
| ----------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| showHeatMapPoints | (layerid: string , pints:coordinates[])=>void | 通过 map 对象调用 showHeatMapPoints 方法，传入热力图层 id 和 点数组 |

#### marker 地图渲染一个 dom

> marker 向地图添加一个 img 元素或者 dom 结构的覆盖物，该元素可以随着地图移动，并可以配置拖拽和可点击等功能。

| 方法         | 调用                                                        | 说明                                                                                                    |
| ------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| showMarker   | (point: Coordinate , MarkerOptions: MarkerOptions)=> marker | 通过 map 对象调用 showMarker 方法，传入坐标点和 marker 配置，渲染一个 dom 结构在地图上，返回一个 marker |
| removeMarker | (marker)=>void                                              | 通过 map 对象调用 removeMarker 方法，传入 marker，移除地图上的传入的 marker                             |

##### MarkerOptions 配置相关说明

> 支持传入一个 dom 对象 或者 一个 url 和 text 配置， 如果传入了 dom 会忽略 url 和 text；

|element| HTMLElement| 一个 dom 对象 ， 如果存在 dom 对象，会忽略 url 和 text|
|url |string| 自定义 img 路径|
|text| string| 自定义文字说明 出现在图片下面,不传不会渲染文字 |
|textCss| object| 传入一个样式对象,该样式会出现在该文字的 dom 节点上 例如：{color:"red"}|
|data| any |marker 附带数据，开启点击事件时会将该数据传递给点击事件回调|
|dragable| boolean |是否允许拖拽，默认 false|
|dragStart |(data: any, coordinate: Coordinate) => void |拖拽开始事件回调|
|dragEnd| (data: any, coordinate: Coordinate) => void |拖拽结束事件回调|
|clickable |boolean |是否允许点击|
|click |(data: any, coordinate: Coordinate) => void |点击事件回调|
|positioning |OverlayPositioning |定义覆盖物如何相对于它的位置布局，默认 top-left|
|offset| Array<number> |设置 overlay 相对于 position 的偏移，默认[0,0]，第一个元素代表水平偏移，第二个元素代表垂直偏移|
|stopEvent |boolean |是否阻止覆盖物事件传播到地图，默认 true|
|className| string| 在当前 marker 的外围添加一个 class，方便控制样式|

#### 地图绘制一个圆

> 方法参考绘制面

| 方法       | 调用                                                            | 说明                                                                        |
| ---------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| showCircle | (circleOption: circleOption , StyleInfo:StyleInfo, layer)=>void | 通过 map 对象调用 showHeatMapPoints 方法，传入圆的坐标半径，圆的样式， 图层 |

##### circleOption 圆的配置
> circleOption 中的所有数据都能在框选的时候拿到

| 参数   | 类型       | 说明               |
| ------ | ---------- | ------------------ |
| point  | coordinate | 已知点的经纬度坐标 |
| radius | number     | 圆的半径，单位 m   |
| any | any| 其他数据| 
> 样式配置参考上方点线面的配置
