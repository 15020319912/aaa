<template>
	<keep-alive include="Home">
		<router-view></router-view>
	</keep-alive>
</template>

<script type="text/ecmascript-6">
	export default {
		name: 'App',
		created() {

		}
        }
</script>

<style>
	#app {
		font-family: Avenir, Helvetica, Arial, sans-serif;
	}

</style>
