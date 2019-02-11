    package com.dalingjia.shop.model.Response;
    import java.util.List;

    /**
 * 版本升级
 */

public class ImageResponse extends BaseResponse<ImageResponse> {
    public List<Item> items; // 新配签名

        public class Item{
            public String image;
        }
}
