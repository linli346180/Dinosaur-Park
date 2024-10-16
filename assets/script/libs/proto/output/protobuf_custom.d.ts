declare global {
// DO NOT EDIT! This is a generated file. Edit the JSDoc in src/*.js instead and run 'npm run types'.

/** Namespace proto. */
export namespace proto {

    /** Cmd enum. */
    enum Cmd {
        Push = 999,
        UserLogin = 1000
    }

    /** Properties of a UserLoginReq. */
    interface IUserLoginReq {

        /** UserLoginReq token */
        token: string;

        /** UserLoginReq serverId */
        serverId?: (number|null);

        /** UserLoginReq machineId */
        machineId?: (string|null);
    }

    /** Represents a UserLoginReq. */
    class UserLoginReq implements IUserLoginReq {

        /**
         * Constructs a new UserLoginReq.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IUserLoginReq);

        /** UserLoginReq token. */
        public token: string;

        /** UserLoginReq serverId. */
        public serverId: number;

        /** UserLoginReq machineId. */
        public machineId: string;

        /**
         * Encodes the specified UserLoginReq message. Does not implicitly {@link proto.UserLoginReq.verify|verify} messages.
         * @param m UserLoginReq message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IUserLoginReq, w?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a UserLoginReq message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns UserLoginReq
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: (protobuf.Reader|Uint8Array), l?: number): proto.UserLoginReq;
    }

    /** Properties of a UserLoginResp. */
    interface IUserLoginResp {

        /** UserLoginResp userId */
        userId?: (number|null);
    }

    /** Represents a UserLoginResp. */
    class UserLoginResp implements IUserLoginResp {

        /**
         * Constructs a new UserLoginResp.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IUserLoginResp);

        /** UserLoginResp userId. */
        public userId: number;

        /**
         * Encodes the specified UserLoginResp message. Does not implicitly {@link proto.UserLoginResp.verify|verify} messages.
         * @param m UserLoginResp message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IUserLoginResp, w?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a UserLoginResp message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns UserLoginResp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: (protobuf.Reader|Uint8Array), l?: number): proto.UserLoginResp;
    }
}
}
export {}