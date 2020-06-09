<template>
	<el-container>
		<el-header height="30px">
			<span class="state free"></span> 闲置
			<span class="state occupy"></span> 使用中
		</el-header>
		<el-main>
			<el-row :gutter="15">
				<transition-group name="edit">
					<el-col :span="6" v-for="item in $store.state.classroom.list" :key="item.clsr_id">
						<el-card
							:class="item.clsr_occupy ? 'occupy' : 'free'"
							@mouseover.native="hoverId = item.clsr_id"
							@mouseout.native="hoverId = 0">
							<span v-text="item.clsr_name"></span>
							<div class="mask" v-show="item.clsr_id === hoverId">
								<i class="el-icon-edit" @click="beginUpdate(item)"></i>
								<i class="el-icon-delete" v-if="!item.clsr_occupy" @click="removeHandler(item)"></i>
							</div>
						</el-card>
					</el-col>
				</transition-group>
				<el-col :span="6">
					<el-card @click.native="beginAdd">
						<i class="el-icon-plus"></i>
					</el-card>
				</el-col>
			</el-row>
		</el-main>
		<!-- 编辑对话框 -->
		<el-dialog
			:model="false"
			width="700px"
			:visible="edit.isEdit"
			:show-close="false">
			<h2 slot="title" v-text="`教室管理 - ${ edit.mode ? '新增' : '修改' }`" class="dialog-title"></h2>
			<el-form label-width="100px" :model="edit.model" :rules="edit.validationRules" ref="editForm">
				<el-form-item label="教室名称：" prop="clsr_name">
					<el-input v-model.trim="edit.model.clsr_name" placeholder="请输入教室名字"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</div>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
        import ElContainer from "../../../node_modules/element-ui/packages/container/src/main.vue";

        export default {
                components: {ElContainer},
                name: 'Classroom',
                data() {
                        return {
                                hoverId: 0,     //记录当前正在被鼠标滑过的id
                                edit: {
                                        isEdit: false,
                                        mode: true,
                                        model: { clsr_id: 0, clsr_name: '' },
                                        validationRules: {
                                                clsr_name: [
	                                                {
                                                                validator: (rule, value, callback) => {
                                                                        if(value === '')
                                                                                callback(new Error('教室名不能为空'));
                                                                        else if(value.length < 2 || value.length > 20)
                                                                                callback(new Error('教室名长度2 - 20'));
                                                                        else if(this.$store.state.classroom.list.some(item => item.clsr_id !== this.edit.model.clsr_id && item.clsr_name === value))
                                                                                callback(new Error('教室名已存在'));
	                                                                else
	                                                                        callback();
                                                                },
                                                                trigger: 'blur'
	                                                }
                                                ]
                                        }
                                }
                        }
                },
                created() { this.$store.dispatch('classroom/init');},
                methods: {
                        //删除
                        removeHandler: function(classroom){
                                this.$confirm(
                                        `确认要删除教室：“${classroom.clsr_name}” ? `,
                                        '警告',
                                        { showClose: false, type: 'warning' })
                                        .then(() => this.$store.dispatch('classroom/remove', classroom.clsr_id))  // 调用classroom子仓库中的actions几点中的remove方法
                                        .then(() => this.$message({ message: `教室： “${ classroom.clsr_name }” 删除成功！`, type: 'success'  }))
                                        .catch(() => {});
                        },
                        //开始新增
                        beginAdd() {
                                this.edit.model.clsr_id = 0;                     //新添加的初始id值先为0，后续改变了就
                                this.edit.model.clsr_name = '';                   //双向绑定 输入就有值 v-model

                                this.edit.mode = true;                  //标识添加
                                this.edit.isEdit = true;        //弹出显示
                        },
                        //开始修改
                        beginUpdate(classroom) {
                                this.edit.model.clsr_id = classroom.clsr_id;
                                this.edit.model.clsr_name = classroom.clsr_name;

                                this.edit.mode = false;         //修改状态
                                this.edit.isEdit = true;        //弹出显示
                        },
                        _saveWithAdd() {
                                this.$store.dispatch('classroom/add', this.edit.model)
	                                .then(() => {
                                                this.edit.isEdit = false;
                                                this.$message({
                                                        message: `教室："${ this.edit.model.clsr_name }" 添加成功！ `,
                                                        type:  "success"
                                                });
	                                });
                        },
                        _saveWithUpdate() {
                                this.$store.dispatch('classroom/update', this.edit.model)
                                        .then(() => {
                                                this.edit.isEdit = false;
                                                this.$message({
                                                        message: `教室："${ this.edit.model.clsr_name }" 修改成功！ `,
                                                        type:  "success"
                                                });
                                        });
                        },
                        save() {
                                this.$refs.editForm.validate(isValid => {
                                        if(isValid) {
                                                //新增
                                                if(this.edit.mode) this._saveWithAdd();
                                                //修改
                                                else this._saveWithUpdate();
                                        }
                                });
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
	.el-container { height: 100%; position: relative }
	.el-header>* { vertical-align: middle; }
	span.state {
		display: inline-block;
		width: 20px;
		height: 20px;
		margin-left: 20px;
	}
	.free { background-color: #67C23A;}
	.occupy { background-color: #E6A23C; }

	h2.dialog-title {
		background-color: #0094ff;
		text-indent: 2em;
		color: #fff;
		height: 40px;
		line-height: 40px;
		font-size: 18px;
	}

	.el-col { margin-bottom: 10px }
	.el-card {
		height: 120px;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
	}
	.el-card span {
		color: #fff;
		font-size: 20px;
	}

	.mask {
		position: absolute;
		left:0; top:0;
		width: 100%; height: 100%;
		background-color: rgba(0,0,0,0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.mask>i {
		font-size: 30px;
		color: #fff;
		margin: 0 10px;
		cursor: pointer;
	}

	.edit-enter, .edit-leave-to {
		opacity: 0;
	}
	.edit-enter-active, .edit.edit-leave-active {
		transition: all 1s ease-in 0.5s;
	}
</style>