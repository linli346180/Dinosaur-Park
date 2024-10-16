// Common aliases
var $Reader = protobuf.Reader, $Writer = protobuf.Writer, $util = protobuf.util;

// Exported root namespace
var $root = protobuf.roots.creator || (protobuf.roots.creator = $util.global);

$root.proto = (function() {

    /**
     * Namespace proto.
     * @exports proto
     * @namespace
     */
    var proto = {};

    /**
     * Cmd enum.
     * @name proto.Cmd
     * @enum {number}
     * @property {number} Push=999 Push value
     * @property {number} UserLogin=1000 UserLogin value
     */
    proto.Cmd = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[999] = "Push"] = 999;
        values[valuesById[1000] = "UserLogin"] = 1000;
        return values;
    })();

    proto.UserLoginReq = (function() {

        /**
         * Properties of a UserLoginReq.
         * @memberof proto
         * @interface IUserLoginReq
         * @property {string} token UserLoginReq token
         * @property {number|null} [serverId] UserLoginReq serverId
         * @property {string|null} [machineId] UserLoginReq machineId
         */

        /**
         * Constructs a new UserLoginReq.
         * @memberof proto
         * @classdesc Represents a UserLoginReq.
         * @implements IUserLoginReq
         * @constructor
         * @param {proto.IUserLoginReq=} [p] Properties to set
         */
        function UserLoginReq(p) {
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        /**
         * UserLoginReq token.
         * @member {string} token
         * @memberof proto.UserLoginReq
         * @instance
         */
        UserLoginReq.prototype.token = "";

        /**
         * UserLoginReq serverId.
         * @member {number} serverId
         * @memberof proto.UserLoginReq
         * @instance
         */
        UserLoginReq.prototype.serverId = 0;

        /**
         * UserLoginReq machineId.
         * @member {string} machineId
         * @memberof proto.UserLoginReq
         * @instance
         */
        UserLoginReq.prototype.machineId = "";

        /**
         * Encodes the specified UserLoginReq message. Does not implicitly {@link proto.UserLoginReq.verify|verify} messages.
         * @function encode
         * @memberof proto.UserLoginReq
         * @static
         * @param {proto.IUserLoginReq} m UserLoginReq message or plain object to encode
         * @param {protobuf.Writer} [w] Writer to encode to
         * @returns {protobuf.Writer} Writer
         */
        UserLoginReq.encode = function encode(m, w) {
            if (!w)
                w = $Writer.create();
            w.uint32(10).string(m.token);
            if (m.serverId != null && Object.hasOwnProperty.call(m, "serverId"))
                w.uint32(16).int32(m.serverId);
            if (m.machineId != null && Object.hasOwnProperty.call(m, "machineId"))
                w.uint32(26).string(m.machineId);
            return w;
        };

        /**
         * Decodes a UserLoginReq message from the specified reader or buffer.
         * @function decode
         * @memberof proto.UserLoginReq
         * @static
         * @param {protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {proto.UserLoginReq} UserLoginReq
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        UserLoginReq.decode = function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.proto.UserLoginReq();
            while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                case 1:
                    m.token = r.string();
                    break;
                case 2:
                    m.serverId = r.int32();
                    break;
                case 3:
                    m.machineId = r.string();
                    break;
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            if (!m.hasOwnProperty("token"))
                throw $util.ProtocolError("missing required 'token'", { instance: m });
            return m;
        };

        return UserLoginReq;
    })();

    proto.UserLoginResp = (function() {

        /**
         * Properties of a UserLoginResp.
         * @memberof proto
         * @interface IUserLoginResp
         * @property {number|null} [userId] UserLoginResp userId
         */

        /**
         * Constructs a new UserLoginResp.
         * @memberof proto
         * @classdesc Represents a UserLoginResp.
         * @implements IUserLoginResp
         * @constructor
         * @param {proto.IUserLoginResp=} [p] Properties to set
         */
        function UserLoginResp(p) {
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        /**
         * UserLoginResp userId.
         * @member {number} userId
         * @memberof proto.UserLoginResp
         * @instance
         */
        UserLoginResp.prototype.userId = 0;

        /**
         * Encodes the specified UserLoginResp message. Does not implicitly {@link proto.UserLoginResp.verify|verify} messages.
         * @function encode
         * @memberof proto.UserLoginResp
         * @static
         * @param {proto.IUserLoginResp} m UserLoginResp message or plain object to encode
         * @param {protobuf.Writer} [w] Writer to encode to
         * @returns {protobuf.Writer} Writer
         */
        UserLoginResp.encode = function encode(m, w) {
            if (!w)
                w = $Writer.create();
            if (m.userId != null && Object.hasOwnProperty.call(m, "userId"))
                w.uint32(8).int32(m.userId);
            return w;
        };

        /**
         * Decodes a UserLoginResp message from the specified reader or buffer.
         * @function decode
         * @memberof proto.UserLoginResp
         * @static
         * @param {protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {proto.UserLoginResp} UserLoginResp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        UserLoginResp.decode = function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.proto.UserLoginResp();
            while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                case 1:
                    m.userId = r.int32();
                    break;
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        return UserLoginResp;
    })();

    return proto;
})();