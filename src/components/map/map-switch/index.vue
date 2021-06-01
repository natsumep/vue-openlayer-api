<template>
	<div class="map-switch" @mouseleave="mouseLeaveEvt()">
		<div
			v-for="(baseLayer, index) in baseLayers"
			:key="index"
			class="switch-map-btn"
			:title="baseLayer.title"
			:class="visible && index == activeLayerIndex ? 'active' : ''"
			@click="layerSelectEvt(index)"
		>
			<div
				v-if="baseLayer.labelLayer"
				class="show-text"
				:title="baseLayer.labelLayer.active ? '隐藏标注' : '显示标注'"
				:class="baseLayer.labelLayer.active ? 'active' : ''"
				@click="labelLayerSelectEvt(index)"
			></div>
			<div
				class="show-check show-text"
				:class="visible && index == activeLayerIndex ? 'active' : ''"
				@click.stop="labelLayerVisibleEvt(!visible, index == activeLayerIndex,index)"
			></div>
			<img :src="getImg(baseLayer.layerType)" />
			<span class="showMapName">{{ baseLayer.name }} </span>
		</div>
	</div>
</template>

<script>
import { MapSwitchService } from "./service";
export default {
	data() {
		return {
			visible: true,
			baseLayers: [],
			activeLayerIndex: 0,
		};
	},

	props: {
		map: Object,
		mapSet:Object,
	},
	created() {
		this.service = new MapSwitchService(this.map,this.mapSet);
		this.baseLayers = this.service.baseLayers;
		this.activeLayerIndex = this.baseLayers.length - 1;
  },
  mounted() {
    // console.log(this.$parent);
    
  },
	// watch:{
	// visible(val){
	// console.log(val);
	// if(isVisible){
	//    const oldBaseLayer = this.baseLayers[this.activeLayerIndex];
	//   this.service.setBaseLayerVisible(oldBaseLayer,isVisible);
	//   const labelLayer = oldBaseLayer.labelLayer;
	//   if(labelLayer && labelLayer.active){
	//     labelLayer && this.service.setBaseLayerVisible(labelLayer, isVisible);
	//   }
	// }
	// }
	// },
	methods: {
		labelLayerVisibleEvt(isVisible, isActive,index) {
			if (isActive) {
				this.visible = isVisible;
					const oldBaseLayer = this.baseLayers[this.activeLayerIndex];
					this.service.setBaseLayerVisible(oldBaseLayer, isVisible);
					const labelLayer = oldBaseLayer.labelLayer;
					if (labelLayer && labelLayer.active) {
						labelLayer &&
							this.service.setBaseLayerVisible(labelLayer, isVisible);
					}
			}else{
        this.layerSelectEvt(index)
      }
		},
		/**
		 * 显示此底图
		 * * 非 active 状态时，切换为 active；
		 * * active 状态时，如果来自 标签 点击事件，则更改对应标签的显示状态
		 * @param {number} index
		 * @param {boolean} [fromClick=true]
		 * @memberof MapSwitchComponent
		 */
		layerSelectEvt(index, fromClick = true) {
			this.visible = true;
			const baseLayer = this.baseLayers[index];
			if (!baseLayer.active) {
				// 切换底图 ：切换active状态、图层显示状态
				const oldBaseLayer = this.baseLayers[this.activeLayerIndex];
				oldBaseLayer.active = false;
				this.previousLayerIndex = this.activeLayerIndex;
				baseLayer.active = true;
				this.activeLayerIndex = index;
				if (oldBaseLayer && baseLayer) {
					this.service.changeBaseLayerType(oldBaseLayer, baseLayer);
				}
			} else if (!fromClick) {
				const labelLayer = baseLayer.labelLayer;
				this.service.setBaseLayerVisible(labelLayer, labelLayer.active);
			}
		},
		/**
		 * 将正在显示的底图对应的div 挪到最后：样式效果
		 *
		 * @memberof MapSwitchComponent
		 */
		moveElementActive() {
			const activeEl = this.$el.querySelector(".switch-map-btn.active");
			!!activeEl && this.$el.appendChild(activeEl);
		},
		/**
		 * 图层标签点击事件
		 * 1. 切换标签的active状态
		 * 2. 切换对应图层为显示的底图
		 *
		 * @param {*} $event
		 * @param {number} index
		 * @memberof MapSwitchComponent
		 */
		labelLayerSelectEvt(index) {
			const baseLayer = this.baseLayers[index];
			const labelLayer = baseLayer.labelLayer;
			labelLayer.active = !labelLayer.active;
			this.service.defaultMapChanged(baseLayer, true);
			this.layerSelectEvt(index, false);
		},
		mouseLeaveEvt() {
			// const oldBaseLayer = this.baseLayers[this.previousLayerIndex];
			// const baseLayer = this.baseLayers[this.activeLayerIndex];
			// this.service.changeBaseLayerType(oldBaseLayer, baseLayer);
			setTimeout(() => {
				this.moveElementActive();
			}, 300);
		},
		getImg(imgName) {
			return require(`./images/${imgName}.png`);
		},
	},
};
</script>

<style scoped>
.map-switch {
	display: inline-block;
	transition: all 0.5s;
	height: 45px;
	position: absolute;
	right: 0;
}

.map-switch:hover input {
	visibility: visible;
}

.map-switch:hover .switch-map-btn {
	margin-left: 8px;
	opacity: 1;
}

.switch-map-btn {
	cursor: pointer;
	padding: 0;
	border-radius: 2px;
	width: 45px;
	margin-left: -38px;
	height: 45px;
	position: relative;
	top: 0;
	color: #fff;
	text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.2);
	display: inline-block;
	margin-bottom: 0;
	opacity: 0.4;
	transition: all 0.8s;
	background-color: rgba(60, 167, 250, 0.6);
	border: 1px solid #3cbbfa;
}

.switch-map-btn img {
	height: 100%;
	width: 100%;
}

.switch-map-btn:last-child {
	opacity: 1;
}

.showMapName {
	position: absolute;
	bottom: -2px;
	left: -6px;
	font-size: 12px;
	transform: scale(0.8);
	text-shadow: 0 0 4px #000;
	font-weight: 400;
	line-height: 1.53846154;
	text-align: center;
	white-space: nowrap;
	user-select: none;
	width: 56px;
}

.switch-map-btn.active .showMapName {
	background: #3cbbfa;
	text-shadow: none;
}

.map-active::before {
	content: "";
	display: block;
	position: absolute;
	left: 0;
	bottom: 0;
	height: 16px;
	width: 100%;
	background: #3cbbfa;
}

.show-text {
	height: 15px;
	width: 15px;
	position: absolute;
	background: #fff;
	top: -1px;
	right: -1px;
	border: 1px solid #3cbbfa;
	border-radius: 0 1px 0 1px;
}

.show-text.active {
	background: #3280fc;
}

.show-text::after,
.show-text::before {
	content: "";
	display: block;
	position: absolute;
	background: #b5bcc7;
}

.show-text::after {
	height: 2px;
	width: 8px;
	top: 3px;
	left: 3px;
}

.show-text::before {
	height: 8px;
	width: 2px;
	top: 4px;
	left: 6px;
	/* transform: translateX(-50%); */
}

.show-text.active::after,
.show-text.active::before {
	background: #fff;
}
.show-check.show-text {
	left: -1px;
}
.show-check.show-text::after {
	height: 2px;
	width: 6px;
	top: 8px;
	left: 1px;
	transform: rotate(45deg);
}
.show-check.show-text::before {
	height: 11px;
	width: 2px;
	top: 2px;
	left: 9px;
	/* transform: translateX(-50%); */
	transform: rotate(45deg);
}
</style>
