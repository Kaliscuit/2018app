import tools from "./tools"

/**
 * @method digitalUnit
 * @param { Number } k 转化精度
 * @param { Array } scope 转化后的单位
 * @param { Number | String } value 需要转化的数字
 * @param { Number } digits 转化后保留的位数
 * @returns { Function } 转化函数
 * @desc (高阶函数) 转化数字，并赋单位
 */
export const digitalUnit = (k = 100, scope) => {
    let price = ['', '十', '百', '千', '万', '十万', '百万', '千万', '亿', '百亿', '千亿', '兆']

    return (value, digits = 0, unit = '', demand = false) => {

        let index = 0
        const precision = digits ? Math.pow(10, digits) : 1
        let negative = ''

        value = parseFloat(value)

        if (isNaN(value)) return { num: '--', unit: '' }

        if (value === 0) {
            return {
                num: demand ? value : value.toFixed(digits),
                unit
            }
        }

        if (value < 0) {
            negative = '-'
            value = Math.abs(value)
        }
        if (value < 1) {
            value = value + '';
            while (value.length < 4) {
                value = value + "0";
            }
            return {
                num: value,
                unit
            }
        }
        const business = value / k

        if (business <= 1 && demand) {
            return {
                num: value,
                unit
            }
        }

        if (Array.isArray(scope)) price = scope

        index = Math.floor(Math.log(value) / Math.log(k))

        const num = Math.floor(Math.round(value * precision) / Math.pow(k, index)) / precision

        return {
            num: negative + num.toFixed(digits),
            unit: (price[index] || '') + unit
        }
    }
}