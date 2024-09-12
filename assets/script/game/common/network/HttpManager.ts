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
    POST = "POST"
}

const HeaderName = 'Content-Type';
const HeaderValueText = 'application/text';
const HeaderValueJson = 'application/json';
const HeaderValuePb = 'application/x-protobuf';

/** 当前请求地址集合 */
var urls: Map<string, boolean> = new Map();

/** HTTP请求 */
export class HttpManager {
    /** 服务器地址 */
    server: string = "http://127.0.0.1/";
    /** 请求超时(毫秒) */
    timeout: number = 10000;
    /** 令牌 */
    token : string = "";

    /**
     * GET请求获取文本格式数据
     * @param name      协议名
     * @param params    请求参数据
     * @returns HTTP请求返回值
     */
    getText(name: string, params: BodyInit | null = null): Promise<HttpReturn<any>> {
        var headers = new Headers();
        headers.append(HeaderName, HeaderValueText);
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
        if(this.token != "") 
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
        if(this.token != "") 
            headers.append('token', this.token);
        return this.request(name, params, HttpMethod.POST, HttpResponseType.Json, headers);
    }

    /**
     * Protobuf请求处理
     * @param req       请求参数Protobuf数据对象名
     * @param res       相应数据Protobuf数据对象名
     * @param cmd       请求协议命令名
     * @param params    请求参参数对象
     * @returns HTTP请求返回值
     */
    // postProtobuf<T>(cmd: number, req: string, res: string, params?: any): Promise<HttpReturn<T>> {
    //     return new Promise(async (resolve, reject) => {
    //         var pc: any = proto;
    //         var pb: BodyInit | null;
    //         if (params) {
    //             pb = pc[req].encode(params).finish();
    //         }
    //         else {
    //             pb = null;
    //         }

    //         var headers = new Headers();
    //         headers.append(HeaderName, HeaderValuePb);

    //         var r = await this.request<T>(cmd.toString(), pb, HttpMethod.POST, HttpResponseType.ArrayBuffer, headers);
    //         if (r.isSucc) {
    //             var u8a = new Uint8Array(r.res as any);
    //             var decode = pc[res].decode(u8a);
    //             r.res = decode as T;
    //         }
    //         resolve(r);
    //     });
    // }

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

            var url = `${this.server}${name}`;
            var body: BodyInit | null = null;
            if (method == HttpMethod.GET) {
                if (params && typeof params === "object") {
                    var paramsStr = this.getParamString(params);
                    if (url.indexOf("?") > -1)
                        url = url + "&" + paramsStr;
                    else
                        url = url + "?" + paramsStr;
                }
            }
            else if (method == HttpMethod.POST) {
                body = params;
            }

            // 防止一个请求未成功时，连续请求
            urls.set(url, true);
            if (urls.has(url) == false) {
                var err = `地址【${url}】已正在请求中，不能重复请求`;
                console.warn(err);
                this.setReturn(url, resolve, false, err);
            }

            var ri: RequestInit = {
                /** 用于设置请求的方法的字符串(GET, POST, PUT, DELETE) */
                method: method,
                /** Headers对象、对象文字或两个项数组的数组来设置请求的标头。 */
                headers: headers,
                /** BodyInit对象或null以设置请求的正文 */
                body: params,
                /** 一个AbortSignal来设置请求的信号 */
                // signal: controller.signal,
                /** 一个字符串，指示请求将如何与浏览器的缓存交互以设置请求的缓存 */
                // cache: RequestCache,
                /** 一个字符串，指示凭据是与请求一起始终发送、从不发送还是仅在发送到同一源URL时发送。设置请求的凭据 */
                // credentials?: RequestCredentials,
                /** 要通过请求获取的资源的加密哈希。设置请求的完整性 */
                // integrity: string,
                /** 用于设置请求保持活动的布尔值 */
                // keepalive: boolean,
                /** 一个字符串，用于指示请求将使用CORS，还是将被限制为相同来源的URL。设置请求的模式 */
                // mode: RequestMode,
                /** 一个字符串，指示请求是否遵循重定向、在遇到重定向时导致错误或返回重定向（以不透明的方式）。设置请求的重定向 */
                // redirect: RequestRedirect,
                /** 一个字符串，其值为相同的原始URL“about:client”或空字符串，用于设置请求的引用者 */
                // referrer: string,
                /** 用于设置请求的referrerPolicy的referrer策略 */
                // referrerPolicy: ReferrerPolicy,
                /** 只能为null。用于解除请求与任何窗口的关联 */
                // window: null
            }
            fetch(url, ri).then((response: Response): any => {
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
                    this.setReturn(url, resolve, false, response);
                }
            }).then((value: any) => {
                this.setReturn<T>(url, resolve, true, value);
            }).catch((reason: any) => {
                this.setReturn<T>(url, resolve, false, reason);
            });
            
        });
    }

    /** 返回请求结果 */
    private setReturn<T>(url: string, resolve: any, isSucc: boolean, value: any) {
        var ret = new HttpReturn<T>();
        ret.isSucc = isSucc;
        if (isSucc) {
            ret.res = value;
        }
        else {
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