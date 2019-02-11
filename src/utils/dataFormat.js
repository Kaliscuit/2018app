
export const dataFormat = (date, format = 'YYYY-MM-DD') => {
    const isDate = Object.prototype.toString.call(date) === '[object Date]'
    const isNumber = typeof date === 'number'

    if (!isDate && !isNumber) return ''

    if (isNumber) date = new Date(date)

    if (!date) return ''

    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let hour = date.getHours()
    let min = date.getMinutes()
    let sec = date.getSeconds()

    let preArr = Array.apply(null, Array(10)).map((elem, index) => {
        return '0' + index
    })

    let newTime = format.replace(/YYYY/g, year).replace(/MM/g, preArr[month] || month).replace(/DD/g, preArr[day] || day).replace(/hh/g, preArr[hour] || hour).replace(/mm/g, preArr[min] || min).replace(/ss/g, preArr[sec] || sec)

    return newTime
}

export const milliseconds = (date, format = 'YYYY-MM-DD') => {

    if (typeof date === 'string') {
        const connection = format.charAt(4)

        const replacement = date.replace(new RegExp(connection, 'gm'), '/')
        return (new Date(replacement)).getTime()
    }

    if (Object.prototype.toString.call(date) === '[object Date]') {
        return date.getTime()
    }

    return 0
}

