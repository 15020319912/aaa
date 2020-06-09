<template>
	<div class="page-wrapper">
		<!-- 角色列表 -->
		<el-row :gutter="20">
			<el-col v-for="item in list" :key="item.role_id" :span="6">
				<el-card class="custom-card">
					<span v-text="item.role_name"></span>
					<el-button type="text" @click="beginConfig(item)">功能分配</el-button>
				</el-card>
			</el-col>
		</el-row>
		<!-- 编辑对话框 -->
		<el-dialog
			:model="false" width="700px"
			:visible="edit.isEdit" :show-close="false">
			<h2 slot="title" class="dialog-title">角色功能分配</h2>
			<!-- 树形控件 -->
			<el-tree
				ref="tree"
				:data="listWithTree"
				:default-checked-keys="defaultCheckedKeys"
				node-key="func_id"
				:default-expand-all="true"
				show-checkbox
				:expand-on-click-node="false"
				:props="{ label: 'func_name', children: 'children' }">
			</el-tree>
			<div slot="footer">
				<el-button @click="reset">重置</el-button>
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
	//
	import { mapState, mapGetters, mapActions } from 'vuex';

        export default {
                name: 'RoleFunc',
	        data() {
                        return {
                                edit: {
                                        isEdit: false,
	                                model: { role_id: 0, roleFunctionList:[] }
                                }
                        }
	        },
	        computed: {
		        ...mapState('role', ['list']),
		        ...mapGetters('func', ['listWithTree']),
                        defaultCheckedKeys() {
                                var keys = [];
	                        this.edit.model.roleFunctionList.forEach(item => {
	                                if(item.func_key !== '') keys.push(item.func_id);
	                        });
	                        return keys;
                        }
	        },
	        methods: {
		        ...mapActions( 'func', { funcInit: 'init' }),
                        ...mapActions( 'role', { roleInit: 'init' }),
                        beginConfig(role) {
                                if(this.$refs.tree) this.$refs.tree.setCheckedKeys([]);    //重置tree

                                this.edit.model.role_id = role.role_id;
                                this.$http({
	                                url: '/role_function/list/' +role.role_id,
	                                method: 'get'
                                }).then(data => {
                                        this.edit.model.roleFunctionList = data;
                                        this.edit.isEdit = true;
                                })
                        },
                        save() {
				var idsStr = [ ...this.$refs.tree.getCheckedKeys(), ...this.$refs.tree.getHalfCheckedKeys()].join();
				this.$http({
					url: 'role_function/config',
					method: 'post',
					data:{
					        role_id: this.edit.model.role_id,
						role_func_ids: idsStr
					}
				}).then(() =>{
				        this.$message({ message: `角色功能分配成功！`, type: 'success' });
				        this.edit.isEdit = false;
				})
                        },
		        reset() {
                                this.$refs.tree.setCheckedKeys(this.defaultCheckedKeys);
		        }
	        },
	        created() {
                        this.funcInit();
                        this.roleInit();
                }
        };
</script>

<style scoped>
	.page-wrapper { position: relative; }
	.el-card {
		margin: 15px 0;
		height: 110px;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #009966;
		color: #fff;
	}
	.el-button { margin-left: 20px }
	.rf { margin-left: 20px }
</style>