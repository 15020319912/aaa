<template>
	<el-container>
		<el-header height="40">
			<el-form :inline="true">
				<el-form-item label="员工名字：">
					<el-input
						v-model="search.stf_name"
						placeholder="请输入搜索内容"
						@change="getData()"
						clearable
						prefix-icon="el-icon-search"
						></el-input>
				</el-form-item>
				<el-form-item label="员工类型：">
					<el-select v-model="search.stf_category"  @change="getData()">
						<i slot="prefix" class="el-icon-search" style="margin: 0 3px"></i>
						<el-option :value="0" label="- 所有类型 -"></el-option>
						<el-option
							v-for="item in $store.getters['dictionary/getGroupByKey']('staff_category')"
							:key="item.dic_key"
							:value="item.dic_id"
							:label="item.dic_name"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item style="float: right">
					<el-button type="success" size="medium" icon="el-icon-plus" @click="beginAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<div class="table-wrapper">
				<el-table :data="list" border style="width: 100%;" stripe>
					<el-table-column type="index" label="#" align="center"></el-table-column>
					<el-table-column prop="stf_name" label="员工姓名" width="100" ></el-table-column>
					<el-table-column label="员工类别" width="100">
						<template slot-scope="{ row }">
							<span v-text="$store.getters['dictionary/getNameById'](row.stf_category)"></span>
						</template>
					</el-table-column>
					<el-table-column label="员工备注">
						<template slot-scope="{ row }">
							<span :class="{ empty: !row.stf_remark }"  v-text="row.stf_remark || '暂无相关备注...' "></span>
						</template>
					</el-table-column>
					<el-table-column label="员工状态" width="100" align="center" >
						<template slot-scope="{ row }">
							<span :class="{ dimission: !row.stf_invalid }" v-text="row.stf_invalid ? '在职' : '离职'"></span>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="150" align="center">
						<template slot-scope="{ row }">
							<el-button size="mini" type="primary" @click="beginUpdate(row)">修改</el-button>
							<el-button size="mini" type="danger" v-if="row.stf_invalid" @click="dimissionHandler(row)">离职</el-button>
							<el-button size="mini" type="warning" v-else @click="reinstateHandler(row)">入职</el-button>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</el-main>
		<el-footer height="30px">
			<el-pagination
				background
				:total="pagination.total"
				:page-size.sync="pagination.pageSize"
				:current-page.sync="pagination.currentPage"
				layout="total, prev, pager, next, jumper, ->, sizes"
				:page-sizes="[5, 8, 10, 15, 20]"
				@size-change="getData()"
				@current-change="getData">
			</el-pagination>
		</el-footer>
		<!-- 编辑对话框 -->
		<el-dialog
			:modal="false"
			width="700px"
			:visible="edit.isEdit"
			:show-close="false">
			<h2 slot="title" v-text="`员工维护 - ${ edit.mode ? '新增' : '修改' }`" class="dialog-title"></h2>
			<el-form label-width="100px" :model="edit.model" :rules="edit.validationRules" ref="editForm" status-icon>
				<el-form-item label="员工名字：" prop="stf_name">
					<el-input v-model.trim="edit.model.stf_name" placeholder="请输入员工名字"></el-input>
				</el-form-item>
				<el-form-item label="员工类型：" prop="stf_category">
					<el-select v-model="edit.model.stf_category" placeholder="- 请选择员工类型 -">
						<el-option
							v-for="item in $store.getters['dictionary/getGroupByKey']('staff_category')"
							:key="item.dic_id"
							:value="item.dic_id"
							:label="item.dic_name"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="员工备注：">
					<el-input type="textarea" :rows="2" placeholder="请输入员工备注..." v-model.trim="edit.model.stf_remark"></el-input>
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
                name: 'Staff',
                data() {
                        return {
                                search: { stf_name: '', stf_category: '' },
	                        pagination: { total: 0, pageSize: 5, currentPage: 1 },
	                        edit: {
                                        isEdit: false,
		                        mode: true,
					model: { stf_id: 0, stf_name: '',stf_category: 0, stf_remark: '' },
		                        validationRules: {
                                                stf_name: [
                                                        { required:true, message: '员工名字不能为空', trigger: 'blur' },
                                                        { min: 2, max:20, message: '员工名字长度2-20', trigger: 'blur' }
                                                ],
                                                stf_category: [
	                                                { required: true, message: '请选择员工类型', trigger: 'change' }
                                                ]
		                        }
	                        },
                                list: []                // 当前正在显示的员工信息
                        }
                },
	        created() { this.getData() },
	        methods: {
                        getData(currentPage = 1) {
                                this.pagination.currentPage = currentPage;
                                this.$http({
	                                url: '/staff/list',
	                                method: 'post',
	                                data: {
		                                ...this.search,
		                                begin: (this.pagination.currentPage -1) * this.pagination.pageSize,
		                                pageSize: this.pagination.pageSize
	                                }
                                }).then(({ list,total }) => {
					this.list = list;
					this.pagination.total = total;
                                });
                        },
		        //离职
		        dimissionHandler(staff) {
                                this.$confirm(
                                        `确认要让员工：“${staff.stf_name}” 离职吗 ? `,
                                        '警告',
                                        { showClose: false, type: 'warning' })
	                                .then(() => this.$http({ url: `/staff/dimission/${ staff.stf_id }`, method: 'get' }))
	                                .then(() => {
                                                var i = this.list.findIndex(item => item.stf_id === staff.stf_id)
		                                this.list[i].stf_invalid = 0;
                                                this.$message({ message: `员工："${ staff.stf_name }"离职成功！`, type: 'success' })
                                        }).catch();

		        },
		        //入职
		        reinstateHandler(staff) {
                                this.$confirm(
                                        `确认要让员工：“${staff.stf_name}” 复职吗 ? `,
                                        '警告',
                                        { showClose: false, type: 'warning' })
                                        .then(() => this.$http({ url: `/staff/reinstate/${ staff.stf_id }`, method: 'get' }))
                                        .then(() => {
                                                var i = this.list.findIndex(item => item.stf_id === staff.stf_id)
                                                this.list[i].stf_invalid = 1;
                                                this.$message({ message: `员工："${ staff.stf_name }"复职成功！`, type: 'success' })
                                        }).catch();

		        },
                        //开始新增
                        beginAdd() {
                                this.edit.mode = true;                  //标识添加

                                this.edit.model.stf_id = 0;                     //新添加的初始id值先为0，后续改变了就
                                this.edit.model.stf_name = '';                   //双向绑定 输入就有值 v-model
                                this.edit.model.stf_category= '';                   //双向绑定 输入就有值 v-model
                                this.edit.model.stf_remark = '';        //双向绑定 输入就有值 v-model

                                this.edit.isEdit = true;        //弹出显示

                        },
                        //开始修改
                        beginUpdate(staff) {
                                this.edit.mode = false;         //修改状态

                                this.edit.model.stf_id = staff.stf_id;
                                this.edit.model.stf_name = staff.stf_name;
                                this.edit.model.stf_category = staff.stf_category;
                                this.edit.model.stf_remark = staff.stf_remark;

                                this.edit.isEdit = true;        //弹出显示
                        },
                        _saveWithAdd() {
                                this.$http({
                                        url: '/staff/add',
                                        method: 'post',
                                        data: this.edit.model
                                }).then(stf_id => {
                                        this.edit.isEdit = false;
                                        this.list.push(Object.assign({}, this.edit.model, { stf_id }));
                                        this.$message({
                                                message: `员工："${ this.edit.model.stf_name }" 添加成功！ `,
                                                type:  "success"
                                        });
                                });
                        },
                        _saveWithUpdate() {
                                this.$http({
                                        url: '/staff/update',
                                        method: 'post',
                                        data: this.edit.model
                                }).then(()=> {
                                        this.edit.isEdit = false;
                                        var i =this.list.findIndex(item => item.stf_id === this.edit.model.stf_id);
                                        this.list.splice(i, 1, Object.assign({}, this.edit.model));
                                        this.$message({
                                                message: `员工： "${ this.edit.model.stf_name }" 修改成功！ `,
                                                type: 'success'
                                        });
                                });
                        },
                        save() {
                                this.$refs.editForm.validate(isValid => {
                                        if(isValid) {
                                                //新增
                                                if(this.edit.mode) this._saveWithAdd();
                                                //修改
                                                else _saveWithUpdate();
                                        }
                                })
                        }
	        },
                watch: {
                        'edit.isEdit': function(newValue, oldValue) {
                                if(!newValue) {
                                        this.$refs.editForm.resetFields();      //重置表单
                                }
                        },
                }
        };
</script>

<style scoped>
	.el-container { height: 100%; }
	.el-main { flex: 0.98; position: relative}
	h2.dialog-title {
		background-color: #0094ff;
		text-indent: 2em;
		color: #fff;
		height: 40px;
		line-height: 40px;
		font-size: 18px;
	}
	span.dimission { color: red }
	span.empty { color: #ccc }
</style>