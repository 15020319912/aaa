import Class from './Class';
import Classroom from './Classroom';
import Func from './Func';
import PwdChange from './PwdChange';
import Role from './Role';
import RoleFunc from './RoleFunc';
import Staff from './Staff';
import User from './User';
import Student from './Student';

//其实导出的是当前后台管理西铜所有功能组件的地图
export default  {
        Class: {
                component: Class,
                remark: '这个组件可以进行班级管理'
        },
        Classroom: {
                component: Classroom,
                remark: '这个组件可以进行教室管理'
        },
        Func: {
                component: Func,
                remark: '这个组件可以对系统的功能进行管理'
        },
        PwdChange: {
                component: PwdChange,
                remark: '这个组件可以对当前登录用户的密码进行自定义修改'
        },
        Role: {
                component: Role,
                remark: '这个组件可以对系统的角色进行维护'
        },
        RoleFunc: {
                component: RoleFunc,
                remark: '这个组件可以对系统的角色所具有的对应的功能进行指定'
        },
        Staff: {
                component: Staff,
                remark: '这个组件可以对员工信息进行维护'
        },
        User: {
                component: User,
                remark: '这个组件可以对系统用户进行管理'
        },
        Student: {
                component: Student,
                remark: '这个组件可以对学生进行管理'
        }
}

