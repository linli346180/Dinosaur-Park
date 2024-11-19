 
export namespace CryptoDefine { 

    // 用于验证签名的函数
    export async function verifySignature(publicKeyPem: string, data: string, signature: string): Promise<boolean> {
        const publicKey = await importRsaPublicKey(publicKeyPem);
        const dataHash = await hashData(data);
        const signatureBuffer = base64ToArrayBuffer(signature);

        console.log(`dataHash: ${dataHash} signatureBuffer: ${signatureBuffer}`);

        // 使用 Web Crypto API 进行验证
        return crypto.subtle.verify(
            { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } },
            publicKey,
            signatureBuffer,
            dataHash
        );
    }

    // 导入公钥的函数
    export async function importRsaPublicKey(pem: string): Promise<CryptoKey> {
        const binaryDer = pemToBinary(pem);
        return crypto.subtle.importKey(
            "spki",               // 使用 SPKI 格式
            binaryDer,            // 公钥二进制数据
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            true,                 // 公钥可用于验证
            ["verify"]            // 用途：验证签名
        );
    }

    // PEM 公钥转为二进制格式
    export function pemToBinary(pem: string): ArrayBuffer {
        const encoded = pem.replace(/(-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s)/g, "");
        const binaryString = atob(encoded);
        const binaryLen = binaryString.length;
        const bytes = new Uint8Array(binaryLen);
        for (let i = 0; i < binaryLen; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // Base64 转 ArrayBuffer
    export function base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = atob(base64);
        const length = binaryString.length;
        const arrayBuffer = new ArrayBuffer(length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < length; i++) {
            view[i] = binaryString.charCodeAt(i);
        }
        return arrayBuffer;
    }

    // 计算数据的 SHA-256 哈希值
    async function hashData(data: string): Promise<ArrayBuffer> {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        return crypto.subtle.digest("SHA-256", dataBuffer);
    }
}
