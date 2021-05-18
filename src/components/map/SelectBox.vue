<template>
	<el-dropdown @command="handleCommand">
		<div class="map-dispatch">
			<img src="@/assets/images/map-dispatch.png" alt="地图框选" />
		</div>
		<el-dropdown-menu slot="dropdown">
			<el-dropdown-item
				v-for="item in subList"
				:command="item.type"
				:key="item.type"
				>{{ item.name }}</el-dropdown-item
			>
		</el-dropdown-menu>
	</el-dropdown>
</template>
<script>
import * as SMap from "@/assets/plugin/map.js";
const {DrawAndSelect } = SMap;
export default {
	data() {
		return {
      _darw:null,
			subList: [
				{ name: "矩形", type: 'Rect' },
				{ name: "圆形", type: "Circle" },
				{ name: "多边形", type: "Polygon" },
			],
		};
  },
  props:["map",'layerList'],
	mounted() {
  },
	methods: {
    handleCommand(val){
      const type = val === 'Rect'?'Circle':val;
      const rectangle = val==='Rect'
      const options = {
            type,
            rectangle,
            vectorLayer:this.layerList,
            statusChange: (event) =>{
							event.data = event.data.filter(item=>{
								return !(item.data && item.data.__point_lable__ );
							})
							this.$emit("select-layer",event);
              this.map.removeInteraction(this._darw);
            }
        };
        // 添加DrawAndSelect控件
        this._darw = new DrawAndSelect(options)
        this.map.addInteraction(this._darw);
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style  scoped>
.map-dispatch {
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

.map-dispatch:hover {
	background-color: rgba(60, 187, 250, 0.8);
}
</style>
