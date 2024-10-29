import { Logger } from "../Logger";
import { netConfig } from "../net/custom/NetConfig";
import { TGWebAppInitData } from "./TGDefine";

export namespace TGNetService {

    /** 登录TG账号 */
    export async function GetTelegramAPPData(): Promise<TGWebAppInitData> {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://telegram.org/js/telegram-web-app.js';
            script.onload = async () => {
                try {
                    const WebApp = (window as any).Telegram.WebApp;
                    const initData = JSON.stringify(WebApp.initDataUnsafe);

                    if (initData == null || initData == undefined || initData == '') {
                        Logger.logNet('Failed to get initDataUnsafe:', initData);
                        reject(initData);
                    }

                    const parsedData = JSON.parse(initData);
                    if (parsedData) {
                        const TGAppData = new TGWebAppInitData();
                        TGAppData.Auth_date = parsedData.auth_date;
                        TGAppData.Hash = parsedData.hash;
                        TGAppData.UserData = parsedData.user;
                        TGAppData.chat_type = parsedData.chat_type;
                        TGAppData.chat_instance = parsedData.chat_instance;

                        const userId: string = TGAppData.UserData.id.toString();
                        let fileId = await getUserProfilePhotos(userId);
                        let fileUrl = await getPhotoFile(fileId);
                        TGAppData.AvatarUrl = fileUrl;
                        resolve(TGAppData);
                    } else {
                        Logger.logNet('Failed to get initDataUnsafe:', initData);
                        reject(initData);
                    }
                } catch (error) {
                    Logger.logNet('Error during TG login:', error.toString());
                    reject(error);
                }
            };
            script.onerror = (error) => {
                Logger.logNet('Failed to load Telegram WebApp script:', error.toString());
                reject(error);
            };
            document.head.appendChild(script);
        });
    }

    /** 获取用户头像 */
    async function getUserProfilePhotos(userId: string) {
        const url = `https://api.telegram.org/bot${netConfig.BotToken}/getUserProfilePhotos?user_id=${userId}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.ok) {
                if (data.result.photos.length > 0) {
                    const photo = data.result.photos[0][0];
                    return photo.file_id;
                }
            } else {
                Logger.logNet('Failed to get user profile photos:', data.description);
                return '';
            }
        } catch (error) {
            Logger.logNet('Error:', error);
            return '';
        }
    }

    /** 获取头像下载链接 */
    async function getPhotoFile(fileId: string) {
        const url = `https://api.telegram.org/bot${netConfig.BotToken}/getFile?file_id=${fileId}`
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.ok) {
                const filePath = data.result.file_path;
                const fileUrl = `https://api.telegram.org/file/bot${netConfig.BotToken}/${filePath}`;
                console.warn('Photo File path:', fileUrl);
                return fileUrl;
            } else {
                Logger.logNet('Failed to get File:', data.description);
                return '';
            }
        } catch (error) {
            Logger.logNet('Error:', error.toString());
            return '';
        }
    }
}