
import {
    observable, extendObservable,
    action, useStrict, autorun,
    runInAction, toJS
} from 'mobx';
import request, { getToken, setHeader, getHeader } from './Request';
import { show as toast } from '../widgets/Toast';
import { User } from './Api';
import { getItem } from './Storage';

/**
 * 购物车列表
 */
class CartList {
    constructor() {
        //this.timer = null;
        this.preheatTime = 0
    }
    data = extendObservable(this, {
        dis_count: 0,
        goods_amount: "0",
        goods_count: 0,
        is_in_bond: 0,
        list: [],
        list_length: 0,
        total_count: 0,
        total_price: "0",
        total_reduce: "0",
        discountDesc: '', //优惠描述
        discount_amount: '', //优惠金额
        bestCoupon_list: [],
        coupon_list: [],
        area: {
            addressId: '',
            province: "", //省
            city: "", //市
            district: "", //区
            detail: "" //详细地址
        }
        //count: 0
    });
    count = () => this.data.list.length;
    /**
     * 初次加载是否完成
     */
    isLoaded = observable(false);
    init = action(async() => {
        this.isLoaded = false;
        await this.getDefaultArea();
        await this.update();
        ///this.getDefaultArea();
    });
    /**
     * 重设
     */
    reset() {
        runInAction(() => {
            this.data.total_count = 0;
            this.data.total_price = "0";
            this.data.total_reduce = "0";
            this.data.list = [];
            this.data.list_length = 0;
            this.isLoaded = true;
            this.data.goods_count = 0;
            this.data.list_length = 0;
            this.data.area = {};
            this.data.discountDesc = '';
            this.data.discount_amount = '';
            this.data.bestCoupon_list = [];
            this.data.coupon_list = [];
        })
    }
    /**
     * 选中,取消选中
     */
    select = action(async (id, status) => {
        this.data.list.map(item => {
            item.data.map(k => {
                if (k.id == id) {
                    k.select_status = status == 0 ? 1 : 0;
                }
                return k;
            });
        });
        //this.data.list.filter(item => item.id == id).map(item => item.select_status = status == 0 ? 1 : 0)
        try {
            let res = await request.get(`/api/cartnew/edit?gid=${id}&province=${this.data.area.province}&city=${this.data.area.city}&district=${this.data.area.district}&detail=${this.data.area.detail}&act=${status == 0 ? 'selectgroup' : 'unselectgroup'}`);
            this.setData(res);
        } catch (e) {
            toast(e.message);
        }
    });
    /**
     * 是否选中了所有
     */
    isSelectAll = observable(false);
    /**
     * 选中全部
     */
    selectGroup = action(async (data, status) => {
        //console.log(data, '-88hjhb')
        let ids = [];
        data.map(item => {
            if (item.id && item.preSaleYn == 'N') {
                item.select_status = status == 0 ? 1 : 0;
                ids.push(item.id);
                return item;
            }
        });
        ids = ids.join(',');
        try {
            let res = await request.get(`/api/cartnew/edit?gid=${ids}&province=${this.data.area.province}&city=${this.data.area.city}&district=${this.data.area.district}&detail=${this.data.area.detail}&act=${status == 0 ? 'selectgroup' : 'unselectgroup'}`);
            this.setData(res);
        } catch (e) {
            toast(e.message);
        }
    });
    selectAll = action(async () => {
        this.isSelectAll = !this.isSelectAll;
        let ids = [];
        this.data.list.map(item => {
            item.select_status = this.isSelectAll ? 1 : 0;
            item.data.map(k => {
                if (k.preSaleYn == 'N') {
                    k.select_status = this.isSelectAll ? 1 : 0;
                    if (k.id) {
                        ids.push(k.id);
                    }
                }
                return k;
            })
            
        });
        ids = ids.join(',');
        try {
            let res = await request.get(`/api/cartnew/edit?gid=${ids}&province=${this.data.area.province}&city=${this.data.area.city}&district=${this.data.area.district}&detail=${this.data.area.detail}&act=${this.isSelectAll ? 'selectgroup' : 'unselectgroup'}`);
            this.setData(res);
        } catch (e) {
            toast(e.message);
        }
    });
    /**
     * 数量减少
     */
    reduce = action(async (id, num) => {
        num = Number(num);
        num--;
        this.data.list.map(item => {
            item.data.filter(i => i.id == id).map(k => {
                k.quantity = num;
            })
        })
        /*this.data.list.filter(item => item.id == id).map(item => {
            item.quantity = num
        })*/
        try {
            let res = await request.get(`/api/cartnew/edit?gid=${id}&quantity=${num}&act=updnum&province=${this.data.area.province}&city=${this.data.area.city}&district=${this.data.area.district}&detail=${this.data.area.detail}`);
            this.setData(res);
        } catch (e) {
            toast(e.message);
        }
    });
    /**
     * 增加数量
     */
    plus = action(async (id, num, isBuyLimit, buyLimitNum, buyLimitMsg) => {
        num = Number(num);
        /*isBuyLimit=1
        buyLimitNum=2
        buyLimittMsg='aaa'
        console.log(id, num,isBuyLimit,buyLimitNum,buyLimittMsg)*/
        if (isBuyLimit == 1 && num >= buyLimitNum) {
            toast(`该商品为限购商品,${buyLimitMsg}`);
            return;
        }
        num++;
        this.data.list.map(item => {
            item.data.filter(i => i.id == id).map(k => {
                k.quantity = num;
            })
        })
        /*this.data.list.filter(item => item.id == id).map(item => {
            item.quantity = num
        })*/
        try {
            let res = await request.get(`/api/cartnew/edit?gid=${id}&quantity=${num}&act=updnum&province=${this.data.area.province}&city=${this.data.area.city}&district=${this.data.area.district}&detail=${this.data.area.detail}`);
            this.setData(res);
        } catch (e) {
            runInAction(() => {
                num--;
                this.data.list.map(item => {
                    item.data.filter(i => i.id == id).map(k => {
                        k.quantity = num;
                    })
                })
            });
            toast(e.message);
        }
    });
    /**
     * 直接设置数量
     */
    setNum = action((id, num) => {
        /*this.data.list.filter(item => item.id == id).map(item => {
            if (!item.old) item.old = item.quantity;
            item.quantity = num;
        })*/
    
        this.data.list.forEach(item => {
            item.data.filter(i => i.id == id).forEach(k => {
                if (!k.old) k.old = k.quantity;
                k.quantity = num;
            
            })
        })
    });
    /**
     * 改变数量
     */
    changeNum = action(async (id) => {
        let num = 0;
        let old = 0;
        this.data.list.forEach(item => {
            item.data.forEach(k => {
                if (k.id == id) {
                    num = k.quantity; old = k.old;
                }
                
            })
        })
        /*this.data.list.forEach(res => {
            if (res.id == id) {
                num = res.quantity; old = res.old;
            }
        });*/
        if (num == old) return;
        if (!num){
            /*this.data.list.filter(item => item.id == id).map(item => {
                item.quantity = item.old;
            });*/
    
            this.data.list.forEach(item => {
                item.data.filter(i => i.id == id).forEach(k => {
                    k.quantity = k.old;
            
                })
            })
            return;
        }
        try {
            let res = await request.get(`/api/cartnew/edit?gid=${id}&quantity=${num}&act=updnum&province=${this.data.area.province}&city=${this.data.area.city}&district=${this.data.area.district}&detail=${this.data.area.detail}`)
            this.setData(res);
        } catch (e) {
            runInAction(() => {
                this.data.list.forEach(item => {
                    item.data.filter(i => i.id == id).forEach(k => {
                        k.quantity = k.old;
            
                    })
                })
            });
            toast(e.message);
        }
    });
    /**
     * 删除单个商品
     * @param {*} id 
     */
    del(id) {
        for (let i = 0; i < this.data.list.length; i++) {
            if (this.data.list[i].id == id) {
                return this.data.list.splice(i, 1);
            }
        }
        /*if (this.data.list.length == 0) {
            this.stopTimer();
        }*/
    }
    /**
     * 删除部分商品
     */
    deleteGoods = action(async (ids) => {
        //for (let id of ids) this.del(id);
        try {
            let res = await request.get(`/api/cartnew/delete?gid=${ids.toString()}&province=${this.data.area.province}&city=${this.data.area.city}&district=${this.data.area.district}&detail=${this.data.area.detail}`);
            this.setData(res);
        } catch (e) {
            toast(e.message);
        }
    });
    /**
     * 删除所有
     */
    deleteAll = action(async () => {
        this.data.list.length = 0;
        //this.stopTimer();
        try {
            let res = await request.get(`/api/cartnew/deleteAll?province=${this.data.area.province}&city=${this.data.area.city}&district=${this.data.area.district}&detail=${this.data.area.detail}`);
            this.setData(res);
        } catch (e) {
            toast(e.message);
        }
    });
    /**
     * 添加到购物车
     */
    addCart = action(async (id, num) => {
        this.data.total_count += num * 1;
        this.data.goods_count += num * 1;
        try {
            let res = await request.get(`/api/cartnew/add?gid=${id}&quantity=${num}`);
            toast('加入购物车成功');
        } catch (e) {
            toast(e.message);
        }
        return this.data.total_count;
    });
    /**
     * 添加到购物车并抛出可能的错误
     */
    addCartNum = async (id, num, sku) => {
        this.data.total_count += num * 1;
        this.data.goods_count += num * 1;
        if (sku){
            let res = await request.get(`/api/cartnew/add?gid=${id}&quantity=${num}&sku=${sku}`);
            return res.total_count
        }
        let res = await request.get(`/api/cartnew/add?gid=${id}&quantity=${num}`);

        this.update()
        return res.total_count
    };
    /**
     * 
     */
    addCartAll = async (id, num) => {
        this.data.total_count += num * 1;
        this.data.goods_count += num;
        try {
            let res = await request.get(`/api/cartnew/add?gid=${id}&quantity=${num}`);
            toast('加入购物车成功');
            return res.total_count
        } catch (e) {
            toast(e.message);
        }
        return this.data.total_count;
    };

    addCartAll = async (id, num) => {
        this.data.total_count += num * 1;
        this.data.goods_count += num;
        try {
            let res = await request.get(`/api/cartnew/add?gid=${id}&quantity=${num}`);
            toast('加入购物车成功');
            return res.total_count;
        } catch (e) {
            toast(e.message);
        }
        return this.data.total_count;
    };
    async submit() {
        if (this.data.total_count == 0) return;
        let ids = [], nums = [];
        //let times = this.data.count;
        let preheatDiffTime = Date.now() - this.preheatTime;
        let num = 0;
        /*let list = this.data.list.filter(item => item.select_status == 1 && item.quantity > 0).forEach(item => {
            if (item.salesTimeDiff - preheatDiffTime > 0) {
                num++;
                return;
            }
            ids.push(item.id);
            nums.push(item.quantity);
        });*/
    
        this.data.list.forEach(item => {
            item.data.filter(i => i.select_status == 1 && i.can_select == 1).forEach(k => {
                if (k.salesTimeDiff - preheatDiffTime > 0) {
                    num++;
                    return;
                }
                ids.push(k.id);
                nums.push(k.quantity);
            })
        })
        
        let data = {
            prodIds: ids.toString(),
            prodQtys: nums.toString(),
            from: "cart",
            preheat: num,
            addressFrom: this.data.area
        }
        /*try {
            await post(`/saleOrderApp/prepareOrder.do?prodIds=${ids}&prodQtys=${nums}&from=cart`);
        } catch (e) {
            toast(e.message);
        }*/
        return data;
    }

    update = action(async () => {
        //this.stopTimer();
        if (!User.isLogin) {
            this.reset();
            return;
        }
        //await this.getDefaultArea();
        try {
            setHeader("apiversion", 2);
            let res = await request.get(`/api/cartnew/views?province=${this.data.area.province}&city=${this.data.area.city}&district=${this.data.area.district}&detail=${this.data.area.detail}`);
            
            //this.startTimer();
            this.setData(res);
            this.setPreheatTime(Date.now());
        } catch (e) {
            this.reset();
        }
    })
    /* startTimer() {
        this.timer = setInterval(() => {
            this.data.count += 1000;
        }, 1000)
    }
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.data.count = 0;
            this.timer = null;
        }
    }*/
    
    getSelectArea = action(async() => {
        let uid = getHeader('uid')
        let selectAddress = JSON.parse(await getItem(`selectAddress${uid}`)) || {}
        this.data.area = {
            province: selectAddress.province, //省
            city: selectAddress.city, //市
            district: selectAddress.district, //区
            detail: selectAddress.detail //详细地址
        };
        try {
            let res = await request.get(`/api/cartnew/views?province=${selectAddress.province || ''}&city=${selectAddress.city || ''}&district=${selectAddress.district || ''}&detail=${selectAddress.detail || ''}`);
            this.setData(res);
            this.setPreheatTime(Date.now());
        } catch (e) {
            this.reset();
        }
    });
    getDefaultArea = action(async() => {
        if (!User.isLogin) {
            this.reset();
            return;
        }
        let uid = getHeader('uid')
        let selectAddress = JSON.parse(await getItem(`selectAddress${uid}`))
        //console.log(1, Math.random(0, 1)*10)
        //console.log(selectAddress, '=========')
        if (selectAddress) {
            this.data.area = {
                province: selectAddress.province, //省
                city: selectAddress.city, //市
                district: selectAddress.district, //区
                detail: selectAddress.detail //详细地址
            };
            return;
        }
        try {
            let res = await request.get('/api/cartnew/distributionArea');
            runInAction(() => {
                this.data.area = res;
            })
        } catch (e) {
            toast(e.message);
        }
    })
    setPreheatTime(time) {
        this.preheatTime = time;
    }
    
    setData(res) {
        runInAction(() => {
            if (!res || !res.list) {
                this.isLoaded = true;
                this.data.list = [];
                this.data.list_length = 0;
                this.data.goods_count = 0;
                this.data.total_count = 0;
                this.data.discountDesc = '';
                this.data.discount_amount = '';
                this.data.bestCoupon_list = [];
                this.data.coupon_list = [];
                return;
            }
            let length = 0;
            this.isSelectAll = true;
            res.list.forEach(item => {
                let groups = []
                item.shipFeeGoods_list.forEach(kItem => {
                    if (kItem.activity_Type == 1) {
                        kItem.groupsGoods_list.forEach(t => {
                            t.activityType = 1
                        })
                        kItem.groupsGoods_list = [{
                            activity_Type: 1,
                            activity_TypeDesc: kItem.activity_TypeDesc,
                            bonusRules_Desc: kItem.bonusRules_Desc
                        }].concat(kItem.groupsGoods_list)
                    }
                    groups = groups.concat(kItem.groupsGoods_list)
                })
                item.goods_list = groups
                length += item.goods_list.length;
                item.goods_list.map((k, k_index) => {
                    if (k_index == item.goods_list.length - 1) {
                        k.last = true;
                    }
                    if (k.can_select == 0 || k.limitStock == 0) return k;
                    if (k.select_status && k.select_status == 0) {
                        this.isSelectAll = false;
                    }
                    return k;
                });
                item.data = item.goods_list
            })
            this.data.dis_count = res.dis_count;
            this.data.goods_amount = res.goods_amount;
            this.data.goods_count = res.goods_count;
            this.data.is_in_bond = res.is_in_bond
            this.data.total_count = res.total_count;
            this.data.total_price = res.total_price;
            this.data.total_reduce = res.total_reduce;
            this.data.discountDesc = res.discountDesc; //优惠描述
            this.data.discount_amount = res.discount_amount; //优惠金额
            this.data.bestCoupon_list = res.bestCoupon_list;
            this.data.coupon_list = res.coupon_list;
            this.isLoaded = true;
            this.data.list = res.list;
            this.data.list_length = length;
        });
    }
}

export default new CartList();