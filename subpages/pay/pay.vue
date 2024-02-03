<template>
	<view class="pay">
		<view class="pay-top">
			<van-nav-bar 
			left-text="返回"
			left-arrow
			:safe-area-inset-top='false'
			@click-left='goback'>
			</van-nav-bar>
			<view class="position-show">
				<van-field
				    @blur='address'
					:value="cartList[0].address"
				    placeholder="请输入校内送货地址"
					required
					:readonly='!payFieldBtnShow'
					auto-focus
				  />
			</view>
		</view>
		<view class="pay-contant">
			<view class="pay-contant-window">
				<view class="pay-contant-window-storeName">
					<view class="icon-fuwuchaoshi iconfont pay_icon"></view>
					<text style="font-size: 50rpx;">{{obj.storeName}}</text>&nbsp;
					<text>订单编号:{{obj.cartId}}</text>
				</view>
				<van-card 
				class="pay-contant-window-card"
				v-for="(i,index) in cartList" 
				:key="index" 
				:price="i.sum_money" 
				:title="i.feeds.feed_name"
				:thumb="i.feeds.url">
					<view v-if="payFieldBtnShow" slot="footer" class="card-footer">
						<view @click='changeNum(-1,i)'>-</view>
						<view>{{i.num}}</view>
						<view @click='changeNum(1,i)'>+</view>
					</view>
					<view v-else slot="footer" class="card-footer">
						<view>x{{i.num}}</view>
					</view>
				</van-card>
			</view>
			<view class="notes">
				<van-field
					@input="notes"
					label="备注:"
					type="textarea"
					:value='cartList[0].content'
					placeholder="请输入50字以内备注"
					autosize
					:readonly='!payFieldBtnShow'
					:maxlength='50'
				  />
			</view>
			<view class="reward">
				<van-field
					label="跑腿酬金:"
					type="text"
					value='2元'
					readonly
				  />
			</view>
			<view class="stepping-stone"></view>
		</view>
		<view class="pay-bottom" v-if="payFieldBtnShow">
			<view>
				合计：<text style="color: #ff0000;"><text style="font-size: 30rpx;">￥</text>{{sum_money}}</text>
			</view>
			<van-button round type="info" color="linear-gradient(to right, #ff5500, #ff0000)" @click='changeCartIdState'>支付订单</van-button>
		</view>
		<view class="msg" v-show="msg_address">
			请输入送货地址
		</view>
	</view>
</template>

<script setup>
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import {
		ref,
		computed,
		watch
	} from 'vue';
	import {Store} from '@/stores/counter.js';
	import request from '@/request/index.js'
	// 从本地获取存储的 Cookie
	const storedCookie = uni.getStorageSync('sessionCookie');
	const store = Store()
	const obj = ref({})
	const payFieldBtnShow = ref(true)
	onLoad(async(option)=>{
		// 订单号和商铺id
		if('goodsStore' in option){
			obj.value=JSON.parse(decodeURIComponent(option.goodsStore));
			console.log(obj.value);
		}
		if('orderDetail' in option){
			obj.value=JSON.parse(decodeURIComponent(option.orderDetail));
			console.log(obj.value);
			payFieldBtnShow.value=false
		}
		console.log(payFieldBtnShow.value);
		// 初始化购物车商品列表
		giveCartGoods();
	})
	// 购物车商品列表
	const cartList =ref([])
	// 获取购物车商品列表
	const giveCartGoods =async()=>{
		// cartList.value=null
		await request({
			url:'userCart/my/list/page/vo',
			method:'POST',
			header: {
				'content-type': 'application/json',
				'Cookie': storedCookie
			},
			data:{
			  "cartId": obj.value.cartId,
			  "current": 1,
			  "id": 0,
			  "isDelete": 0,
			  "num": 0,
			  "pageSize": 10,
			  "schoolId": null||obj.value.schoolId,
			  "schoolStoreFeedId": 0,
			  "sortField": "",
			  "sortOrder": "",
			  "state": obj.value.state||0,
			  "sum_money": 0,
			  "userId": 0
			}
		}).then(value=>{
			cartList.value=value.data.data||null
			console.log('购物车列表',cartList.value);
		})
	}
	// 总计价格
	const sum_money =computed(()=>{
		let sum=0
		for (let i of cartList.value) {
			sum+=i.num*i.feeds.new_money
		}
		return sum+2
	})
	// 更新商品数量
	const changeNum = async(num1,i)=>{
		console.log(i);
		await cartList.value.forEach(item=>{
			if(item.schoolStoreFeedId===i.schoolStoreFeedId&&(item.num+num1)>0){
				item.num+=num1;
				request({
					url:'userCart/update/by/Cart/Id',
					method:'POST',
					data:{
						"cartId":obj.value.cartId,
						"num":item.num,
						"schoolId":obj.value.schoolId,
						"schoolStoreFeedId": parseInt(item.schoolStoreFeedId),
						"sum_money": (item.num*i.feeds.new_money),
						"userId": 0
					},
					header: {
						'content-type': 'application/json',
						'Cookie': storedCookie
					},
				}).then(value=>{
					console.log('修改购物车商品消息',value.data);
					giveCartGoods()
				})
			}
		})
	}
	// 配送地址
	const address_value = ref('')
	const address = (e)=>{
		address_value.value = e.detail.value.trim()
		if(address_value.value.length==0){
			msg_address.value=true
			setTimeout(()=>{
				msg_address.value=false
			},500)
		}
	}
	// 提示配送地址不为空开关
	const msg_address = ref(false)
	// 备注
	const notes_value = ref('')
	const notes = (e)=>{
		notes_value.value=e.detail.trim()
	}
	// 支付订单更改商品状态
	const changeCartIdState=async()=>{
		if(address_value.value.length>0){
			await request({
				url:'userCart/update/state/by/CartIdAndUserId',
				method:"POST",
				header: {
					'content-type': 'application/json',
					'Cookie': storedCookie
				},
				data:{
				  "cartId": obj.value.cartId,
				  "state": 1,
				  "address": address_value.value,
				  "content": notes_value.value
				}
			}).then(value=>{
				console.log('订单状态',value);
				if(value.data.code===0){
					uni.removeStorageSync(obj.value.schoolId.toString())
					uni.removeStorageSync(obj.value.storeName)
					setTimeout(()=>{
						uni.switchTab({
							url:'/pages/index/index'
						})
					},1500)
				}
			})
		}else{
			msg_address.value=true
			await setTimeout(()=>{
				msg_address.value=false
			},500)
		}
	}
	// 返回详情页
	const goback=()=>{
		uni.navigateBack()
	}
</script>

<style lang="scss">
	.pay{
		width: 100%;
		position: relative;
		.pay-top{
			margin-bottom: 40rpx;
			.position-show{
				width: 90%;
				margin:0 3%;
				padding: 15rpx;
				background-color: #e5e5e5;
			}
		}
		.pay-contant{
			margin: 20rpx;
			.pay-contant-window{
				border: 20rpx solid #aaff7f;
				border-top: 60rpx solid #aaff00;
				border-radius: 30rpx;
				position: relative;
				.pay-contant-window-storeName{
					position: absolute;
					top: -75rpx;
					display: flex;
					justify-content: flex-start;
					align-items: center;
					font-size: 30rpx;
					.pay_icon{
						color: #000;
						position: relative;
						top: -25rpx;
						font-size:90rpx;
						z-index: 1;
					}
				}
				.pay-contant-window-card{
					.card-footer{
						font-size: 30rpx;
						display: flex;
						justify-content: flex-end;
						align-items: center;
						
						text{
							padding: 10rpx;
							padding-top: 4rpx;
							background-color: #fff;
						}
						view{
							border: 1px solid #ccc;
							width: 50rpx;
							height: 50rpx;
							line-height: 50rpx;
							text-align: center;
							padding: 0 20rpx;
							background-color: #fff;
						}
					}
				}
				::v-deep .van-card{
					margin: 10rpx;
					border-radius: 30rpx;
					border: 5rpx solid #e5e5e5;
					margin-bottom: 5rpx;
				}
			}
			.stepping-stone{
				height: 150rpx;
			}
		}
		.pay-bottom{
			width: 100%;
			height: 160rpx;
			position: fixed;
			left: 0;
			bottom: 0;
			z-index: 2;
			background-color: #f0f0f0;
			display: flex;
			justify-content:space-around;
			align-items: center;
		}
	}

</style>
