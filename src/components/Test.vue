<template>
	<div class="main">
		{{ value }}
    <button @click="testBtn">btn</button>
	</div>
</template>

<script>
export default {
	data() {
		return { };
  },
  props:['value'],
  mounted() {
    console.log('value')

  },
  methods: {
    testBtn(){
      console.log(123123)
    }
  },
  destroyed() {
    console.log(this);
  },
};
</script>
<style  scoped>
.main{
  width:1000px;
  height: 500px;;
}
</style>