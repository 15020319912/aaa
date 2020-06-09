<template>
	<div class="wrapper">
		<div class="form-wrapper">
			<h2>民办清华管理系统 - v3.0</h2>
			<el-form ref="loginForm" :model="model" :rules="validateRules">
				<el-form-item prop="user_name">
					<el-input
						placeholder="用户名："
						prefix-icon="el-icon-user-solid"
						v-model.trim="model.user_name" >
					</el-input>
				</el-form-item>
				<el-form-item prop="user_pwd">
					<el-input type="password"
					          placeholder="密码："
					          prefix-icon="el-icon-lock"
					          v-model.trim="model.user_pwd" >
					</el-input>
				</el-form-item>
				<el-form-item>
					<el-button class="login" type="primary" @click="login">登录</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script type="text/ecmascript-6">
        export default {
                name: 'Login',
                data() {
                        return {
                                model: { user_name: '', user_pwd: '' },
                                validateRules:{
                                        user_name: [
                                                { required: true, message: '用户不能为空', trigger: 'blur' },
                                                { min: 2, max: 20, message: '用户名长度2 - 20', trigger: 'blur' }
                                        ],
                                        user_pwd: [
                                                { required: true, message: '密码不能为空', trigger: 'blur' },
                                                { min: 2, max: 20, message: '密码长度2 - 20', trigger: 'blur' }
                                        ]
                                }
                        };
                },
	        methods: {
                        login() {               // 登陆
                                this.$refs.loginForm.validate(valid => {
                                        if(valid) {
                                                this.$http({
                                                        url: '/user/login',
                                                        method: 'post',
                                                        data: this.model
                                                }).then(token => {              //登录后要做的事
                                                        //
                                                        sessionStorage.setItem('token', token);
                                                        //把前一个用户的名字放在prev_user中
                                                        sessionStorage.setItem('prev_user', sessionStorage.getItem('user') || '');
                                                        //把当前登录的用户放在user中
                                                        sessionStorage.setItem('user', this.model.user_name);
                                                        //控制路由跳到主页
                                                        this.$router.replace('/home');
                                                });
                                        }
                                });
                        }
	        },
	        created() { sessionStorage.removeItem('isExist401'); }
        };
</script>

<style scoped>
	.wrapper {
		background-image: url("../../assets/timg.jpg");
		background-size: 100% 100%;
		width: 100%;
		height: 100%;

	}

	.form-wrapper {
		position: absolute;
		top: 50%; left: 50%;
		transform: translate(-50%, -50%);
		width: 300px;
		height: 300px;
	}
	.form-wrapper>h2 {
		text-align: center;
		color: #fff;
		height: 50px;
		line-height: 50px;
		font-size: 20px;
	}
	.el-form { }
	.el-form-item {
		margin-bottom: 30px;
		text-align: center;
	}

	/deep/ .el-input__inner {
		background-color: rgba(0, 0, 0, 0.2);
		color: #fff;
	}
	.login {
		width: 100%;
	}
</style>