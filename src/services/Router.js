/**
 * 路由操作
 */
import { TrackPage } from "../services/Track";

let routes = [];
let now = Date.now();
const allPage = 'ShopPage,Subject,ChannelPage,' +
    'InvitePage,GGModal,SearchPage,DetailPage,' +
    'ShoppingCartPage,ShoppingCartContentPage,' +
    'SubmitPage,PayFailResult,OrderDetailPage,' +
    'OrderListPage,GroupOn,GoldPage,CouponPage,' +
    'MarketPage,ProfilePage,MyBalancePage,GoodsCategoryPage,' +
    'SecondCategoryPage';

function track() {
    const from = routes[routes.length - 2];
    const to = routes[routes.length - 1];
    if (!from || !to) return;
    let curr = Date.now() - now;
    let from_name = from.name;
    let to_name = to.name;
    if (allPage.indexOf(from_name) < 0) {
        from_name = "Unknown";
    }
    if (allPage.indexOf(to_name) < 0) {
        to_name = "Unknown";
    }
    TrackPage(from_name, to_name, curr);
}

export default {
    push(from, to) {
        if (from.name === "HomePage") {
            return routes.push({ name: "ShopPage", key: "ShopPage" });
        }
        routes.push(to);
        track();
        now = Date.now();
    },
    pop() {
        routes.pop();
        now = Date.now();
    },
    flush(from, to) {
        if (to.name === "HomePage") {
            routes.push({ name: "ShopPage", key: "ShopPage" });
            track();
            return now = Date.now();
        }
        routes = [];
        if (from.name === "HomePage") {
            now = Date.now();
            return routes.push({ name: "ShopPage", key: "ShopPage" });
        }
    },
    current() {
        if (routes.length < 1) return "";
        return routes[routes.length - 1].name;
    },
    parent(){
        if (routes.length < 2) return "";
        return routes[routes.length - 2].name;
    }
}