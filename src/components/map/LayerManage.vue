<template>
	<div class="layer-manager-container">
		<div
			class="layer-manager-btn layer-manager"
			title="图层管理"
			@click="onClickMe(true)"
		>
			<img src="@/assets/images/map-layer.png" />
		</div>
		<el-card class="box-card main-layerManager" v-if="managerVisible">
			<div slot="header" class="clearfix layermanager-title">
				<span>图层管理</span>
				<span class="el-icon-close" @click="onClickMe(false)"></span>
			</div>
			<div class="layermanager-content">
				<div class="LayerManagerLayers" v-if="panelArray.length > 0">
					<div v-for="(arrayItem, itemIndex) of panelArray" :key="itemIndex">
						<div class="title" @click="layersShowOrHide(itemIndex)">
							<i
								class="layer-manager-group-dir"
								:class="
									arrayItem.visible ? 'el-icon-arrow-up' : 'el-icon-arrow-down'
								"
							></i>
							<span class="title-name">{{ arrayItem.name }}</span>
						</div>
						<ul v-if="arrayItem.visible" class="layer-group">
							<li v-for="(item, i) of arrayItem.array" style="display:flex;" class="" :key="i">
								<div class="layer-item" style="width: 100%">
									<el-checkbox
										v-model="item.visible"
										@change="layerNodeSelectedEvt(itemIndex, item)"
										>{{ item.label }}</el-checkbox
									>
								</div>
								<div
									class="div-layer-operations"
									:style="(display = item.visible ? 'flex' : 'none')"
								>
									<i
										nzRotate="90"
										v-if="item.front"
										@click="_changeLayerPosition('prev', itemIndex, i)"
										title="图层上移"
										class="el-icon-arrow-up"
									></i>
									<i
										nzRotate="90"
										class="el-icon-arrow-down"
										title="图层下移"
										v-if="item.next"
										@click="_changeLayerPosition('down', itemIndex, i)"
									></i>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</el-card>
	</div>
</template>

<script lang="ts">
import { LayerFactory } from "./service/createLayer";

export default {
	// managerVisible = false;
	// panelArray: Array<{
	//   name: string;
	//   array: Array<LayerParams>;
	//   visible: boolean;
	// }> = [];
	// layerManagerService: LayerManagerService;
	// mapService: MapService;
	// topicService: TopicService;
	// popupId = "layer-manager";
	// moduleId = "layerManager";
	// webConfig: any = {}; // 配置参数
	props: ["layerList", "map"],
	data() {
		return {
			managerVisible: false,
			panelArray: [],
		};
	},

	created() {
		this._initWidget();
	},
	destroyed() {},
	mounted() {},
	methods: {
		onClickMe(close) {
			if (typeof close === undefined) {
				this.managerVisible = !this.managerVisible;
			} else {
				this.managerVisible = close;
			}
		},
		// 当登录人员的图层信息，加载对应图层。
		_initWidget() {
			let unitLayers = this.layerList;
			this._loadPanelLayer(unitLayers);
		},
		_loadPanelLayer(layerConfig) {
			const layerInstance = new LayerFactory();
			layerConfig.map((layerinfo) => {
				const { name, visible = true, layers } = layerinfo;
				const item = {
					name,
					array: layerInstance.getLayerArrayFromData(layers),
					visible,
				};
				this.panelArray.push(item);
				this._addLayerArrayToMap(item.array);
			});
		},
		// 将图层添加进地图
		_addLayerArrayToMap(array) {
			for (let i = array.length - 1; i >= 0; i--) {
				const layer = array[i].layerInstance;
				array[i].front = this._getFrontVisible(array, i);
				array[i].next = this._getNextVisible(array, i);
				this.map.removeLayer(layer);
				this.map.addLayer(layer);
			}
		},
		// 图层模块显示隐藏
		layersShowOrHide(itemIndex) {
			this.panelArray[itemIndex].visible = !this.panelArray[itemIndex].visible;
		},
		// 选择或取消图层选择，选择后显示设置按钮组
		layerNodeSelectedEvt(itemIndex, item) {
			const layers = this.panelArray[itemIndex].array;
			item.layerInstance.setVisible(item.visible);
			for (let i = 0, ilen = layers.length; i < ilen; i++) {
				layers[i].front = this._getFrontVisible(layers, i);
				layers[i].next = this._getNextVisible(layers, i);
			}
		},

		// 上移图层按钮显示隐藏
		_getFrontVisible(layers, index) {
			for (let i = 0, ilen = index; i < ilen; i++) {
				if (layers[i].visible) {
					return true;
				}
			}
			return false;
		},
		// 下移图层按钮显示隐藏
		_getNextVisible(layers, index) {
			for (let i = index + 1, ilen = layers.length; i < ilen; i++) {
				if (layers[i].visible) {
					return true;
				}
			}
			return false;
		},
		// 上下移按钮点击事件
		_changeLayerPosition(type, itemIndex, index) {
			const layers = this.panelArray[itemIndex].array;
			const layer = layers.splice(index, 1);
			if (type === "prev") {
				layers.splice(index - 1, 0, layer[0]);
			} else {
				layers.splice(index + 1, 0, layer[0]);
			}
			this._addLayerArrayToMap(layers);
		},

		// 将图层移除
		_removeSubSystemLayer() {
			const panelArray = this.panelArray.splice(1, this.panelArray.length);
			for (let i = 0, ilen = panelArray.length; i < ilen; i++) {
				const array = panelArray[i].array;
				for (let j = array.length - 1; j >= 0; j--) {
					const layer = array[j].layerInstance;
					// @ts-ignore
					this.map.removeLayer(layer);
				}
			}
		},
	},
};
</script>

<style  scoped>
.layer-manager-container >>> .el-card__header {
	padding: 0;
}

.layer-manager-container >>> .el-card__body {
	padding: 0;
}

.layer-manager-container >>> .el-checkbox {
	font-weight: 400;
}
.layer-manager-container >>> ul li {
	text-align: left;
}
.layer-manager {
	width: 100%;
	height: 100%;
	max-height: 45px;
	max-width: 45px;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: rgba(60, 187, 250, 0.6);
	border: 1px solid #3cbbfa;
	cursor: pointer;
	box-sizing: border-box;
}

.layer-manager:hover {
	background-color: rgba(60, 187, 250, 0.8);
}

.main-layerManager {
	z-index: 101;
	width: 320px;
	top: 0;
	right: 60px;
	background-color: #f0f3f5;
	box-shadow: 1px 1px 50px rgba(0, 0, 0, 0.3);
	position: absolute;
	transition: all 0.5s;
}

.layermanager-title {
	padding-left: 14px;
	padding: 10px;
	height: 32px;
	line-height: 32px;
	border-bottom: 1px solid #eee;
	font-size: 14px;
	color: #333;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	background-color: #ddd;
	border-radius: 2px 2px 0 0;
	position: relative;
}

.el-icon-close {
	position: absolute;
	right: 15px;
	top: 50%;
	transform: translateY(-50%);
	cursor: pointer;
	font-size: 18px;
}

.el-icon-close:hover {
	font-size: 22px;
	font-weight: bold;
}

.layermanager-content {
	font-size: 12px;
	color: #727272;
	overflow: auto;
	margin: 10px 0 10px 15px;
	padding-right: 15px;
	min-height: 180px;
	max-height: 300px;
}

.layermanager-content .title {
	padding: 0;
	line-height: 28px;
	cursor: pointer;
	text-align: left;
	border: none;
	background-color: #fff;
	position: relative;
	border-radius: 4px;
	margin-bottom: 10px;
	font-size: 15px;
}

.layermanager-content .title:hover {
}

.layermanager-content .title-name {
	margin-left: 5px;
}

.layermanager-content .title i {
	font-size: 16px;
	margin-left: 20px;
	line-height: 35px;
	margin-right: 3px;
	font-weight: bold;
}

.layer-group {
	padding-left: 15px;
	list-style-type: none;
}

.layer-group ul {
	padding-top: 5px;
	list-style-type: none;
}

.layer-group li {
	margin: 8px 5px;
}

.div-layer-operations {
	width: 50%;
	display: flex;
	align-items: center;
}

.div-layer-operations i {
	cursor: pointer;
	width: 25%;
}

.main-layerManager input[type="checkbox"] {
	width: 15px;
	height: 15px;
	cursor: pointer;
	margin-right: 3px;
}

.main-layerManager .LayerManagerLayers {
	overflow-x: hidden;
}

/* 图层弹窗样式 */

.infowindowLayerManager {
	padding: 5px 5px 15px 10px;
	line-height: 2;
	width: 380px;
	max-height: 390px;
}

.infowindowLayerManager hr {
	border-top: 1px dashed #e5e5e5;
	height: 2px;
	margin-top: 8px;
	margin-bottom: 8px;
}

.infowindowLayerManager .titleContent {
	color: #556b8e;
	display: flex;
	align-items: center;
	margin-bottom: 5px;
}

.infowindowLayerManager .titleContent .titleFlag {
	width: 3px;
	height: 15px;
	margin-right: 5px;
	background-color: #556b8e;
}

.infowindowLayerManager .titleContent label {
	font-size: 13px;
	font-weight: 500;
}

.infowindowLayerManager .videoShow {
	width: 100%;
	height: 235px;
	margin-bottom: 5px;
	position: relative;
}

.infowindowLayerManager .bodyCotent {
	display: flow-root;
	margin-left: 10px;
	margin-bottom: 10px;
}

.infowindowLayerManager .bodyCotent .item {
	font-size: 13px;
	display: flex;
}

.infowindowLayerManager .bodyCotent .item .infowindowLabel {
	color: #6b7380;
	font-weight: 400;
}

.infowindowLayerManager .bodyCotent .item .infowindowContent {
	width: 74%;
	margin-right: 6px;
	margin-left: 6px;
	color: #1c1f25;
}

.infowindowLayerManager .bodyCotent .item .subGroups {
	display: flex;
	flex-wrap: wrap;
}

.infowindowItem {
	margin-right: 5px;
	display: inline-flex;
	padding-right: 10px;
	text-align: center;
	overflow-x: hidden;
}

.infowindowContent a {
	color: #3883f8;
	text-decoration: blink;
}

.infowindowContent a:hover {
	color: #063784;
	cursor: pointer;
}

.layer-video-message {
	color: #fff;
	text-align: center;
	padding: 0 30px 50px 30px;
	position: absolute;
	z-index: 1000;
	bottom: 0;
	width: 100%;
}

.item-opacity .ant-slider {
	margin: 10px 6px 10px;
}
</style>
<style>
/*********弹窗************/
.ol-customOverlay {
	position: absolute;
	color: #333;
	background-color: white;
	-webkit-filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
	filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
	border-radius: 6px;
	border: 1px solid #cccccc;
	bottom: 12px;
	left: -50px;
	min-width: 280px;
	/* transform: translate(0, -105%); */
	height: fit-content;
}

.ol-customOverlay.dark {
	background-color: #121317cf;
	border: 1px solid #121317cf;
	color: #fff;
}

.ol-customOverlay-hidden {
	z-index: 103;
	width: 180px;
	height: 42px;
	overflow: hidden;
}

.ol-customOverlay .ol-customOverlay-titlePane {
	display: flex;
	padding: 6px 10px 0px;
	line-height: 20px;
}

.ol-customOverlay .ol-customOverlay-titlePane .title {
	height: 20px;
	width: 70%;
	text-align: left;
	min-width: 140px;
	/* color: #5d5f61; */
	font-size: 14px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}

.ol-customOverlay .ol-customOverlay-titlePane .titleControl {
	height: 20px;
	width: fit-content;
	display: flex;
	position: absolute;
	right: 10px;
}

.ol-customOverlay .ol-customOverlay-titlePane .titleControl .titleButton {
	width: 16px;
	height: 16px;
	text-align: center;
	background-repeat: no-repeat;
	background-size: 20px;
	margin-left: 5px;
	cursor: pointer;
	font-weight: 500;
	font-size: 20px;
	line-height: 16px;
}

.ol-customOverlay
	.ol-customOverlay-titlePane
	.titleControl
	.titleButton.hidden {
	display: none;
}

.ol-customOverlay .ol-customOverlay-titlePane .titleControl .titleButton path {
	fill: #cccccc;
}

.ol-customOverlay
	.ol-customOverlay-titlePane
	.titleControl
	.titleButton.checked
	path {
	fill: rgb(56, 131, 248);
}

.ol-customOverlay
	.ol-customOverlay-titlePane
	.titleControl
	.titleButton
	path:hover {
	fill: #000;
}

.ol-customOverlay.dark
	.ol-customOverlay-titlePane
	.titleControl
	.titleButton
	path {
	fill: #fff;
}

.ol-customOverlay.dark
	.ol-customOverlay-titlePane
	.titleControl
	.titleButton.checked
	path {
	fill: rgb(48, 122, 239);
}

.ol-customOverlay.dark
	.ol-customOverlay-titlePane
	.titleControl
	.titleButton
	path:hover {
	fill: #cccccc;
}

.ol-customOverlay-container {
	padding: 6px 10px 6px;
	overflow: auto;
	max-height: 500px;
}

.ol-customOverlay .ol-customOverlay-arrow:after,
.ol-customOverlay .ol-customOverlay-arrow:before {
	top: 100%;
	border: solid transparent;
	content: " ";
	height: 0;
	width: 0;
	position: absolute;
	pointer-events: none;
	border-top-color: white;
	border-width: 10px;
	left: 50%;
	margin-left: -10px;
}

.ol-customOverlay .ol-customOverlay-arrow.right:after,
.ol-customOverlay .ol-customOverlay-arrow.right:before {
	margin-left: 0px;
}

.ol-customOverlay.dark .ol-customOverlay-arrow:after,
.ol-customOverlay.dark .ol-customOverlay-arrow:before {
	border-top-color: #121317cf;
}

.ol-customOverlay .ol-customOverlay-arrow.top:after,
.ol-customOverlay .ol-customOverlay-arrow.top:before {
	top: -20px;
	left: 50%;
	transform: rotate(180deg);
}

.ol-customOverlay .ol-customOverlay-arrow.bottom:after,
.ol-customOverlay .ol-customOverlay-arrow.bottom:before {
	top: 100%;
	left: 50%;
}

.ol-customOverlay .ol-customOverlay-arrow.left:after,
.ol-customOverlay .ol-customOverlay-arrow.left:before {
	top: 45%;
	left: -10px;
	transform: rotate(90deg);
}

.ol-customOverlay .ol-customOverlay-arrow.right:after,
.ol-customOverlay .ol-customOverlay-arrow.right:before {
	top: 45%;
	left: 100%;
	transform: rotate(-90deg);
}

.ol-customOverlay .ol-customOverlay-arrow:after {
	border-width: 10px;
	margin-left: -10px;
}

.ol-customOverlay .ol-customOverlay-arrow:before {
	border-width: 11px;
	margin-left: -11px;
}

.infowindowLayerManager {
	padding: 5px 5px 15px 10px;
	line-height: 2;
	width: 380px;
	max-height: 390px;
}

.infowindowLayerManager hr {
	border-top: 1px dashed #e5e5e5;
	height: 2px;
	margin-top: 8px;
	margin-bottom: 8px;
}

.infowindowLayerManager .titleContent {
	color: #556b8e;
	display: flex;
	align-items: center;
	margin-bottom: 5px;
}

.infowindowLayerManager .titleContent .titleFlag {
	width: 3px;
	height: 15px;
	margin-right: 5px;
	background-color: #556b8e;
}

.infowindowLayerManager .titleContent label {
	font-size: 13px;
	font-weight: 500;
}

.infowindowLayerManager .videoShow {
	width: 100%;
	height: 235px;
	margin-bottom: 5px;
	position: relative;
}

.infowindowLayerManager .bodyCotent {
	display: flow-root;
	margin-left: 10px;
	margin-bottom: 10px;
}

.infowindowLayerManager .bodyCotent .item {
	font-size: 13px;
	display: flex;
}

.infowindowLayerManager .bodyCotent .item .infowindowLabel {
	color: #6b7380;
	font-weight: 400;
}

.infowindowLayerManager .bodyCotent .item .infowindowContent {
	width: 74%;
	margin-right: 6px;
	margin-left: 6px;
	color: #1c1f25;
}

.infowindowLayerManager .bodyCotent .item .subGroups {
	display: flex;
	flex-wrap: wrap;
}

.infowindowItem {
	margin-right: 5px;
	display: inline-flex;
	padding-right: 10px;
	text-align: center;
	overflow-x: hidden;
}

.infowindowContent a {
	color: #3883f8;
	text-decoration: blink;
}

.infowindowContent a:hover {
	color: #063784;
	cursor: pointer;
}

.layer-video-message {
	color: #fff;
	text-align: center;
	padding: 0 30px 50px 30px;
	position: absolute;
	z-index: 1000;
	bottom: 0;
	width: 100%;
}

.item-opacity .ant-slider {
	margin: 10px 6px 10px;
}
</style>
