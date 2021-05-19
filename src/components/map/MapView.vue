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
import {
	showPoints,
	showLines,
	showPolygons,
	showClusterPoints,
	showHeatMapPoints,
	getSelectByPoint,
	getSelectByPolygon,
	showMultiPolygons,
	showMarker,
	removeMarker,
	showCircle,
	showPathPlay
} from "./service/operationMap";
import { showDarw } from './service/darw'
import SelectBox from "./SelectBox";
import LayerManage from "./LayerManage";
import { showInfoWindow } from "./service/infoWindow";
import * as SMap from "@/assets/plugin/map.js";
const {
	Heatmap,
	DrawAndSelect
} = SMap;
export default {
	components: {
		SelectBox,
		LayerManage,
	},
	props: {
		layerList: {
			type: Array,
			default: [],
		},
		showLayerControl: { type: Boolean, default: true },
		showSelectControl: { type: Boolean, default: true },
	},
	data() {
		return {
			map: null,
			layerInfo: null,
			_darw:null,
		};
	},
	mounted() {
		this.initMap();
	},
	computed: {
		mapLayerList() {
			const list = this.layerInfo && this.layerInfo.getAllLayer();
			return list.filter(item=>{
				return !(item instanceof Heatmap)
			})
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

			this.map.on("click", (evt) => {
				let selectLayer = [];
				this.map.forEachLayerAtPixel(
					evt.pixel,
					(layer) => {
						if (layer) {
							console.log(1);
							selectLayer.push(layer);
						}
					},
					{
						layerFilter: (layer) => {
							return !(layer instanceof Heatmap);
						}
					}
				);
				const featureLayer = [];
				if (!selectLayer.length) return;
				selectLayer.forEach((layer) => {
					this.map.forEachFeatureAtPixel(
						evt.pixel,
						function (feature, layer) {
							if (feature) {
								featureLayer.push({ layer, feature });
							}
						},
						{
							layerFilter: function (lay) {
								return lay === layer;
							},
						}
					);
				});
				for (let i = 0; i < featureLayer.length; i++) {
					if (featureLayer[i].layer.eventOnClick) {
						// const data = featureLayer[i].feature.values_.features?[featureLayer[i].feature.values_]|featureLayer[i].feature.values_.features
						const v = featureLayer[i].layer.eventOnClick({
							data: { data: featureLayer[i].feature.values_ },
							originalEvent: evt.originalEvent,
							feature: featureLayer[i].feature,
						});
						if (v === false) return;
					}
				}
			});
			this.layerInfo = new LayerService(this.map);
			this.$emit("map-init", this);
			// this.showPoints([[113.137599, 23.031483]]);
		},
		onslect(evt) {
			this.$emit("select-layer", evt);
		},
		// 展示多组不同样式的点
		showMoerStylePoints(points, layer) {
			if (!layer) {
				throw "请传入图层,调用createLayer方法获取图层";
			}
			points.forEach((item) => {
				const { points, style } = item;
				this.showOneStylePoints(points, style, layer);
			});
		},
		showClusterPoints(points, layer) {
			showClusterPoints(layer, points);
		},
		// 展示一组
		showOneStylePoints(points, style, layer) {
			if (!layer)  {
				const layerinfo = this.layerInfo.createLayer();
				layer = layerinfo.layer;
			}
			showPoints(layer, points, style);
			return layer;
		},
		showMoerStyleLines(points, layer) {
			if (!layer) {
				throw "请传入图层,调用createLayer方法获取图层";
			}
			points.forEach((item) => {
				const { lines, style } = item;
				this.showOneStyleLines(lines, style, layer);
			});
		},
		// 展示一组
		showOneStyleLines(lines, style, layer) {
			if (!layer) {
				const layerinfo = this.layerInfo.createLayer();
				layer = layerinfo.layer;
			}
			showLines(layer, lines, style);
			return layer;
		},
		showMoerStylePolygon(polygons, layer) {
			if (!layer) {
				throw "请传入图层,调用createLayer方法获取图层";
			}
			polygons.forEach((item) => {
				const { polygons, style } = item;
				this.showOneStylePolygon(polygons, style, layer);
			});
		},
		// 展示一组
		showOneStylePolygon(polygons, style, layer) {
			if (!layer) {
				const layerinfo = this.layerInfo.createLayer();
				layer = layerinfo.layer;
			}
			showPolygons(layer, polygons, style);
			return layer;
		},
		showMoerStyleMultiPolygon(polygons, layer) {
			if (!layer) {
				throw "请传入图层,调用createLayer方法获取图层";
			}
			polygons.forEach((item) => {
				const { polygons, style } = item;
				this.showOneStyleMultiPolygon(polygons, style, layer);
			});
		},
		// 展示一组
		showOneStyleMultiPolygon(polygons, style, layer) {
			if (!layer) {
				const layerinfo = this.layerInfo.createLayer();
				layer = layerinfo.layer;
			}
			showMultiPolygons(layer, polygons, style);
			return layer;
		},
		showCircle(option, style, layer){
			if (!layer) {
				const layerinfo = this.layerInfo.createLayer();
				layer = layerinfo.layer;
			}
			showCircle(layer, option, style,this.map);
			return layer;
		},
		showInfoWindow(id, option) {
			showInfoWindow(id, option, this.map);
		},
		createLayer(id, callback,options) {
			const layer = this.layerInfo.createLayer(id, callback,options);
			return layer.layer;
		},
		createClusterLayer(id, option, callback) {
			const layer = this.layerInfo.createClusterLayer(id, option, callback);
			return layer.layer;
		},
		createHeatMapLayer(id,option){
			const layer = this.layerInfo.createHeatmap(id, option);
			return layer.layer;
		},
		showHeatMapPoints(layer,points){
			showHeatMapPoints(layer, points);
		},
		removeLayer(layer) {
				this.layerInfo.destroyLayer(layer);
		},
		clearLayer(layer) {
			layer && this.layerInfo.clearLayer(layer);
		},
		setVisible(layer, visible) {
				this.layerInfo.setVisible(layer, visible);
		},
		getSelectByPoint(point,width){
			return getSelectByPoint(this.mapLayerList,point,width);
		},
		getSelectByPolygon(data){
			return getSelectByPolygon(this.mapLayerList,data);
		},
		showMarker(point,option,textOption){
			return showMarker(this.map,point,option,textOption)
		},
		removeMarker(marker){
			removeMarker(this.map,marker)
		},
		 addSelectBox(val,callback){
			 showDarw.createDarw(this.map,this.mapLayerList,val,callback)
		},
		
		showPathPlay(lines,option){
			return showPathPlay(this.map,lines,option)
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
