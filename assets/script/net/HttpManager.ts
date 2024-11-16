import { oops } from "../../../extensions/oops-plugin-framework/assets/core/Oops";
import { GameEvent } from "../game/common/config/GameEvent";
import { NetErrorCode } from "./custom/NetErrorCode";

/** HTTP请求返回值 */
export class HttpReturn<T> {
    /** 是否请求成功 */
    isSucc: boolean = false;
    /** 请求返回数据 */
    res?: T;
    /** 请求错误数据 */
    err?: Response;
}

/** 请求后相应返回数据类型 */
export enum HttpResponseType {
    Text,
    Json,
    ArrayBuffer,
    Blob,
    FormData
}

/** 请求方法 */
export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT"
}

const HeaderName = 'Content-Type';
const HeaderValueText = 'application/text';
const HeaderValueJson = 'application/json';
const HeaderValuePb = 'application/x-protobuf';
const HeaderValueURL = "application/x-www-form-urlencoded"

const HeaderLanguage = 'accept-language';

/** 当前请求地址集合 */
var urls: Map<string, boolean> = new Map();

/** HTTP请求 */
export class HttpManager {
    /** 服务器地址 */
    server: string = "http://127.0.0.1/";
    /** 请求超时(毫秒) */
    timeout: number = 10000;
    /** 令牌 */
    token: string = "";

    url: string = "";

    /**
    * Post请求获取文本格式数据
    * @param name      协议名
    * @param params    请求参数据
    * @returns HTTP请求返回值
     */
    postUrl(name: string, params: BodyInit | null = null): Promise<HttpReturn<any>> {
        var headers = new Headers();
        headers.append(HeaderName, HeaderValueURL);
        headers.append(HeaderLanguage, oops.language.current);
        return this.request(name, params, HttpMethod.POST, HttpResponseType.Json, headers);
    }

    putUrl(name: string, params: BodyInit | null = null): Promise<HttpReturn<any>> {
        var headers = new Headers();
        headers.append(HeaderName, HeaderValueURL);
        headers.append(HeaderLanguage, oops.language.current);
        return this.request(name, params, HttpMethod.PUT, HttpResponseType.Json, headers);
    }

    postUrlNoHead(name: string, params: BodyInit | null = null): Promise<HttpReturn<any>> {
        var headers = new Headers();
        headers.append(HeaderLanguage, oops.language.current);
        return this.request(name, params, HttpMethod.POST, HttpResponseType.Json, headers);
    }

    /**
    * Get请求获取文本格式数据
    * @param name      协议名
    * @param params    请求参数据
    * @returns HTTP请求返回值
     */
    getUrl(name: string, params: BodyInit | null = null): Promise<HttpReturn<any>> {
        var headers = new Headers();
        headers.append(HeaderLanguage, oops.language.current);
        return this.urlRequest(name, params, HttpResponseType.Json, headers);
    }

    /**
     * GET请求获取文本格式数据
     * @param name      协议名
     * @param params    请求参数据
     * @returns HTTP请求返回值
     */
    getText(name: string, params: BodyInit | null = null): Promise<HttpReturn<any>> {
        var headers = new Headers();
        headers.append(HeaderName, HeaderValueText);
        headers.append(HeaderLanguage, oops.language.current);
        return this.request(name, params, HttpMethod.GET, HttpResponseType.Text, headers);
    }

    /**
     * GET请求获取Json格式数据
     * @param name      协议名
     * @param params    请求参数据
     * @returns HTTP请求返回值
     */
    getJson(name: string, params: BodyInit | null = null): Promise<HttpReturn<any>> {
        var headers = new Headers();
        headers.append(HeaderName, HeaderValueJson);
        headers.append(HeaderLanguage, oops.language.current);
        if (this.token != "")
            headers.append('token', this.token);
        return this.request(name, params, HttpMethod.GET, HttpResponseType.Json, headers);
    }

    /**
     * POST请求获取Json格式数据
     * @param name      协议名
     * @param params    请求参数据
     * @returns HTTP请求返回值
     */
    postJson(name: string, params: BodyInit | null = null): Promise<HttpReturn<any>> {
        var headers = new Headers();
        headers.append(HeaderName, HeaderValueJson);
        headers.append(HeaderLanguage, oops.language.current);

        if (this.token != "")
            headers.append('token', this.token);
        return this.request(name, params, HttpMethod.POST, HttpResponseType.Json, headers);
    }


    /**
     * 请求服务器数据
     * @param name      协议名
     * @param params    协议参数
     * @param method    请求方式
     * @param type      请求数据结果
     * @param headers   请求头信息
     * @returns HTTP请求返回值
     */
    request<T>(name: string, params: BodyInit | null = null, method: string, type: HttpResponseType, headers: HeadersInit): Promise<HttpReturn<T>> {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            this.url = `${this.server}${name}`;
            var body: BodyInit | null = null;
            if (method == HttpMethod.GET) {
                if (params && typeof params === "object") {
                    var paramsStr = this.getParamString(params);
                    if (this.url.indexOf("?") > -1)
                        this.url = this.url + "&" + paramsStr;
                    else
                        this.url = this.url + "?" + paramsStr;
                }
            }
            else if (method == HttpMethod.POST) {
                body = params;
            }
            body = params;
            urls.set(this.url, true);
            if (urls.has(this.url) == false) {
                var err = `地址【${this.url}】已正在请求中，不能重复请求`;
                console.warn(err);
                this.setReturn(this.url, resolve, false, err);
            }

            var ri: RequestInit = {
                method: method,
                headers: headers,
                body: params,
                mode: 'cors',  // 强制 CORS 模式
            }

            // console.log("请求参数：" + ri);
            fetch(this.url, ri).then((response: Response): any => {
                clearTimeout(timeoutId);
                if (response.ok) {
                    switch (type) {
                        case HttpResponseType.Text:
                            return response.text();
                        case HttpResponseType.Json:
                            return response.json();
                        case HttpResponseType.ArrayBuffer:
                            return response.arrayBuffer();
                        case HttpResponseType.Blob:
                            return response.text();
                        case HttpResponseType.FormData:
                            return response.formData();
                    }
                }
                else {
                    this.setReturn(this.url, resolve, false, response);
                }
            }).then((value: any) => {
                this.setReturn<T>(this.url, resolve, true, value);
            }).catch((reason: any) => {
                this.setReturn<T>(this.url, resolve, false, reason);
            });

        });
    }


    /**
     * 请求服务器数据
     * @param name      协议名
     * @param params    协议参数
     * @param method    请求方式
     * @param type      请求数据结果
     * @param headers   请求头信息
     * @returns HTTP请求返回值
     */
    urlRequest<T>(name: string, params: BodyInit | null = null, type: HttpResponseType, headers: HeadersInit): Promise<HttpReturn<T>> {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            this.url = `${this.server}${name}`;

            urls.set(this.url, true);
            if (urls.has(this.url) == false) {
                var err = `地址【${this.url}】已正在请求中，不能重复请求`;
                console.warn(err);
                this.setReturn(this.url, resolve, false, err);
            }

            var ri: RequestInit = {
                method: 'GET',
            }
            fetch(this.url, ri).then((response: Response): any => {
                clearTimeout(timeoutId);
                if (response.ok) {
                    switch (type) {
                        case HttpResponseType.Text:
                            return response.text();
                        case HttpResponseType.Json:
                            return response.json();
                        case HttpResponseType.ArrayBuffer:
                            return response.arrayBuffer();
                        case HttpResponseType.Blob:
                            return response.text();
                        case HttpResponseType.FormData:
                            return response.formData();
                    }
                }
                else {
                    this.setReturn(this.url, resolve, false, response);
                }
            }).then((value: any) => {
                this.setReturn<T>(this.url, resolve, true, value);
            }).catch((reason: any) => {
                this.setReturn<T>(this.url, resolve, false, reason);
            });

        });
    }

    /** 返回请求结果 */
    private setReturn<T>(url: string, resolve: any, isSucc: boolean, value: any) {
        var ret = new HttpReturn<T>();
        ret.isSucc = isSucc;
        if (isSucc) {
            ret.res = value;
            if (value.resultCode != null && value.resultCode != NetErrorCode.Success) {
                oops.message.dispatchEvent(GameEvent.WebRequestFail, value.resultMsg);
            }
        }
        else {
            oops.message.dispatchEvent(GameEvent.WebRequestFail, oops.language.getLangByID("net_tips_fetch_fail"));
            ret.err = value;
        }
        urls.delete(url);
        resolve(ret);
    }

    /**
    * 获得字符串形式的参数
    * @param params 参数对象
    * @returns 参数字符串
    */
    private getParamString(params: any) {
        var result = "";
        for (var name in params) {
            let data = params[name];
            if (data instanceof Object) {
                for (var key in data)
                    result += `${key}=${data[key]}&`;
            }
            else {
                result += `${name}=${data}&`;
            }
        }
        return result.substring(0, result.length - 1);
    }
}