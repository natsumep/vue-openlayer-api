<template>
	<div class="map-box">
		<div class="map-box" ref="map"></div>
		<LayerManage
			class="map-container"
			style="width: 45px; height: 45px"
			v-if="map && showLayerControl"
			:map="map"
			:layerList="layerList"
		/>
		<SelectBox
			@select-layer="onslect"
			:layerList="mapLayerList"
			class="map-container selete-box"
			v-if="map && showSelectControl"
			:map="map"
		/>
	</div>
</template>

<script>
import { MapService } from "./service/map";
import { LayerService } from "./service/layer";
import { showPoints , showLines ,showPolygons} from "./service/operationMap";
import SelectBox from "./SelectBox";
import LayerManage from "./LayerManage";
import { showInfoWindow } from "./service/infoWindow";

export default {
	components: {
		SelectBox,
		LayerManage,
	},
	props:{
		layerList:{
			type:Array,
			default:[]
		},
		showLayerControl:{type:Boolean,default:true},
		showSelectControl:{type:Boolean,default:true}
	},
	data() {
		return {
			map: null,
			layerInfo: null,
		};
	},
	mounted() {
		this.initMap();
	},
	computed: {
		mapLayerList() {
			return this.layerInfo && this.layerInfo.getAllLayer();
		},
	},
	methods: {
		initMap() {
			const mapService = new MapService();
			const dom = this.$refs.map;
			this.map = mapService.initMap(dom, {
				zoom: true,
				mouse: true,
				scale: true,
				switch: true,
				control: true,
			});
			this.layerInfo = new LayerService(this.map);
			this.$emit("map-init",this);
			// this.showPoints([[113.137599, 23.031483]]);
		},
		onslect(evt) {
			this.$emit("select-layer", evt);
		},
		// 展示多组不同样式的点
		showMoerStylePoints(points, layerId){
			if(!layerId){
				throw "请传入图层id,调用createLayer方法获取图层id"
			}
			points.forEach(item=>{
				const {points,style}=item;
				this.showOneStylePoints(points,style,layerId);
			})
		},
		// 展示一组
		showOneStylePoints(points, style, layerId) {
			let layer = null;
			if (layerId) {
				layer = this.layerInfo.getLayerById(layerId);
				if (!layer) {
					throw "传入的图层id不存在";
				}
			} else {
				const layerinfo = this.layerInfo.createLayer();
				layer = layerinfo.layer;
				layerId = layerinfo.id;
			}
			showPoints(layer, points, style);
			return layerId;
		},
		showMoerStyleLines(points, layerId){
			if(!layerId){
				throw "请传入图层id,调用createLayer方法获取图层id"
			}
			points.forEach(item=>{
				const {lines,style}=item;
				this.showOneStyleLines(lines,style,layerId);
			})
		},
		// 展示一组
		showOneStyleLines(lines, style, layerId) {
			let layer = null;
			if (layerId) {
				layer = this.layerInfo.getLayerById(layerId);
				if (!layer) {
					throw "传入的图层id不存在";
				}
			} else {
				const layerinfo = this.layerInfo.createLayer();
				layer = layerinfo.layer;
				layerId = layerinfo.id;
			}
			showLines(layer, lines, style);
			return layerId;
		},
		showMoerStylePolygon(polygons, layerId){
			if(!layerId){
				throw "请传入图层id,调用createLayer方法获取图层id"
			}
			polygons.forEach(item=>{
				const {polygons,style}=item;
				this.showOneStylePolygon(polygons,style,layerId);
			})
		},
		// 展示一组
		showOneStylePolygon(polygons, style, layerId) {
			let layer = null;
			if (layerId) {
				layer = this.layerInfo.getLayerById(layerId);
				if (!layer) {
					throw "传入的图层id不存在";
				}
			} else {
				const layerinfo = this.layerInfo.createLayer();
				layer = layerinfo.layer;
				layerId = layerinfo.id;
			}
			showPolygons(layer, polygons, style);
			return layerId;
		},
		showInfoWindow(id,option){
			showInfoWindow(id,option,this.map);
		},
		createLayer(id,callback){
			const layer=  this.layerInfo.createLayer(id,callback);
			return layer.id;
		},
		removeLayer(id){
			if(id && this.layerInfo.layerList[id]){
				this.layerInfo.destroyLayer(id);
			}
		},
		clearLayer(id){
			if(id && this.layerInfo.layerList[id]){
				this.layerInfo.clearLayer(id);
			}
		},
		setVisible(id,visible){
			if(id && this.layerInfo.layerList[id]){
				this.layerInfo.setVisible(id,visible);
			}
		}
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.map-box {
	width: 100%;
	height: 100%;
	position: relative;
}
.map-container {
	position: absolute;
	top: 70px;
	width: 45px;
	height: 45px;
	right: 30px;
}
.selete-box {
	top: 130px;
}
</style>
