
import {
    observable, extendObservable,
    action, useStrict, autorun,
    runInAction, toJS
} from 'mobx';
import request, { getToken, setHeader, getHeader } from './Request';
import { show as toast } from '../widgets/Toast';
import { User } from './Api';
import { getItem } from './Storage';

class Submit {
    
    data = extendObservable(this, {
        params: [],
        data: {},
        stunnerId: ''
    });
    
    prepareOrder = action(async (prodIds, prodQtys, from, goBack) => {
        try {
            //console.log('test')
            let res = await request.post(`/saleOrderApp/prepareOrder.do?prodIds=${prodIds}&prodQtys=${prodQtys}&from=${from}`);
            //this.setData(res);
            runInAction(() => {
                if (!res) {
                    return;
                }
                this.data.data = res;
            })
        } catch (e) {
            toast(e.message);
            goBack()
        }
    })

    setStunnerId = action((id) => {
        this.stunnerId = id;
    })
    count = () => this.data.list.length;
    /**
     * 初次加载是否完成
     */
    isLoaded = observable(false);
    init = action(() => {
        this.isLoaded = false;
        this.update();
        this.getDefaultArea();
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
            this.data.area = {}
        })
    }
    
}

export default new Submit();