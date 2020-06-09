<template>
	<el-container>
		<el-header height="40px">
			<el-form :inline="true">
				<el-form-item label="班级名称：">
					<el-input
						clearable
						placeholder="请输入搜索内容"
						prefix-icon="el-icon-search"
						v-model.trim="search.cls_name"
						@change="getData()"></el-input>
				</el-form-item>
				<el-form-item label="所属专业：">
					<el-select v-model="search.cls_dic_id_major" @change="getData()">
						<i slot="prefix" class="el-icon-search"></i>
						<el-option :value="0" label="- 所有专业 - "></el-option>
						<el-option
							v-for="item in $store.getters['dictionary/getGroupByKey']('class_major')"
							:key="item.dic_id" :value="item.dic_id" :label="item.dic_name"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="班级状态：">
					<el-select v-model="search.cls_status" @change="getData()">
						<el-option :value="0" label="-所有-"></el-option>
						<el-option :value="1" label="开课中"></el-option>
						<el-option :value="2" label="未开课"></el-option>
						<el-option :value="3" label="结课"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item style="float: right">
					<el-button type="success" size="medium" icon="el-icon-plus" @click="beginAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<div class="table-wrapper">
				<el-table border stripe :highlight-current-row="true" :data="list" style="width: 100%" height="100%">
					<el-table-column type="index" label="#" align="center" fixed></el-table-column>
					<el-table-column label="班级名称" prop="cls_name" width="130" fixed></el-table-column>
					<el-table-column label="班级专业" width="120">
						<template slot-scope="{ row }">
							<span v-text="$store.getters['dictionary/getNameById'](row.cls_dic_id_major)"></span>
						</template>
					</el-table-column>
					<el-table-column label="教学老师" width="100" align="center">
						<template slot-scope="{ row }">
							<span v-text="staffListTeacher.find(item => item.stf_id === row.cls_stf_id_teacher).stf_name"></span>
						</template>
					</el-table-column>
					<el-table-column label="教务老师" width="100" align="center">
						<template slot-scope="{ row }">
							<span v-text="staffListAdmin.find(item => item.stf_id === row.cls_stf_id_admin).stf_name"></span>
						</template>
					</el-table-column>
					<el-table-column label="就业老师" width="100" align="center">
						<template slot-scope="{ row }">
							<span v-text="staffListJob.find(item => item.stf_id === row.cls_stf_id_job).stf_name"></span>
						</template>
					</el-table-column>
					<el-table-column label="教室" width="100">
						<template slot-scope="{ row }">
							<span v-if="row.cls_clsr_id === null"></span>
							<span v-else v-text="$store.getters['classroom/getNameById'](row.cls_clsr_id)"></span>
						</template>
					</el-table-column>
					<el-table-column label="开课时间" prop="cls_begin" width="120" align="center"></el-table-column>
					<el-table-column label="结课时间" prop="cls_end" width="120" align="center"></el-table-column>
					<el-table-column label="班级状态" width="100" align="center">
						<template slot-scope="{ row }">
							<span v-if="row.cls_begin === null" class="do">未开课</span>
							<span v-else-if="row.cls_end === null" class="doing">开课中</span>
							<span v-else class="done">结课</span>
						</template>
					</el-table-column>
					<el-table-column label="备注" show-overflow-tooltip>
						<template slot-scope="{ row }">
							<span :class="{ empty: !row.cls_remark }" v-text="row.cls_remark || '暂无相关备注...'"></span>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="190" align="center" fixed="right">
						<template slot-scope="{ row }">
							<el-button type="primary" size="mini" icon="el-icon-edit" @click="beginUpdate(row)">修改</el-button>
							<el-button type="success" size="mini" v-if="row.cls_begin === null" @click="beginClassBegin(row)">开课</el-button>
							<el-button type="danger" size="mini" v-else-if="row.cls_end === null" @click="classEnd(row)">结课</el-button>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</el-main>
		<el-footer height="32px">
			<el-pagination
				background
				:page-size.sync="pagination.pageSize"
				:currentPage.sync="pagination.currentPage"
				:total="pagination.total"
				layout="prev, pager, next, jumper, total, ->, sizes"
				:page-sizes="[5, 8, 10, 15, 20]"
				@size-change="getData()"
				@current-change="getData" >
			</el-pagination>
		</el-footer>
		<!--新增修改对话框-->
		<el-dialog
			:modal="false"
			width="700px"
			:visible="edit.isEdit"
			:show-close="false" >
			<h2 slot="title" v-text="`班级维护-${edit.mode ? '新增' : '修改' }`" class="custom-dialog-title"></h2>
			<el-form label-width="100px" :model="edit.model" :rules="edit.validationRules" ref="editForm" status-icon>
				<el-form-item label="班级名称：" prop="cls_name">
					<el-input v-model.trim="edit.model.cls_name" placeholder="请输入班级名称"></el-input>
				</el-form-item>
				<el-form-item label="班级专业：" prop="cls_dic_id_major">
					<el-select v-model.trim="edit.model.cls_dic_id_major" >
						<el-option
							v-for="item in $store.getters['dictionary/getGroupByKey']('class_major')"
							:key="item.dic_id"
							:value="item.dic_id"
							:label="item.dic_name" >
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教室：" v-show="edit.model.cls_begin !== null && edit.model.cls_end === null">
					<el-select v-model="edit.model.cls_clsr_id">
						<el-option
							v-for="item in $store.state.classroom.list"
							:key="item.clsr_id"
							:value="item.clsr_id"
							:label="item.clsr_name"
							:disabled="
								(!!item.clsr_occupy) &&
								list.some(item2 => item2.cls_id === edit.model.cls_id && item2.cls_clsr_id === item.clsr_id)"
							></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教学老师：" prop="cls_stf_id_teacher">
					<el-select v-model="edit.model.cls_stf_id_teacher">
						<el-option v-for="item in staffListTeacher" :key="item.stf_id" :value="item.stf_id" :label="item.stf_name"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教务老师：" prop="cls_stf_id_admin">
					<el-select v-model="edit.model.cls_stf_id_admin">
						<el-option v-for="item in staffListAdmin" :key="item.stf_id" :value="item.stf_id" :label="item.stf_name"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="就业老师：" prop="cls_stf_id_job">
					<el-select v-model="edit.model.cls_stf_id_job">
						<el-option v-for="item in staffListJob" :key="item.stf_id" :value="item.stf_id" :label="item.stf_name"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="班级备注：">
					<el-input type="textarea" :rows="4" placeholder="请输入班级备注..." v-model.trim="edit.model.cls_remark"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button type="primary" size="medium" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false" size="medium">取消</el-button>
			</div>
		</el-dialog>
		<!-- 开班操作对话框 -->
		<el-dialog
			:modal="false"
			width="700px"
			:visible="edit2.isEdit"
			:show-close="false" >
			<h2 slot="title" class="custom-dialog-title">开班</h2>
			<el-form label-width="100px" :model="edit2.model" :rules="edit2.validationRules" ref="editForm2" status-icon>
				<el-form-item label="教室："  prop="cls_clsr_id">
					<el-select v-model="edit2.model.cls_clsr_id">
						<el-option
							v-for="item in $store.state.classroom.list"
							:key="item.clsr_id"
							:value="item.clsr_id"
							:label="item.clsr_name"
							:disabled="!item.clsr_occupy"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button type="primary" size="medium" @cilck="classBegin">确定</el-button>
				<el-button @click="edit2.isEdit = false" size="medium">取消</el-button>
			</div>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">

        export default {
                name: 'Class',
                data() {
                        return {
                                list: [],
                                staffListTeacher: [],
                                staffListAdmin: [],
                                staffListJob: [],
                                // 查询对应的驱动数据
                                search: { cls_name: '', cls_dic_id_major: 0, cls_status: 0 },
                                pagination: { total: 0, currentPage: 1, pageSize: 5 },
	                        // 班级新增修改驱动数据
                                edit: {
                                        isEdit: false,
                                        mode: true,
                                        model: {
                                                cls_id: 0, cls_name: '', cls_dic_id_major: null, cls_clsr_id: null, cls_stf_id_teacher: null,
                                                cls_stf_id_admin: null, cls_stf_id_job: null, cls_begin: null, cls_end: null, cls_remark: null,
                                        },
                                        validationRules: {
                                                cls_name: [{
                                                        validator: (rule, value, callback) => {
                                                                if(value === '') callback(new Error('* 班级名称不能为空！'));
                                                                else if(value.length < 2 || value.length > 20) callback(new Error('* 班级名称长度2 - 20'));
                                                                else if(this.list.some(item => item.cls_id === this.edit.model.cls_id &&  item.cls_name === value)) callback();
                                                                else {
                                                                        // ajax
                                                                        this.$http({
                                                                                url: '/class/valid_name',
                                                                                method: 'post',
                                                                                data: { cls_name: value }
                                                                        }).then(count => {
                                                                                if(count === 0) callback();
                                                                                else callback(new Error('* 班级名称已存在'));
                                                                        });
                                                                }
                                                        },
                                                        trigger: 'blur'
                                                }],
                                                cls_dic_id_major: [{ required: true, message: '* 班级专业必选', trigger: 'change' }],
                                                cls_stf_id_teacher: [{ required: true, message: '* 教学老师必选', trigger: 'change' }],
                                                cls_stf_id_admin: [{ required: true, message: '* 教务老师必选', trigger: 'change' }],
                                                cls_stf_id_job: [{ required: true, message: '* 就业老师必选', trigger: 'change' }]
                                        }
                                },
	                        // 班级开班驱动数据
                                edit2: {
                                        isEdit: false,
                                        model: { cls_id:0, cls_clsr_id: null },
                                        validationRules: {
                                                cls_clsr_id: [
                                                        { required: true, message: '* 开班教室必选', trigger: 'change'}
                                                ]
                                        }
                                }
                        };
                },
                methods: {
                        getData(currentPage = 1) {
                                this.pagination.currentPage = currentPage;
                                this.$http({
                                        url: '/class/list',
                                        method: 'post',
                                        data: {
                                                ...this.search,
                                                begin: (this.pagination.currentPage - 1) * this.pagination.pageSize,
                                                pageSize: this.pagination.pageSize
                                        }
                                }).then(({list, total}) =>
                                {
                                        this.list = list;
                                        this.pagination.total =  total;
                                })
                        },
                        beginAdd() {
                                this.edit.mode = true;
                                this.edit.isEdit = true;
                        },
                        beginUpdate(cls) {
                                this.edit.model.cls_id = cls.cls_id;
                                this.edit.model.cls_name = cls.cls_name;
                                this.edit.model.cls_dic_id_major = cls.cls_dic_id_major;
                                this.edit.model.cls_clsr_id = cls.cls_clsr_id;
                                this.edit.model.cls_stf_id_teacher = cls.cls_stf_id_teacher;
                                this.edit.model.cls_stf_id_admin = cls.cls_stf_id_admin;
                                this.edit.model.cls_stf_id_job = cls.cls_stf_id_job;
                                this.edit.model.cls_begin = cls.cls_begin;
                                this.edit.model.cls_end = cls.cls_end;
                                this.edit.model.cls_remark = cls.cls_remark;

                                this.edit.mode = false;
                                this.edit.isEdit = true;
                        },
                        _saveWithAdd() {
                                this.$http({
                                        url: '/class/add',
                                        method: 'post',
                                        data: this.edit.model
                                }).then(cls_id => {
                                        this.list.push(Object.assign({}, this.edit.model, { cls_id }));
                                        this.$message({
                                                message: `班级："${ this.edit.model.cls_name }" 添加成功！ `,
                                                type:  "success"
                                        });
                                        this.edit.isEdit = false;
                                });
                        },
                        _saveWithUpdate() {
                                this.$http({
                                        url: '/class/update',
                                        method: 'post',
                                        data: this.edit.model
                                }).then(()=> {
                                        var i =this.list.findIndex(item => item.cls_id === this.edit.model.cls_id);
                                        if(this.list[i].cls_clsr_id !== this.edit.model.cls_clsr_id) {
                                                this.$store.commit('classroom/toggleStatus', this.list[i].cls_clsr_id);
                                                this.$store.commit('classroom/toggleStatus', this.edit.model.cls_clsr_id)
                                        }
                                        this.list.splice(i, 1, Object.assign({}, this.edit.model));
                                        this.$message({  message: `班级修改成功 `, type: 'success' });
                                        this.edit.isEdit = false;
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
                        },
	                // 开课
                        beginClassBegin(cls) {
                                this.$confirm(
                                        `确定要对班级："${ cls.cls_name }" 进行 开班 操作吗`,
                                        '警告',
                                        { showClose: false, type: 'warning' }
                                ).then(() => {
                                        this.edit2.model.cls_id = cls.cls_id;
                                        this.edit2.isEdit = true;
                                }).catch(() => {});
                        },
                        classBegin() {
                                this.$refs.editForm2.validate(isValid => {
                                        if(isValid) {
                                                this.$http({
                                                        url: '/class/begin',
                                                        method: 'post',
                                                        data: this.edit2.model
                                                }).then(cls_begin => {
                                                        var i = this.list.findIndex(item => item.cls_id === this.edit2.model.cls_id);
                                                        this.list.splice(i, 1, Object.assign({}, this.list[i], { cls_begin, cls_clsr_id: this.edit2.model.cls_clsr_id }));
                                                        this.$store.commit('classroom/toggleStatus', this.edit2.model.cls_clsr_id);
                                                        this.$message({ message: '开班成功！', type: 'success' });
                                                        this.edit2.isEdit = false;
                                                });
                                        }
                                })
                        },
	                // 结课
                        classEnd(cls) {
                                this.$confirm(
                                        `确定要对班级："${ cls.cls_name }"进行 结课 操作吗？ `,
                                        '警告',
                                        { showClose: false, type: 'warning' }
                                )
                                        .then(() =>  this.$http({url: '/class/end', method: 'post',data: { cls_id: cls.cls_id }}))
                                        .then(cls_end => {
                                                var i = this.list.findIndex(item => item.cls_id === cls.cls_id);
                                                this.list.splice(i, 1, Object.assign({}, this.list[i], { cls_end }));
                                                this.$store.commit('classroom/toggleStatus', this.list[i].cls_clsr_id);
                                                this.$message({ message: '结课成功！', type: 'success' });
                                        }).catch(() => {});
                        }
                },
                created() {
                        //获取教室信息 通知classroom子仓库初始化所有教室信息
                        this.$store.dispatch('classroom/init');
                        //拿取所有教学老师信息
                        this.$http({ url: '/staff/listbycategory/4', method: 'get'  }).then(list => this.staffListTeacher = list);
                        //拿取所有教务老师信息
                        this.$http({ url: '/staff/listbycategory/5', method: 'get' }).then(list => this.staffListAdmin = list);
                        //拿取所有就业老师信息
                        this.$http({  url: '/staff/listbycategory/6', method: 'get' }).then(list => this.staffListJob = list);
                        //拿取初始班级信息
                        this.getData();
                },
                watch: {
                        'edit.isEdit'(newValue, oldValue) {
                                if(!newValue) { //对话框关闭
                                        this.edit.model.cls_id = 0;
                                        this.edit.model.cls_name = '';
                                        this.edit.model.cls_dic_id_major = null;
                                        this.edit.model.cls_clsr_id = null;
                                        this.edit.model.cls_stf_id_teacher = null;
                                        this.edit.model.cls_stf_id_admin = null;
                                        this.edit.model.cls_stf_id_job = null;
                                        this.edit.model.cls_begin = null;
                                        this.edit.model.cls_end = null;
                                        this.edit.model.cls_remark = null;
                                } else {        // 对话框打开
                                        if(this.$refs.editForm)
                                                this.$refs.editForm.clearValidate();              //重置表单
                                }
                        },
                        'edit2.isEdit'(newValue, oldValue) {
                                if(!newValue) {
                                        this.edit2.model.cls_id = 0;
                                        this.edit2.model.cls_clsr_id = null;
                                } else {
                                        if(this.$refs.editForm2)
                                                this.$refs.editForm2.clearValidate();
                                }
                        }
                }
        };
</script>

<style scoped>
	.el-container { height: 100% }
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
	h2.dialog-title {
		background-color: #0094ff;
		text-indent: 2em;
		color: #fff;
		height: 40px;
		line-height: 40px;
		font-size: 18px;
	}
	span.empty { color: #ccc; }
	span.do { color: #e6a23c; }
	span.doing { color: #67c23a; }
	span.done { color: #ccc; }
</style>