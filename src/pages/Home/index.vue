<template>
	<el-container class="page-wrapper">
		<el-header class="home-header">
			<h1>民办清华管理系统 - v1.0</h1>
			<el-button type="text" @click="logout" class="header-logout">退出</el-button>
		</el-header>
		<el-container>
			<el-aside width="250px">
				<el-menu
					:default-active="activeKey"
					@select="menuSelectHandler"
					background-color="#545c64"
					text-color="#fff"
					active-text-color="#ffd04b" >
					<template v-for="item in getFuncList(0)">
						<el-submenu v-if="item.func_key === ''" :index="item.func_id.toString()">
							<template slot="title">
								<i class="el-icon-setting"></i>
								<span v-text="item.func_name"></span>
							</template>
							<el-menu-item v-for="item2 in getFuncList(item.func_id)" :key="item2.func_id" :index="item2.func_key">
								<i class="el-icon-menu"></i>
								<span v-text="item2.func_name"></span>
							</el-menu-item>
						</el-submenu>
						<el-menu-item v-else :index="item.func_key">
							<i class="el-icon-menu"></i>
							<span v-text="item.func_name">  </span>
						</el-menu-item>
					</template>
				</el-menu>
			</el-aside>
			<el-main>
				<el-tabs type="card" closable v-model="activeKey" @tab-remove="tabRemoveHandler">
					<el-tab-pane v-for="item in tabs" :key="item" :label="getFuncNameByKey(item)" :name="item">
						<component :is="Views[item].component"> </component>
					</el-tab-pane>
				</el-tabs>
			</el-main>
		</el-container>
		<el-footer height="40px">
			<p>&copy;版权所有 违者必究</p>
		</el-footer>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import Views from '../../views';

        export default {
                name: 'Home',
	        data: function(){
		        return {
		                Views,
		                tabs: [],
                                activeKey: '',          //记录当前tabs选项卡中处于激活状态的name值,左右联动的关键数据
		               //Home组件判断-》角色-》对应的功能-》菜单
			        userFuncList: []
		        }
                },
	        computed: {
	                getFuncList: function(){
		                return func_fid => this.userFuncList.filter(item => item.func_fid === func_fid);
                        },
                        getFuncNameByKey() {
	                        return func_key => this.userFuncList.find(item => item.func_key === func_key).func_name;
		        }
	        },
	        methods: {
	                logout() {
	                        sessionStorage.clear();
	                        this.$message({ message: `退出登录成功！` , type: '' });
	                        this.$router.replace('/login');
	                },
                        menuSelectHandler: function(index){
                                this.activeKey = index;
	                        if(this.tabs.indexOf(index) === -1) this.tabs.push(index);              //先判断右侧是否有这个选项卡，有不加，没有加
                        },
		        tabRemoveHandler: function(name){               //
			        var i = this.tabs.indexOf(name);
			        this.tabs.splice(i, 1);
			        if(this.activeKey=== name) this.activeKey = this.tabs[this.tabs.length -1] || '';
                        }
	        },
	        created: function(){
                        // 通知字典表仓库准备系统基础字典相关数据
                        this.$store.dispatch('dictionary/init');
                        this.needGetMenu = true;                //标识是否需要重新获取
	        },
	        async activated() {
	                //如果是相同用户登录，直接返回，什么也不干
			if((this.needGetMenu) && sessionStorage.getItem('prev_user') === sessionStorage.getItem('user')) return;
		         // 能通过上面的if判断，到下面说明一定是一个新的用户
		         // 重置数据
			this.activeKey = '';
			this.tabs = [];
			this.userFuncList = [];

		        // 再次为登录的新用户发送请求

                         // 发ajax到服务器拿取：当前登录的用户的角色对应的功能组件
                        let data = await this.$http({ url:'user/getmenu', method: 'post' });
		        this.userFuncList = data;
			this.needGetMenu = false;
	        },
	        deactivated() {

	        }
        };
</script>

<style scoped>
	.page-wrapper { height: 100%; }
	.el-header { background-color: #303133; }
	.el-header>h1 {
		margin-left: 16px;
		height: 60px;
		line-height: 60px;
		color: #fff;
	}

	.el-aside { background-color: #545c64; }
	.el-menu { border-right: none; }
	.el-footer { background-color: #C0C4CC; }
	.el-footer>p {
		font-size: 12px;
		height: 30px;
		line-height: 30px;
		text-align: center;
	}

	.el-tabs {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.el-tabs >>> .el-tabs__header { flex-shrink: 0; }
	.el-tabs >>> .el-tabs__content { flex-grow: 1; overflow: auto; }
	.el-tab-pane { height: 100%; }

	.home-header {
		display: flex;
		justify-content: space-between;
	}
</style>