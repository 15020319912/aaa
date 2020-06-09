<template>
	<div class="main-in-wrapper">
		<el-row :gutter="20" style="button: 20px; width: 100%">
			<!--card外部之间间距-->
			<transition-group name="edit">
				<el-col :span="6" v-for="item in list" :key="item.role_id">
					<!--card一行的个数-->
					<el-card shadow="hover"
					         @mouseover.native="hoverId = item.role_id"
					         @mouseout.native="hoverId = 0">
						<span v-text="item.role_name"></span>
						<div class="mask" v-show="item.role_id === hoverId">
							<i class="el-icon-edit" @click="beginUpdate(item)"></i>
							<i class="el-icon-delete" @click="removeHandler(item)"></i>
						</div>
					</el-card>
				</el-col>
			</transition-group>
			<el-col :span="6">
				<el-card @click.native="beginAdd">
					<i class="el-icon-plus" ></i>
				</el-card>
			</el-col>
		</el-row>
		<!--编辑对话框-->
		<el-dialog  :visible="edit.isEdit" :show-close="false" width="600px" :modal="false">
			<h3 slot="title" v-text="`角色管理 - ${ edit.mode ? '新增' : '编辑'}`" class="custom-dialog-title"></h3>
			<el-form label-width="110px" :model="edit.model" :rules="edit.validationRules" ref="editForm" status-icon>
				<el-form-item label="角色名称：" prop="role_name" >
					<el-input v-model.trim="edit.model.role_name" placeholder="-请输入角色名称-"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button size="medium" type="primary" @click="save">确定</el-button>
				<el-button size="medium" @click="edit.isEdit = false">取消</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
	import  { createNamespacedHelpers } from 'vuex';
	var { mapState, mapActions } = createNamespacedHelpers('role');

        export default {
                name: 'Role',
                data: function(){
                        return {
                                hoverId: 0,
                                edit: {
                                        isEdit: false,       // 标识当前是否处于编辑状态
                                        mode: true,       // 标识当前是新增还是修改
                                        model: { role_id: 0, role_name: ''},
                                        validationRules: {
                                                // 这个对象中指明了具体的验证规则
                                                role_name: [
                                                        {
                                                                // func_name的值直接传给了value，无论成功与否都会调用callback
                                                                validator: (rule, value, callback) => {
                                                                        if(value === '')
                                                                                callback(new Error('角色名称不能为空'));
                                                                        else if(value.length < 2 || value.length > 20)
                                                                                callback(new Error('角色名称长度必须为2 - 20'));
                                                                        else if(
                                                                                this.$store.state.role.list.some(item =>
                                                                                        item.role_name === value &&
                                                                                        item.role_id !== this.edit.model.role_id)
                                                                        )
                                                                                callback(new Error('该角色名字已存在，无法使用'));
                                                                        else
                                                                                callback();
                                                                },
                                                                trigger: 'blur'        // trigger表示失去焦点时就触发验证规则
                                                        }
                                                ]
                                        }
                                }
                        }
                },
	        computed: mapState(['list']),
                methods: {
	                ...mapActions(['init', 'remove', 'add', 'update']),
                        removeHandler: function(data){
                                this.$confirm(`确定要删除角色："${ data.role_name }" ? `,  '警告', {
                                        showClose: false,
                                        type: 'warning'
                                }) // 调用func子仓库中的actions节点中的remove方法
	                                .then(() =>this.remove(data.role_id))
	                                        .then(() => this.$message({ message: `角色："${ data.role_name }" 删除成功！`, type: 'success' }))
	                                        .catch(() => {});
                        },
                        beginAdd: function(){
                                this.edit.mode = true;                                    // 当前处于新增状态
                                this.edit.model.role_id = 0;
                                this.edit.model.role_name = '';
                                this.edit.isEdit = true;          // 打开新增弹窗
                        },
                        beginUpdate: function(data){
                                this.edit.mode = false;
                                this.edit.model.role_id = data.role_id;
                                this.edit.model.role_name = data.role_name;
                                this.edit.isEdit = true;        // 打开修改弹窗
                        },
                        save: function(){
                                // 发送ajax之前找到表单调用表单的方法validate在保存的时候去完成验证(代码触发表单验证)
                                // isValid为真表示通过验证，为假则为没通过
                                this.$refs.editForm.validate(isValid => {
                                        if(isValid) {
                                                if(this.edit.mode) {         // 新增
	                                                        this.add(this.edit.model)
                                                                .then(() =>{
                                                                        this.edit.isEdit = false;
                                                                        this.$message({
                                                                                message: `角色: "${ this.edit.model.role_name }" 添加成功!`,
                                                                                type: 'success'
                                                                        })
                                                                });
                                                } else {                            // 修改
	                                                this.update(this.edit.model)
                                                                .then(() =>{
                                                                        this.edit.isEdit = false;
                                                                        this.$message({
                                                                                message: `角色: "${ this.edit.model.role_name }" 修改成功!`,
                                                                                type: 'success'
                                                                        })
                                                                });
                                                }
                                        }
                                });

                        }
                },
                created: function(){
//                        this.$store.dispatch('role/init');
                        this.init();
                },
                watch: {        // 重置表单
                        'edit.isEdit': function(newValue, oldValue){    // 只要是关闭表单，再打开任意一个表单都重置
                                if(!newValue) {
                                        this.$refs.editForm.resetFields();
                                }
                        }
                }
        };
</script>

<style scoped>
	.page-wrapper {
		width: 99%;
	}
	.main-in-wrapper {
		height: 100%;
	}
	/*遮罩层*/
	.mask {
		position: absolute;
		top: 0;
		left:0;
		width: 100%;
		height: 100%;
		background-color: rgba(0,0,0,0.6);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.mask i {
		font-size: 30px;
		color: #fff;
		margin: 0 10px;
		cursor: pointer;
	}
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
	/*动画效果*/
	.edit-enter, .edit-leave-to { opacity: 0; }
	.edit-enter-active, .edit-leave-active { transition: all 1s ease-in 0.5s; }
</style>