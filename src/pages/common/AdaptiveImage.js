/**
 * @ClassName: AdaptiveImage 
 * @Desc:      AdaptiveImage
 * @Author:    luhua 
 * @Date:      2018-04-10 18:38:56 
 */

import React from 'react';
import {
    Image,
    PixelRatio
} from 'react-native';

import PropTypes from 'prop-types';
import cloneReferencedElement from '../../utils/cloneReferencedElement';
import { logErr } from '../../utils/logs';


export default class AdaptiveImage extends React.Component {

    static propTypes = {
        ...Image.propTypes,
        source: PropTypes.shape({
            uri: PropTypes.string,
        }),
        sources: PropTypes.objectOf(Image.propTypes.source),
        preferredPixelRatio: PropTypes.number,
        renderImageElement: PropTypes.func,
    };

    static defaultProps = {
        preferredPixelRatio: PixelRatio.get(),
    };

    /**
     * 获得最接近的高质量来源
     * @param sources
     * @param preferredPixelRatio
     * @returns {*}
     */
    static getClosestHighQualitySource(sources, preferredPixelRatio) {
        let pixelRatios = Object.keys(sources);
        if (!pixelRatios.length) {
            return null;
        }

        pixelRatios.sort((ratioA, ratioB) =>
            parseFloat(ratioA) - parseFloat(ratioB)
        );
        for (let k = 0; k < pixelRatios.length; k++) {
            if (pixelRatios[k] >= preferredPixelRatio) {
                return sources[pixelRatios[k]];
            }
        }

        let largestPixelRatio = pixelRatios[pixelRatios.length - 1];
        return sources[largestPixelRatio];
    }

    /**
     * 设置 native props
     * @param nativeProps
     */
    setNativeProps(nativeProps) {
        this._image.setNativeProps(nativeProps);
    }

    render() {
        let {
            source,
            sources,
            preferredPixelRatio,
            renderImageElement,
            ...props
        } = this.props;
        let optimalSource = AdaptiveImage.getClosestHighQualitySource(
            sources,
            preferredPixelRatio,
        );
        if (optimalSource) {
            source = optimalSource;
        }
        if (!source) {
            logErr(`找不到合适的图像源`);
            throw new Error(`找不到合适的图像源`);
        }
        if (renderImageElement) {
            let image = renderImageElement({ ...props, source });
            return cloneReferencedElement(image, {
                ref: component => { this._image = component; },
            });
        }

        return (
            <Image
                {...props}
                ref={component => { this._image = component; }}
                source={source}
            />
        );
    }
}