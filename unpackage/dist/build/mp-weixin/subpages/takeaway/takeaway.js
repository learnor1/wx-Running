"use strict";const e=require("../../common/vendor.js"),a=require("../../stores/counter.js"),l=require("../../request/index.js");if(!Array){(e.resolveComponent("van-field")+e.resolveComponent("van-button")+e.resolveComponent("van-cell-group")+e.resolveComponent("van-overlay"))()}const n={__name:"takeaway",setup(n){const o=a.Store(),t=e.index.getStorageSync("sessionCookie");let r={name:null,phone:null,code:null},u=e.ref(!0);const s=e=>{0!=e.detail.value.trim().length?(r.name=e.detail.value,u.value=!0):u.value=!1};var i=/^1[3456789]\d{9}$/;const d=e=>{i.test(e.detail.value)?(r.phone=e.detail.value,u.value=!0):u.value=!1},v=e=>{r.code=e.detail.value},p=e.ref(!1),c=e.ref(""),m=async()=>{u.value&&await l.request({url:"runningUser/add",method:"POST",header:{"content-type":"application/json",Cookie:t},data:{name:r.name,phone:r.phone,userId:o.userId,schoolId:1}}).then((a=>{0==a.data.code?(c.value="注册成功！",p.value=!0,setTimeout((()=>{p.value=!1,e.index.switchTab({url:"/pages/index/index"})}),1200)):(c.value="注册失败,请检查输入信息是否正确！",p.value=!0,setTimeout((()=>{p.value=!1}),800))}))};return(a,l)=>({a:e.o(s),b:e.p({placeholder:"请输入真实姓名",label:"姓名:",required:!0,maxlength:6}),c:e.o(d),d:e.p({label:"手机:",placeholder:"请输入手机号",required:!0,maxlength:11,type:"number"}),e:e.p({size:"small",type:"primary"}),f:e.o(v),g:e.p({center:!0,clearable:!0,label:"短信验证码",required:!0,placeholder:"请输入短信验证码",maxlength:6}),h:e.o(m),i:e.p({type:"primary",round:!0,size:"large"}),j:e.t(c.value),k:e.p({show:p.value})})}};wx.createPage(n);
