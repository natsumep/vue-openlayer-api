<template>
  <div id="app">
    <MapView :layerList="layerList"  @map-init="show" @select-layer="showSelect" />
  </div>
</template>

<script>
import MapView from "./components/map/MapView.vue";
import textC from "./components/Test.vue";
export default {
  name: "App",
  data(){
    return {
      _map:null,
      layerList:[
				{
					name: "全部图层",
					visible:true,
					layers: [
						{
							visible: true,
							extent: [	112.833129882812,22.8010864257812,113.257690429688,23.3165283203125],
							label: "区界",
							type: "wmts",
							layer: "defaultWorkspace:table_qj_1_1",
						},
						{
							visible: false,
							extent: [112.832869511553,22.8045728213684,113.257685380123,23.3168808711001],
							label: "村居",
							type: "wmts",
							layer: "defaultWorkspace:table_cj_1_1",
							
						},
						{
							visible: false,
							extent: [	112.832891723145,22.8008190624659,113.257601671832,23.3167616692251],
							label: "大气环境",
							type: "wmts",
							layer: "defaultWorkspace:table_dqhj_1_1",
							
						},
						{
							visible: false,
							extent:[112.862745753657,22.8095325876504,113.25033824168,23.3133502501158],
							label: "工业园区",
							type: "wmts",
							layer: "defaultWorkspace:table_gyyq_1_1",
							
						},
						{
							visible: false,
							extent: [	112.886815468469,22.8304632738622,113.211315728117,23.2854979009025],
							label: "黑臭水体 ",
							type: "wmts",
							layer: "defaultWorkspace:table_hcst_1_1",
							
						},
						{
							visible: false,
							extent: [112.832891723145,22.8008190624659,113.257601671832,23.3167616692251],
							label: "镇街",
							type: "wmts",
							layer: "defaultWorkspace:table_zj_1_1",
							
						},
						{
							visible: false,
							extent: [	112.813528120518,22.7887866050005,113.230227070872,23.1663007137558],
							label: "水保区",
							type: "wmts",
							layer: "defaultWorkspace:table_sbq_1_1",
							
						},
					],
				},
			],
			dataLayer:{}
    }
  },
  components: {
    MapView,
  },
  methods: {
		showSelect(evt){
			console.log(evt)
		},
    show(evt){
			this._map = evt;
			// this._map.map.on('singleclick',(e)=>{console.log(e)})
			this.showLines();
			this.showPoints();
		},
		showPoints(){
			 this.createLayer('dataLayer','dataLayer_id',(data,event)=>{
				//  this._map.showInfoWindow("dataLayer_id",{
				// 	 content:"<div>${value}</div>"+ +new Date(),
				// 	 title:"123123",
				// 	 event,
				//  }
				 this._map.showInfoWindow("dataLayer_id",{
					 content:textC,
					 title:"123123",
					 event,
					 onClose(){
						 console.log('123123123213sdfdsf')
					 }
				 }
			 )});
			this.createLayer('moreStyleLayer','moreStyleLayer_id',(event)=>{ this._map.showInfoWindow("dataLayer_id",{
					 content:`<div>\${value}</div>`,
					 title:"我是title",
					 event,
					 data:{
						 value:"我是值~"
					 },
					 onClose(){
						 alert("关闭了弹窗")
					 }
				 })
		});

			// 所有的点都是统一的样式
      this._map.showOneStylePoints([[113.137599, 23.031483],{point:[113.136599, 23.021483], data:{
					value:"test",
					showPointText:"showPointText",
          click:()=>{}
        }
        }],{
				text:{
					text:"data",
					fill:{
					},
				},
				circle:{

				},
				type:"circle"
      },this.dataLayer.dataLayer)
      
      // 根据不同的类型显示不同的点的样式
       this._map.showMoerStylePoints([
         // 第一组点
         {
           // 点的数组，如果只是展示 可以直接给经纬度数组，如果有点击 或者框选，需要传入对象数组！。
           points:[
             [113.127599, 23.031483],
            {
              point:[113.135599, 23.021483], data:{
                value:"12",
                click:()=>{}
              }
            }
          ],
          // 配置点的样式
        	style:{
            text:{
							text:"12",
							offsetY:'-20'
            }
          }
				 },
				 {
           // 点的数组，如果只是展示 可以直接给经纬度数组，如果有点击 或者框选，需要传入对象数组！。
           points:[
             [113.235599, 23.131483],
            {
              point:[113.236599, 23.41483], data:{
                value:"test",
                click:()=>{}
              }
            }
          ],
          // 配置点的样式
        	style:{
            text:{
							text:"test",
							offsetY:'10'
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
		},
		showLines(){
		 	this.createLayer('lineLayer','lineLayer',(e)=>{console.log(e)});
       this.createLayer('lineLayers','lineLayers',(e)=>{console.log(e)});
      // 所有的点都是统一的样式
			this._map.showOneStyleLines([[[113.137599, 23.031483],[113.127599, 23.021483],[113.133599, 23.131483]],{line:[[113.134599, 23.521483],
			[113.135599, 23.021483],[113.134699, 23.021483]], data:{
          value:"test",
          click:()=>{}
        }
        }],{
				text:{
					text:"line",
				},
				stroke:{
						width:5
					}

      },this.dataLayer.lineLayer)
      
      //根据不同的类型显示不同的点的样式
       this._map.showMoerStyleLines([
         // 第一组点
         {
           // 点的数组，如果只是展示 可以直接给经纬度数组，如果有点击 或者框选，需要传入对象数组！。
           lines:[
             [[113.117599, 23.031483],[113.114599, 23.031483],[113.115599, 23.031483],[113.116599, 23.031483]],
            {
              line:[[113.118599, 23.031483],[113.119599, 23.031483],[113.120599, 23.031483],[113.121599, 23.031483]], data:{
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
				 {
           // 点的数组，如果只是展示 可以直接给经纬度数组，如果有点击 或者框选，需要传入对象数组！。
           lines:[
             [[113.185599, 23.131483],[113.184599, 23.131483],[113.183599, 23.131483],[113.182599, 23.131483]],
            {
              line:[[113.155599, 23.131483],[113.154599, 23.131483],[113.185299, 23.131483],[113.185199, 23.131483],], data:{
                value:"test",
                click:()=>{}
              }
            }
          ],
          // 配置点的样式
        	style:{
            text:{
							text:"test",
							offsetY:'10'
            }
          }
         },
       ],
       this.dataLayer.lineLayers
       )
		}
  },
};
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
}
</style>
