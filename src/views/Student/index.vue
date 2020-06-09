<template>
	<el-container>
		<el-header height="40">
			<el-form :inline="true">
				<el-form-item label="学生名字：">
					<el-input
						v-model="search.stu_name"
						placeholder="请输入搜索内容"
						clearable
						@change="getData()"
						prefix-icon="el-icon-search"
					></el-input>
					<!-- @change="getData()" -->
				</el-form-item>
				<el-form-item label="所在班级：">
					<el-select v-model="search.stu_cls_id" @change="getData()">
						<i slot="prefix" class="el-icon-search" style="margin: 0 3px"></i>
						<el-option :value="0" label="- 全部 -"></el-option>
						<el-option :value="null" label="- 无班级 -"></el-option>
						<el-option
							v-for="item in listClass"
							:key="item.cls_id"
							:value="item.cls_id"
							:label="item.cls_name"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="学生学历：">
					<el-select v-model="search.stu_qualification" @change="getData()">
						<i slot="prefix" class="el-icon-search" style="margin: 0 3px"></i>
						<el-option :value="0" label="- 全部 -"></el-option>
						<el-option
							v-for="item in  $store.getters['dictionary/getGroupByKey']('qualification')"
							:key="item.dic_id"
							:value="item.dic_id"
							:label="item.dic_name"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item style="float: right">
					<el-button type="success" size="small " icon="el-icon-share" @click="beginAssignClassBatch">批量分班</el-button>
				</el-form-item>
				<el-form-item style="float: right">
					<el-button type="primary" size="small " icon="el-icon-plus" @click="beginAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<div class="table-wrapper">
				<el-table :data="list" border style="width: 100%;" stripe @selection-change="selectionChangeHandler">
					<el-table-column type="index" label="#" align="center" fixed></el-table-column>
					<el-table-column type="selection" align="center" fixed></el-table-column>
					<el-table-column prop="stu_name" label="学生名字" width="100" fixed ></el-table-column>
					<el-table-column label="班级" width="120" >
						<template slot-scope="{ row }">
							<span style="color: #ccc" v-if="row.stu_cls_id === null">无班级</span>
							<span v-else v-text="listClass.find(item => item.cls_id === row.stu_cls_id).cls_name"></span>
						</template>
					</el-table-column>
					<el-table-column label="存档照片" width="100" align="center" >
						<template slot-scope="{ row }">
							<el-popover placeholder="right" :title="row.stu_name" trigger="click" >
								<el-image :src="row.stu_avatar || defaultAvatar" style="width: 150px; height: 210px;" fit="contain"></el-image>
								<el-button slot="reference" type="text">预览</el-button>
							</el-popover>
						</template>
					</el-table-column>
					<el-table-column label="性别" width="60" align="center" >
						<template slot-scope="{ row }">
							<span v-text="row.stu_sex === 1 ? '男' : '女'"></span>
						</template>
					</el-table-column>
					<el-table-column prop="stu_phone" label="联系方式" width="120" align="center"></el-table-column>
					<el-table-column prop="stu_phone2" label="联系方式（备用）" width="120" align="center" ></el-table-column>
					<el-table-column prop="stu_born" label="出生日期" width="100" align="center"></el-table-column>
					<el-table-column prop="stu_qualification" label="学历" width="100" >
						<template slot-scope="{ row }">
							<span v-text="$store.getters['dictionary/getNameById'](row.stu_qualification)"></span>
						</template>
					</el-table-column>
					<el-table-column prop="stu_school" label="毕业院校" width="200" show-overflow-tooltip ></el-table-column>
					<el-table-column prop="stu_major" label="专业" width="200"  show-overflow-tooltip ></el-table-column>
					<el-table-column prop="stu_address" label="所在地址" width="240" show-overflow-tooltip  ></el-table-column>
					<el-table-column label="备注" width="240" show-overflow-tooltip >
						<template slot-scope="{ row }">
							<span v-if="row.stu_remark === ''" style="color: #ccc">暂无相关备注...</span>
							<span v-else v-text="row.stu_remark"></span>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="400" align="center" fixed="right">
						<template slot-scope="{ row }">
							<el-button size="mini" type="success" icon="el-icon-share" @click="beginAssignClass(row)">分班</el-button>
							<el-button size="mini" type="danger" icon="el-icon-picture" @click="beginUploadAvatar(row)">照片存档</el-button>
							<el-button size="mini" type="danger" icon="el-icon-edit" @click="beginUpdate(row)">编辑</el-button>
							<el-button size="mini" type="warning" icon="el-icon-delete">删除</el-button>
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
			<h2 slot="title" v-text="`学生维护 - ${ edit.mode ? '新增' : '修改' }`" class="dialog-title"></h2>
			<el-form label-width="130px" :model="edit.model" :rules="edit.validationRules" ref="editForm" status-icon>
				<el-form-item label="学生名字：" prop="stu_name">
					<el-input v-model.trim="edit.model.stu_name" placeholder="请输入学生名字"></el-input>
				</el-form-item>
				<el-form-item label="性别：">
					<el-radio v-model="edit.model.stu_sex" :label="1">男</el-radio>
					<el-radio v-model="edit.model.stu_sex" :label="0">女</el-radio>
				</el-form-item>
				<el-form-item label="联系电话：" prop="stu_phone">
					<el-input v-model.trim="edit.model.stu_phone"  placeholder="请输入手机号" maxlength="11" show-word-limit></el-input>
				</el-form-item>
				<el-form-item label="备用电话：" prop="stu_phone2">
					<el-input v-model.trim="edit.model.stu_phone2"  placeholder="请输入备用手机号" maxlength="11" show-word-limit>
						<tempalte slot="append">例如：025-88888888</tempalte>
					</el-input>
				</el-form-item>
				<el-form-item label="出生日期：" prop="stu_born">
					<el-date-picker
						v-model="edit.model.stu_born" placeholder="请选择出生日期"
						:editable="false" value-format="yyyy-MM-dd"
						:picker-options="pickerOptions"></el-date-picker>
				</el-form-item>
				<el-form-item label="学历：" prop="stu_qualification">
					<el-select v-model="edit.model.stu_qualification" placeholder="- 请选择学生学历 -">
						<el-option
							v-for="item in  $store.getters['dictionary/getGroupByKey']('qualification')"
							:key="item.dic_id" :value="item.dic_id" :label="item.dic_name"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="在读/毕业院校：" >
					<el-input v-model.trim="edit.model.stu_school" placeholder="请输入在读/毕业院校（选填）"></el-input>
				</el-form-item>
				<el-form-item label="家庭住址："  prop="stu_address">
					<el-input v-model.trim="edit.model.stu_address" placeholder="请输入家庭住址"></el-input>
				</el-form-item>
				<el-form-item label="学生备注：">
					<el-input type="textarea" :rows="4" placeholder="请输入学生备注..." v-model.trim="edit.model.stu_remark"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button type="primary" size="medium" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false" size="medium">取消</el-button>
			</div>
		</el-dialog>
		<!-- 分班对话框 -->
		<el-dialog
			:modal="false"
			width="700px"
			:visible="edit2.isEdit"
			:show-close="false">
			<h2 slot="title"  class="dialog-title">分班</h2>
			<el-form label-width="80px">
				<el-form-item label="班级：">
					<el-select v-model="edit2.model.stu_cls_id">
						<el-option :value="null" label="- 无班级 -"></el-option>
						<el-option
							v-for="item in listClass"
							:key="item.cls_id"
							:value="item.cls_id"
							:label="item.cls_name"
							:disabled="item.cls_end !== null"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button type="primary" size="medium" @click="assignClass">确定</el-button>
				<el-button @click="edit2.isEdit = false" size="medium">取消</el-button>
			</div>
		</el-dialog>
		<!-- 照片存档对话框 -->
		<el-dialog
			:modal="false"
			width="1100px"
			:visible="edit3.isEdit"
			:show-close="false">
			<h2 slot="title"  class="dialog-title">照片存档</h2>
			<el-form label-width="100px">
				<el-form-item label="个人照片：">
					<div class="avatar-wrapper">
						<div class="avatar-wrapper-old" v-if="edit3.model.stu_avatar_old !== null">
							<el-image :src="edit3.model.stu_avatar_old"></el-image>
							<p>学生当前存档图片</p>
						</div>
						<div class="avatar-wrapper-new">
							<el-upload
								class="avatar-uploader" list-type="picture-card"
								accept=".png.jpg" action="/student/avatarupload"
								name="avatar" :headers="uploadHandlers"
								ref="upload"
								:before-upload="beforeUploadHandler"
								:on-success="successHandler"
								:on-remove="removeHandler">
								<i class="el-icon-plus avatar-uploader-icon"> </i>
								<p slot="tip" style="color: red">提示：只能上传jpg/png文件，且不能超过2M，一寸照片宽高比最好为5：7</p>
							</el-upload>
						</div>
					</div>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button type="primary" size="medium"  :disabled="this.edit3.model.stu_avatar_new === null" @click="uploadAvatar">存档</el-button>
				<el-button @click="edit3.isEdit = false" size="medium">取消</el-button>
			</div>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import defaultAvatar from '../../assets/default.jpg';

        export default {
                name: 'Student',
                data() {
                        return {
                                defaultAvatar,
                                pickerOptions: {
                                        disabledDate(time) {
                                                var year = new Date().getFullYear();
                                                var minYear = year - 16;
                                                return time.getTime() > new Date(minYear, 0, 1).getTime();
                                        }
	                        },
                                uploadHandlers: { Authorization: sessionStorage.getItem('token') },
                                list: [],
                                listClass: [], //所有班级的信息
                                search: { stu_name: '', stu_cls_id: 0, stu_qualification: 0 },
                                pagination: { total: 0, pageSize: 5, currentPage: 1 },
	                        //学生新增/修改功能的驱动数据
	                        edit: {
                                        isEdit: false,
		                        mode: true,
		                        model: {
                                                stu_id: null,
			                        stu_name: '',
			                        stu_cls_id: null,
			                        stu_qualification: null,
			                        stu_school: '',
			                        stu_major: '',
			                        stu_address: '',
			                        stu_remark: '',
			                        stu_avatar: null,
			                        stu_sex: 1,
			                        stu_phone: '',
			                        stu_phone2: '',
			                        stu_born: null,
		                        },
		                        validationRules: {
                                                stu_name: [
			                                { required:true, message: '* 学生名字必填', trigger: 'blur' },
			                                { min: 2, max:20, message: '员工名字长度2-20', trigger: 'blur' }
                                                ],
                                                stu_phone: [
                                                        { required:true, message: '* 学生联系电话必填', trigger: 'blur' },
                                                        { pattern: /^1[3584]\d{9}$/, message: '* 无效手机号', trigger: 'blur' }
                                                ],
                                                stu_phone2: [
                                                        { required:true, message: '* 联系方式必填', trigger: 'blur' },
	                                                { pattern: /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/, message: '* 无效的手机号', trigger: 'blur' }
                                                ],
			                        stu_born: [ { required:true, message: '* 出生日期必填', trigger: 'blur' } ],
                                                stu_qualification: [ { required:true, message: '* 学生学历必选', trigger: 'change' } ],
                                                stu_address:[
                                                        { required:true, message: '* 家庭住址必填', trigger: 'blur' },
                                                        { min: 10, max:100, message: '员工名字长度10 -100', trigger: 'blur' }
                                                ]

		                        }
	                        },
	                        //学生分班操作驱动的数据
	                        edit2: {
                                        isEdit: false,
		                        model: {
                                                stu_id: null,           // 为null表示的是批量分班，不为null表示的是单个分班
			                        stu_ids: [],
			                        stu_cls_id: null
		                        }
	                        },
	                        //学生照片存档功能驱动数据
	                        edit3: {
                                        isEdit: false,
		                        model: { stu_id: null, stu_avatar_old: null, stu_avatar_new: null }
	                        }
                        }
                },
	        methods: {
                        getData(currentPage = 1) {
                                this.pagination.currentPage = currentPage;
                                this.$http({
                                        url: '/student/list',
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
			beginAdd() {
                                this.edit.mode = true;
                                this.edit.isEdit = true;
			},
		        beginUpdate(stu) {
                                this.edit.model.stu_id = stu.stu_id;
                                this.edit.model.stu_name = stu.stu_name;
                                this.edit.model.stu_avatar = stu.stu_avatar;
                                this.edit.model.stu_cls_id = stu.stu_cls_id;
                                this.edit.model.stu_sex = stu.stu_sex;
                                this.edit.model.stu_phone = stu.stu_phone;
                                this.edit.model.stu_phone2 = stu.stu_phone2;
                                this.edit.model.stu_born =  stu.stu_born;
                                this.edit.model.stu_qualification = stu.stu_qualification;
                                this.edit.model.stu_school = stu.stu_school;
                                this.edit.model.stu_major =  stu.stu_major;
                                this.edit.model.stu_address = stu.stu_address;
                                this.edit.model.stu_remark = stu.stu_remark;

                                this.edit.mode = false
                                this.edit.isEdit = true;
		        },
                        _saveWithAdd() {
                                this.$http({ url: '/student/add', method: 'post', data: this.edit.model })
                                        .then(stu_id => {
                                                this.list.push(Object.assign({}, this.edit.model, { stu_id }));
                                                this.$message({
                                                        message: `学生："${ this.edit.model.stu_name }" 添加成功！`,
                                                        type: 'success'
                                                });
                                                this.edit.isEdit = false;
                                        });
                        },
                        _saveWithUpdate() {
                                this.$http({ url: '/student/update', method: 'post', data: this.edit.model })
                                        .then(() => {
                                                var i = this.list.findIndex(item => item.stu_id === this.edit.model.stu_id);
                                                this.list.splice(i, 1, Object.assign({}, this.edit.model));
                                                this.$message({ message: '学生信息修改成功',  type: 'success' });
                                                this.edit.isEdit = false;
                                        });
                        },
                        save() {
                                this.$refs.editForm.validate()
                                        .then(() => {            // 验证电话号码
                                                if(this.list.some(item => item.stu_id === this.edit.model.stu_id && item.stu_phone === this.edit.model.stu_phone)) return Promise.resolve();
                                                else {
                                                        // ajax验证班级名称是否有效
                                                        return this.$http({ url: '/student/valid_phone', method: 'post', data: { stu_phone: this.edit.model.stu_phone }})
                                                                .then(count => {
                                                                        if(count === 0) return Promise.resolve();
                                                                        else {
                                                                                this.$alert(`手机号：${ this.edit.model.stu_phone } 在系统中已被使用!`, {
                                                                                        title: '提示', type: 'warning', showClose: false
                                                                                });
                                                                                return Promise.reject();
                                                                        }
                                                                });
                                                }
                                        })
                                        .then(() => {
                                                if(this.edit.mode) this._saveWithAdd();         // 新增
                                                else this._saveWithUpdate();                         // 修改
                                        })
                                        .catch(() => {});
                        },
		        selectionChangeHandler(rows){
                                this.edit2.model.stu_ids = rows.map(item => item.stu_id);
		        },
		        beginAssignClass(stu) {
		                this.edit2.model.stu_id = stu.stu_id;
		                this.edit2.model.stu_cls_id = stu.stu_cls_id;
		                this.edit2.isEdit = true;
		        },
		        beginAssignClassBatch() {
		                if(this.edit2.model.stu_ids.length === 0) {
		                        this.$alert('请先选择要分班的学生！', { title: '提示', type: 'warning', showClose: false });
		                } else {
                                        this.edit2.model.stu_cls_id = null;
                                        this.edit2.isEdit = true;
		                }

		        },
		        assignClass() {
				this.$http({ url: '/student/assignclass', method: 'post', data: this.edit2.model })
					.then(() => {
				                if(this.edit2.model.stu_id !== null) {
				                        var i = this.list.findIndex(item => item.stu_id === this.edit2.model.stu_id);
				                        this.list[i].stu_cls_id = this.edit2.model.stu_cls_id;
				                } else {
				                        this.list.forEach(item => {
				                                if(this.edit2.model.stu_ids.indexOf(item.stu_id) !== -1) {
				                                        item.stu_cls_id = this.edit2.model.stu_cls_id;
				                                }
				                        })
				                }
				                this.$message({ message: '学生分班成功！', type: 'success' });
				                this.edit2.isEdit = false;
					})
		        },
		        //照片存档
		        beforeUploadHandler(file) {
		                const isJPG = file.type === 'image/jpeg';
		                const isPNG = file.type === 'image/png';
		                const isLt2M = file.size / 1024 / 1024 < 2;

		                if((!isJPG) && (!isPNG)) {
		                        this.$message.error('学生存档照片只能是JPG格式或PNG格式！');
		                }
		                if(!isLt2M) {
		                        this.$message.error('学生存档照片大小不能超过2MB！');
		                }
		                return (isJPG || isPNG) && isLt2M;
		        },
		        successHandler(response, file, fileList) {
		                if(response.status === 200) {
                                        this.edit3.model.stu_avatar_new = response.data;
                                        if(fileList.length > 1) fileList.space(0, 1);
		                } else {
		                        this.$message.error('存档照片 预上传 失败！')
		                }

		        },
		        removeHandler(file, fileList) { this.edit3.model.stu_avatar_new = null; },
		        beginUploadAvatar(stu) {
		                this.edit3.model.stu_id = stu.stu_id;
		                this.edit3.model.stu_avatar_old = stu.stu_avatar;
		                this.edit3.isEdit = true;
		        },
		        uploadAvatar() {
		                this.$http({ url: '/student/avatarupdate', method: 'post', data: this.edit3.model })
			                .then(stu_avatar => {
                                                var i = this.list.findIndex(item => item.stu_id === this.edit3.model.stu_id);
                                                this.list[i].stu_avatar = stu_avatar;
			                        this.$message({ message: '学生照片存档成功！', type: 'success' });
			                        this.edit3.isEdit = false;
			                })
		        }
	        },
	        created() {
                        //
                        this.$http({
	                        url: '/class/all',
	                        method: 'get'
                        }).then(list => this.listClass = list);
                        //发送ajax拿取页面需要的学生信息
		        this.getData();

	        },
	        watch: {
                        'edit.isEdit'(newValue, oldValue) {
                                if(!newValue) {             //对话框关闭
	                                this.edit.model.stu_id = null;
	                                this.edit.model.stu_name = '';
	                                this.edit.model.stu_avatar = null;
	                                this.edit.model.stu_cls_id = null;
	                                this.edit.model.stu_sex = 1;
	                                this.edit.model.stu_phone = '';
	                                this.edit.model.stu_phone2 = '';
	                                this.edit.model.stu_born =  null;
	                                this.edit.model.stu_qualification = null;
	                                this.edit.model.stu_school = '';
	                                this.edit.model.stu_major =  '';
	                                this.edit.model.stu_address = '';
	                                this.edit.model.stu_remark = '';
	                        } else {
	                                if(this.$refs.editForm)     //清空表单验证信息
	                                        this.$refsForm.clearValidate();
	                        }
                        },
		        'edit2.isEdit'(newValue, oldValue) {
                                if(!newValue) {
                                        this.edit2.model.stu_cls_id = null;
                                        this.edit2.model.stu_id = null;
                                }
		        },
                        'edit3.isEdit'(newValue, oldValue) {
                                if(!newValue) {
                                        this.edit3.model.stu_id = null;
                                        this.edit3.model.stu_avatar_old = null;
                                        this.edit3.model.stu_avatar_new = null;
                                        this.$refs.upload.clearFiles();                         //清空上传控件残留的选择

                                }
                        }
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

	/* 上传控件样式 */
	.avatar-uploader /deep/ .el-upload {
		border: 1px dashed #d9d9d9;
		border-radius: 6px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		width: 200px;
		height: 280px;
	}
	.avatar-uploader /deep/ .el-upload:hover {
		border-color: #409EFF;
	}
	.avatar-uploader-icon {
		font-size: 28px;
		color: #8c939d;
		width: 200px;
		height: 280px;
		line-height: 280px;
		text-align: center;
	}
	.avatar-uploader /deep/ .el-upload-list__item {
		width: 200px;
		height: 280px;
	}

	.avatar-wrapper {
		display: flex;
	}
	.avatar-wrapper-old { margin-right: 10px }
	.avatar-wrapper-old>.el-image {
		width: 200px;
		height: 280px;
	}
</style>