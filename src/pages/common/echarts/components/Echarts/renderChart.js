import toString from '../../util/toString';

export default function renderChart(props) {
    let options = props.option
    options.height = `${props.height || 400}px`;
    options.width = props.width ? `${props.width}px` : 'auto';

    return `window.histogram(${JSON.stringify(options)})`
}
