<template>
	<el-container>
		<el-header height="40px">
			<el-form :inline="true">
				<el-form-item label="用户名字：">
					<el-input
						v-model.trim="search.user_name"
						placeholder="请输入搜索内容"
						clearable
						@change="getData()"
						prefix-icon="el-icon-search"></el-input>
				</el-form-item>
				<el-form-item label="用户角色：">
					<el-select v-model="search.role_id" @change="getData()">
						<el-option label="- 请选择 -" :value="0"></el-option>
						<el-option
							v-for="item in $store.state.role.list"
							:key="item.role_id"
							:label="item.role_name"
							:value="item.role_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item style="float: right">
					<el-button type="success" size="medium" icon="el-icon-plus" @click="beginAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<!-- 用elementui中的table组件进行渲染、自己设计表格的增删改功能实现 -->
			<div class="table-wrapper">
				<el-table border stripe :highlight-current-row="true" :data="list" height="100%">
					<el-table-column type="index" label="#" align="center" fixed></el-table-column>
					<el-table-column label="姓名" prop="user_name" width="150" fixed></el-table-column>
					<el-table-column label="角色" width="150">
						<template slot-scope="{ row }">
							<span v-text="roleName(row.role_id)" :class="{ dark: row.role_id === null }"></span>
						</template>
					</el-table-column>
					<el-table-column label="操作"  align="left" fixed="right">
						<template slot-scope="{ row }">
							<el-button type="primary" size="mini" @click="beginUpdate(row)">编辑</el-button>
							<el-button type="danger" size="mini" @click="remove(row)">删除</el-button>
							<el-popover placement="right" @show="beginUserRoleSet(row)">
								<h3>{{ row.user_name }} 用户角色分配： </h3>
								<el-form inline>
									<el-form-item label="角色：">
										<el-select v-model="edit.role_id" >
											<el-option label="- 无角色 -" :value="0"></el-option>
											<el-option
												v-for="item in $store.state.role.list"
												:key="item.role_id"
												:label="item.role_name"
												:value="item.role_id"></el-option>
										</el-select>
									</el-form-item>
									<el-form-item>
										<el-button size="medium" @click="configUserRole">分配</el-button>
									</el-form-item>
								</el-form>
								<el-button type="success" size="mini" slot="reference"  class="rf">角色分配</el-button>
							</el-popover>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</el-main>
		<el-footer height="32px">
			<el-pagination
				background
				:total="pagination.total"
				:page-size.sync="pagination.pageSize"
				:current-page.sync="pagination.currentPage"
				layout="total, prev, pager, next, jumper, ->, sizes"
				:page-sizes="[5, 8, 10, 12, 15]"
				@size-change="getData()"
				@current-change="getData"
			></el-pagination>
		</el-footer>
		<!-- 编辑对话框 -->
		<el-dialog
			:modal="false"
			width="700px"
			:visible="edit.isEdit"
			:show-close="false">
			<h2 slot="title" v-text="`用户维护 - ${ edit.mode ? '新增' : '修改' }`" class="custom-dialog-title"></h2>
			<el-form label-width="100px" :model="edit.model" :rules="edit.validationRules" ref="editForm" status-icon>
				<el-form-item label="用户名字："  prop="user_name" v-show="this.edit.mode">
					<el-input v-model.trim="edit.model.user_name" placeholder="请输入用户的名字"></el-input>
				</el-form-item>
				<el-form-item label="用户密码："  prop="user_pwd">
					<el-input v-model.trim="edit.model.user_pwd" placeholder="请输入用户的密码"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button type="primary" @click="save" size="medium">保存</el-button>
				<el-button @click="edit.isEdit = false" size="medium">取消</el-button>
			</div>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
        export default {
                name: 'User',
                data() {
                        return {
                                search: { user_name: '', role_id: 0 },
                                pagination: { total: 0, pageSize: 5, currentPage: 1 },
                                edit: {
                                        isEdit: false,
                                        mode: true,
                                        role_id: 0,
                                        model: { user_name: '', user_pwd: ''  },
                                        validationRules: {
                                                user_name: [
                                                        {
                                                                validator: (rule, value, callback) => {
                                                                        if(value === '')
                                                                                callback(new Error('用户名不能为空'));
                                                                        else if(value.length < 2 || value.length > 20)
                                                                                callback(new Error('用户名长度 2 -20'));
                                                                        else if(!this.edit.mode)
                                                                                callback();
                                                                        else {
                                                                                this.$http({
                                                                                        url: '/user/valid_name',
                                                                                        method: 'post',
                                                                                        data: { user_name: this.edit.model.user_name }
                                                                                })
                                                                                        .then(count => {
                                                                                                if(count === 0) callback();
                                                                                                else callback('用户名已存在');
                                                                                        });
                                                                        }
                                                                },
                                                                trigger: 'blur'
                                                        }
                                                ],
                                                user_pwd: [
                                                        { required: true, message: '请输入用户密码', trigger: 'blur' },
                                                        { min: 2, max: 20, message: '用户密码长度 2 - 20', trigger: 'blur' }
                                                ]
                                        }
                                },
                                list: []                        // 当前正在显示的用户信息
                        };
                },
                computed: {
                        roleName() {
                                return role_id => role_id === null ? '暂无角色' : this.$store.state.role.list.find(item => item.role_id === role_id).role_name;
                        }
                },
                created() {
                        this.$store.dispatch('role/init');                      // 通知仓库准备角色信息
                        this.getData();
                },
                methods: {
                        getData(currentPage = 1) {
                                this.pagination.currentPage = currentPage;
                                // 向服务器发送ajax请求，获取数据，并更新到data节点的list中
                                this.$http({
                                        url: '/user/list',
                                        method: 'post',
                                        data: {
                                                ...this.search,
                                                begin: (this.pagination.currentPage - 1) * this.pagination.pageSize,
                                                pageSize: this.pagination.pageSize
                                        }
                                }).then(({ list, total }) => {
                                        this.list = list;
                                        this.pagination.total = total;
                                });
                        },
                        // 员工删除
                        remove(user) {
                                this.$confirm(
                                        `确定要删除用户："${ user.user_name }" ？`,
                                        '警告',
                                        { showClose: false,  type: 'warning' }
                                )
                                        .then(() => this.$http({ url: '/user/remove/' + user.user_name, method: 'post' }))
                                        // 收尾性的工作：提示删除成功
                                        .then(() => {
                                                var i = this.list.findIndex(item => item.user_name === user.user_name);
                                                this.list.splice(i, 1);
                                                this.$message({ message: `用户："${ user.user_name }" 删除成功！`, type: 'success' });
                                        })
                                        .catch(() => {});
                        },
                        // 开始新增
                        beginAdd() {
                                this.edit.model.user_name = '';
                                this.edit.model.user_pwd = '';
                                this.edit.model.role_id = null;

                                this.edit.mode = true;
                                this.edit.isEdit = true;
                        },
                        // 开始修改
                        beginUpdate(user) {
                                this.edit.model.user_name = user.user_name;
                                this.edit.model.user_pwd = user.user_pwd;
                                this.edit.model.role_id = user.role_id;

                                this.edit.mode = false;
                                this.edit.isEdit = true;
                        },
                        _saveWithAdd() {
                                this.$http({ url: '/user/add', method: 'post', data: this.edit.model })
                                        .then(() => {
                                                this.edit.isEdit = false;
                                                this.list.push(Object.assign({}, this.edit.model));
                                                this.$message({
                                                        message: `用户："${ this.edit.model.user_name }" 添加成功！`,
                                                        type: 'success'
                                                });
                                        });
                        },
                        _saveWithUpdate() {
                                this.$http({ url: '/user/change_pwd', method: 'post', data: this.edit.model })
                                        .then(() => {
                                                this.edit.isEdit = false;
                                                var i = this.list.findIndex(item => item.user_name === this.edit.model.user_name);
                                                this.list.splice(i, 1, Object.assign({}, this.edit.model));
                                                this.$message({
                                                        message: `用户："${ this.edit.model.user_name }" 修改成功！`,
                                                        type: 'success'
                                                });
                                        });
                        },
                        // 保存（新增/修改）
                        save() {
                                this.$refs.editForm.validate(isValid => {       // 代码触发表单验证
                                        if(isValid) {
                                                // 新增
                                                if(this.edit.mode) this._saveWithAdd();
                                                // 修改
                                                else this._saveWithUpdate();
                                        }
                                });
                        },
                        beginUserRoleSet(user) {
                                this.edit.model.user_name = user.user_name;
                                this.edit.role_id = user.role_id || 0;
                        },
                        configUserRole() {
                                this.$http({
                                        url: '/user/config_role',
                                        method: 'post',
                                        data: {
                                                user_name: this.edit.model.user_name,
                                                role_id: this.edit.role_id
                                        }
                                })
                                        .then(() => {
                                                var i = this.list.findIndex(item => item.user_name === this.edit.model.user_name);
                                                this.list[i].role_id = this.edit.role_id || null;
                                                this.$message({
                                                        message: `"${ this.edit.model.user_name }" 角色分配成功！`,
                                                        type: 'success'
                                                });
                                        });
                        }
                },
                watch: {
                        'edit.isEdit'(newValue, oldValue) {
                                if(!newValue) this.$refs.editForm.resetFields();
                        }
                }
        };
</script>

<style scoped>
	.el-container { height: 100%; }
	.el-main { position: relative; }
	.el-main>.table-wrapper {
		box-sizing: border-box;
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0; top: 0;
		padding: 10px;
		overflow: hidden;
	}


	span.dimission { color: red; }
	span.empty { color: #ccc; }

	h2.custom-dialog-title {
		background-color: #0094ff;
		text-indent: 2em;
		color: #fff;
		height: 40px;
		line-height: 40px;
		font-size: 18px;
	}

	.rf { margin-left: 10px }

	span.dark { color: #ccc; }

	h3 { padding:20px 0; }
	/*!important*/
	/*行内样式*/
	/*选择器的权重*/
	/*权重相同，看样式出现的顺序，后出现的优先级高*/
</style>













