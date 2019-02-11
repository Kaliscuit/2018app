import { getHeader } from "../services/Request"

let version = "";
/**
 * 版本工具
 */
export default {
    code_1: 0,
    code_2: 0,
    code_3: 0,
    /**
     * 获取当前版本号
     */
    get() {
        if (!version) version = getHeader("version");
        return version;
    },
    /**
     * 初始化当前版本号
     */
    check() {
        if (this.code_1 > 0) return;
        const version = this.get();
        const codes = version.split(".");
        this.code_1 = codes[0] * 1;
        this.code_2 = codes[1] * 1;
        this.code_3 = codes[2] * 1;
    },
    /**
     * 是否大于
     */
    gt(code) {
        this.check();
        code = code + "";
        let codes = code.split(".");
        if (!codes || codes.lenth === 0) return false;
        if (this.code_1 > codes[0] * 1) return true;
        if (this.code_2 > codes[1] * 1) return true;
        if (this.code_3 > codes[2] * 1) return true;
        return false;
    },
    /**
     * 是否小于
     */
    lt(code) {
        this.check();
        code = code + "";
        let codes = code.split(".");
        if (!codes || codes.lenth === 0) return false;
        if (this.code_1 < codes[0] * 1) return true;
        if (this.code_2 < codes[1] * 1) return true;
        if (this.code_3 < codes[2] * 1) return true;
        return false;
    }
}