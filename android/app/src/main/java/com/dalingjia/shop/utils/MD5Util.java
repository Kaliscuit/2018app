package com.dalingjia.shop.utils;

import java.security.MessageDigest;
import java.io.FileInputStream;
import java.io.InputStream;
import java.security.NoSuchAlgorithmException;

/**
 * Created by daling on 2017/8/31.
 */

public class MD5Util {
    private static final char HEX_DIGITS[] = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'A', 'B', 'C', 'D', 'E', 'F'};

    public static String toHexString(byte[] b) {
        StringBuilder sb = new StringBuilder(b.length * 2);
        for (int i = 0; i < b.length; i++) {
            sb.append(HEX_DIGITS[(b[i] & 0xf0) >>> 4]);
            sb.append(HEX_DIGITS[b[i] & 0x0f]);
        }
        return sb.toString();
    }

    public static String md5sum(String filename) {
        InputStream fis;
        byte[] buffer = new byte[1024];
        int numRead = 0;
        MessageDigest md5;
        try {
            fis = new FileInputStream(filename);
            md5 = MessageDigest.getInstance("MD5");
            while ((numRead = fis.read(buffer)) > 0) {
                md5.update(buffer, 0, numRead);
            }
            fis.close();
            return toHexString(md5.digest());
        } catch (Exception e) {
            System.out.println("error");
            return null;
        }
    }

    /**
     * 通过MD5算法加密；
     *
     * @param pwd
     */
    public static String encoder(String pwd) {
        try {

            //1指定算法类型；
            MessageDigest digest = MessageDigest.getInstance("MD5");
            //2将需要加密的字符串转换成byte数组；
            byte[] bs = digest.digest(pwd.getBytes());
            //3通过遍历bs 生成32位的字符串；

            //最后字符串有个拼接的过程；
            StringBuffer sb = new StringBuffer();
            for (byte b : bs) {
                int i = b & 0xff; //int 类型的i 是4个字节占32位；
                //int 类型的i转换成16进制字符；
                String hexString = Integer.toHexString(i);
                if (hexString.length() < 2) {//补零的过程，因为生成的时候有的是一位有的是两位所以需要有个补零的过程；
                    hexString = "0" + hexString;
                }
                sb.append(hexString);
            }

            return sb.toString();

        } catch (NoSuchAlgorithmException e) {//找不到指定算法的错误；
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        return "";
    }
}
