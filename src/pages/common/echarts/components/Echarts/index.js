import React, {Component} from 'react';
import {WebView, View, StyleSheet, Platform} from 'react-native';
import renderChart from './renderChart';

export default class App extends Component {
    constructor (props) {
        super(props);
        this.setNewOption = this.setNewOption.bind(this);
    }

    setNewOption (option) {
        this.refs.chart.postMessage(JSON.stringify(option));
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.option !== this.props.option) {
            this.refs.chart.reload();
        }
    }

    render () {
        return (
            <View style={{flex: 1, height: this.props.height || 400}}>
                <WebView
                    ref="chart"
                    startInLoadingState={true}
                    scrollEnabled={false}
                    javaScriptEnabled={true}
                    injectedJavaScript={renderChart(this.props)}
                    mixedContentMode="always"
                    decelerationRate="normal"
                    style={{
                        height: this.props.height || 400,
                        backgroundColor: this.props.backgroundColor || 'transparent',
                    }}
                    scalesPageToFit={Platform.OS === 'ios' ? false : true}
                    source={{
                        uri: 'https://img.daling.com/st/dalingjia/tmp/echarts-18-12-19.html',
                    }}
                    onMessage={event =>
                        this.props.onPress
                            ? this.props.onPress(JSON.parse(event.nativeEvent.data))
                            : null}
                />
            </View>
        );
    }
}
