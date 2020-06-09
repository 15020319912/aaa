<template>
	<div class="custom-tree-container">
		<!-- 树形控件 -->
		<el-tree
			class="custom-tree"
			:data="treeData"
			:default-expand-all="true"
			:expand-on-click-node="false"
			:props="{ label: 'func_name', children: 'children' }">
			<div slot-scope="{ data }" class="tree-right">
				<span v-text="data.func_name"></span>
				<span class="right">
					<i
						class="el-icon-plus"
						v-if="data.func_key === ''"
						@click="beginAdd(data)"></i>
					<i
						class="el-icon-edit"
						v-if="data.func_id !== 0 && data.func_id !== 44 && data.func_id !== 45"
						@click="beginUpdate(data)"></i>
					<i
						class="el-icon-delete"
						v-if="data.func_id !== 0 && data.func_id !== 44 && data.func_id !== 45 && !data.children"
						@click="removeHandler(data)"></i>
				</span>
			</div>
		</el-tree>

		<!-- 编辑对话框 -->
		<el-dialog
			width="700px"
			:visible="edit.isEdit"
			:show-close="false">
			<h2 slot="title" v-text="`系统功能维护 - ${ edit.mode ? '新增' : '修改' }`" class="dialog-title"></h2>
			<el-form label-width="150px" :model="edit.model" :rules="edit.validationRules" ref="editForm">
				<el-form-item label="父级节点名称：" v-show="edit.mode">
					<span v-text="edit.fName"></span>
				</el-form-item>
				<el-form-item label="系统功能类型：" v-show="edit.mode">
					<el-radio v-model="edit.isLeaf" :label="false" :disabled=" this.edit.model.func_fid !== 0">非叶子功能节点</el-radio>
					<el-radio v-model="edit.isLeaf" :label="true">叶子功能节点</el-radio>
				</el-form-item>
				<el-form-item label="系统功能名称：" prop="func_name">
					<el-input v-model.trim="edit.model.func_name" placeholder="请输入系统功能名称"></el-input>
				</el-form-item>
				<el-form-item label="系统功能关联组件：" v-show="edit.isLeaf" prop="func_key">
					<el-select placeholder=" - 请选择系统功能关联组件 - " v-model="edit.model.func_key">
						<el-option v-for="(value, p) in Views" :value="p" :label="p" :disabled="isFuncKeyUsed(p)">
							<el-popover trigger="hover" :content="value.remark" placement="right">
								<span v-text="p" slot="reference" class="select-option"></span>
							</el-popover>
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
	import Views from '../index.js';

        export default {
                name: 'Func',
	        data: function(){
		        return {
		                Views,
		                edit: {
					isEdit: false,                          // 标识是否进入编辑状态（新增、修改）
			                mode: true,                          // 标识当前是新增还是修改
			                isLeaf: false,                          // 标识当前要新增的节点是不是叶子节点
			                fName: '',                              // 标识当前要新增的节点的父级节点的名字
			                model: { func_id: 0, func_name: '', func_key: '', func_fid: -1 },
			                validationRules: {
					        func_name: [
						        {
						                validator: (rule, value, callback) => {
							                if(value === '')
							                        callback(new Error('系统功能名称不能为空！'));
							                else if(value.length < 2 || value.length > 20)
							                        callback(new Error('系统功能名称长度2 - 20！'));
							                else if(this._isFuncNameExist(value))
							                        callback(new Error('该名字在同级节点中已存在！'));
							                else
							                        callback();
                                                                },
							        trigger: 'blur'
						        }
					        ],
				                func_key: [
					                {
					                        validator: (rule, value, callback) => {
					                                if(this.edit.isLeaf && value === '')
					                                        callback(new Error('必须指定系统系统功能关联组件'));
						                        else
						                                callback();
					                        },
					                        trigger: 'change'
					                }
				                ]
			                }
		                }
		        }
                },
                computed: {
                        treeData: function(){
                                return [{
                                        func_id: 0,
	                                func_name: 'ROOT',
	                                func_key: '',
	                                func_fid: -1,
	                                children: this.$store.getters['func/listWithTree']
                                }];
                        },
                        isFuncKeyUsed: function(){
                                return func_key => this.$store.state.func.list.some(item => item.func_key === func_key);
                        }
                },
                methods: {
                        _isFuncNameExist: function(func_name){
                                if(this.edit.mode)
                                        return this.$store.state.func.list.some(item =>
                                                item.func_name === func_name &&
                                                item.func_fid === this.edit.model.func_fid);
                                else
                                        return this.$store.state.func.list.some(item =>
                                                item.func_name === func_name &&
                                                item.func_fid === this.edit.model.func_fid &&
                                                item.func_id !== this.edit.model.func_id);
                        },
                        removeHandler: function(data){
                                this.$confirm(
                                        `确认要删除功能菜单：“${data.func_name}” ? `,
                                        '警告',
                                        { showClose: false, type: 'warning' })
                                        .then(() => this.$store.dispatch('func/remove', data.func_id))  // 调用子仓库中的actions节点的remove方法
                                        .then(() => this.$message({ message: `功能菜单节点： “${ data.func_name }” 删除成功！`, type: 'success'  }))
                                        .catch(() => {});
                        },
                        beginAdd: function(data){
                                this.edit.mode = true;                  // 进入新增
                                this.edit.isLeaf = data.func_id !== 0;          // 判断是不是根节点
                                this.edit.fName = data.func_name;       // 新增的节点的父级节点的名称

                                this.edit.model.func_id = 0;            // 初始化0
                                this.edit.model.func_name ='';          // 初始化空
                                this.edit.model.func_key ='';            // 初始化空
                                this.edit.model.func_fid = data.func_id;                // fid的值是节点的id

                                this.edit.isEdit = true;                // 进入编辑状态
                        },
                        beginUpdate: function(data){
                                this.edit.mode = false;
                                this.edit.isLeaf = data.func_key !== '';
                                this.edit.fName = '';

                                this.edit.model.func_id = data.func_id;
                                this.edit.model.func_name =data.func_name;
                                this.edit.model.func_key =data.func_key;
                                this.edit.model.func_fid = data.func_fid;

                                this.edit.isEdit = true;                // 进入编辑状态
                        },
                        save: function(){
                                this.$refs.editForm.validate(isValid => {
                                        if(isValid) {
                                                if(this.edit.mode) {            //新增
                                                        this.$store.dispatch('func/add', this.edit.model)
                                                                .then(() => {
                                                                        this.edit.isEdit = false;
                                                                        this.$message({
                                                                                message: `系统功能： “${ this.edit.model.func_name }” 添加成功！ `,
                                                                                type: 'success'
                                                                        });
                                                                });
                                                } else {                //修改
                                                        this.$store.dispatch('func/update', this.edit.model)
                                                                .then(() => {
                                                                        this.edit.isEdit = false;
                                                                        this.$message({
                                                                                message: `系统功能： “${ this.edit.model.func_name }” 修改成功！ `,
                                                                                type: 'success'
                                                                        });
                                                                });
                                                }
                                        }
                                });
                        }
                },
                created: function(){
	                this.$store.dispatch('func/init');
                },
	        watch: {
                        'edit.isEdit': function(newValue, oldValue){
	                        if(!newValue) {
	                                this.$refs.editForm.resetFields();             //重置表单
	                        }
                        },
		        'edit.isLeaf': function(newValue, oldValue){
			        if(!newValue) this.edit.model.func_key ='';
                        }
	        }
        };
</script>

<style scoped>
	.el-tree {
		width: 400px;
	}
	.tree-right {
		flex-grow: 1;
		display: flex;
		justify-content: space-between;
	}
	.right>* {
		margin-left: 10px;
	}
	h2.dialog-title {
		height: 40px;
		line-height: 40px;
		text-align: center;
	}
	span.select-option {
		display: block;
		width: 100%;
	}
</style>