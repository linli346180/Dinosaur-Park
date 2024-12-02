// 自定义按键
export enum KeyBoardCode {
    NONE,
    KEY_A,
    KEY_B,
    KEY_C,
    KEY_D,
    KEY_E,
    KEY_F,
    KEY_G,
    KEY_H,
    KEY_I,
    KEY_J,
    KEY_K,
    KEY_L,
    KEY_M,
    KEY_N,
    KEY_O,
    KEY_P,
    KEY_Q,
    KEY_R,
    KEY_S,
    KEY_T,
    KEY_U,
    KEY_V,
    KEY_W,
    KEY_X,
    KEY_Y,
    KEY_Z,
    NUM_0,
    NUM_1,
    NUM_2,
    NUM_3,
    NUM_4,
    NUM_5,
    NUM_6,
    NUM_7,
    NUM_8,
    NUM_9,
    NUM_DECIMAL,
    DELETE,
    Caps,
    Shift,
    Enter,
    KEY_GRAVE,
    KEY_TILDE,
    KEY_EXCLAMATION,
    KEY_AT,
    KEY_HASH,
    KEY_DOLLAR,
    KEY_PERCENT,
    KEY_CARET,
    KEY_AMPERSAND,
    KEY_ASTERISK,
    KEY_LEFT_PARENTHESIS,
    KEY_RIGHT_PARENTHESIS,
    KEY_MINUS,
    KEY_PLUS,
    KEY_LEFT_BRACE,
    KEY_RIGHT_BRACE,
    KEY_LEFT_BRACKET,
    KEY_RIGHT_BRACKET,
    KEY_PIPE,
    KEY_COLON,
    KEY_SEMICOLON,
    KEY_QUOTE,
    KEY_LESS,
    KEY_GREATER,
    KEY_QUESTION,
    KEY_SLASH,
}


/** 定义了一些用于设置文本显示和文本格式化的标志位。*/
// export enum InputFlag {
//     /**
//      * 表明输入的文本是保密的数据，任何时候都应该隐藏起来，它隐含了 EDIT_BOX_INPUT_FLAG_SENSITIVE。
//      */
//     PASSWORD = 0,
//     /**
//      * 表明输入的文本是敏感数据，它禁止存储到字典或表里面，也不能用来自动补全和提示用户输入。
//      * 一个信用卡号码就是一个敏感数据的例子。
//      */
//     SENSITIVE = 1,
//     /**
//      * 这个标志用来指定在文本编辑的时候，是否把每一个单词的首字母大写。
//      */
//     INITIAL_CAPS_WORD = 2,
//     /**
//      * 这个标志用来指定在文本编辑是否每个句子的首字母大写。
//      */
//     INITIAL_CAPS_SENTENCE = 3,
//     /**
//      * 自动把输入的所有字符大写。
//      */
//     INITIAL_CAPS_ALL_CHARACTERS = 4,
//     /**
//      * Don't do anything with the input text.
//      */
//     DEFAULT = 5
// }

/** 输入模式。*/
export enum InputMode {
    /**
     * 用户可以输入任何文本，包括换行符。
     */
    ANY = 0,
    /**
     * 允许用户输入一个电子邮件地址。
     */
    // EMAIL_ADDR = 1,
    /**
     * 允许用户输入一个整数值。
     */
    NUMERIC,
    /**
     * 允许用户输入一个电话号码。
     */
    // PHONE_NUMBER,
    /**
     * 允许用户输入一个 URL。
     */
    // URL,
    /**
     * 允许用户输入一个实数。
     */
    DECIMAL,
    /**
     * 除了换行符以外，用户可以输入任何文本。
     */
    // SINGLE_LINE
}

/** 定义了一些用于设置文本显示和文本格式化的标志位。*/
export enum KeyItemStyle {
    normal = 0,
    middle = 1,
    large = 2
}

export interface KeyItemConfig {
    normalLabel: string,
    caspLabel: string,
    style: KeyItemStyle
}

export enum EventType {
    TEXT_CHANGED = "text-changed",
    EDITING_RETURN = "editing-return",
}

export var KeyBoardConfigs: { [key: number]: KeyItemConfig } = {
    [KeyBoardCode.NONE]: { normalLabel: '', caspLabel: '', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_A]: { normalLabel: 'a', caspLabel: 'A', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_B]: { normalLabel: 'b', caspLabel: 'B', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_C]: { normalLabel: 'c', caspLabel: 'C', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_D]: { normalLabel: 'd', caspLabel: 'D', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_E]: { normalLabel: 'e', caspLabel: 'E', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_F]: { normalLabel: 'f', caspLabel: 'F', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_G]: { normalLabel: 'g', caspLabel: 'G', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_H]: { normalLabel: 'h', caspLabel: 'H', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_I]: { normalLabel: 'i', caspLabel: 'I', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_J]: { normalLabel: 'j', caspLabel: 'J', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_K]: { normalLabel: 'k', caspLabel: 'K', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_L]: { normalLabel: 'l', caspLabel: 'L', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_M]: { normalLabel: 'm', caspLabel: 'M', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_N]: { normalLabel: 'n', caspLabel: 'N', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_O]: { normalLabel: 'o', caspLabel: 'O', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_P]: { normalLabel: 'p', caspLabel: 'P', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_Q]: { normalLabel: 'q', caspLabel: 'Q', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_R]: { normalLabel: 'r', caspLabel: 'R', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_S]: { normalLabel: 's', caspLabel: 'S', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_T]: { normalLabel: 't', caspLabel: 'T', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_U]: { normalLabel: 'u', caspLabel: 'U', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_V]: { normalLabel: 'v', caspLabel: 'V', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_W]: { normalLabel: 'w', caspLabel: 'W', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_X]: { normalLabel: 'x', caspLabel: 'X', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_Y]: { normalLabel: 'y', caspLabel: 'Y', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_Z]: { normalLabel: 'z', caspLabel: 'Z', style: KeyItemStyle.normal },
    [KeyBoardCode.NUM_0]: { normalLabel: '0', caspLabel: '0', style: KeyItemStyle.normal },
    [KeyBoardCode.NUM_1]: { normalLabel: '1', caspLabel: '1', style: KeyItemStyle.normal },
    [KeyBoardCode.NUM_2]: { normalLabel: '2', caspLabel: '2', style: KeyItemStyle.normal },
    [KeyBoardCode.NUM_3]: { normalLabel: '3', caspLabel: '3', style: KeyItemStyle.normal },
    [KeyBoardCode.NUM_4]: { normalLabel: '4', caspLabel: '4', style: KeyItemStyle.normal },
    [KeyBoardCode.NUM_5]: { normalLabel: '5', caspLabel: '5', style: KeyItemStyle.normal },
    [KeyBoardCode.NUM_6]: { normalLabel: '6', caspLabel: '6', style: KeyItemStyle.normal },
    [KeyBoardCode.NUM_7]: { normalLabel: '7', caspLabel: '7', style: KeyItemStyle.normal },
    [KeyBoardCode.NUM_8]: { normalLabel: '8', caspLabel: '8', style: KeyItemStyle.normal },
    [KeyBoardCode.NUM_9]: { normalLabel: '9', caspLabel: '9', style: KeyItemStyle.normal },
    [KeyBoardCode.DELETE]: { normalLabel: '', caspLabel: '', style: KeyItemStyle.normal },
    [KeyBoardCode.NUM_DECIMAL]: { normalLabel: '.', caspLabel: '.', style: KeyItemStyle.normal },
    [KeyBoardCode.Caps]: { normalLabel: '', caspLabel: '', style: KeyItemStyle.normal },
    [KeyBoardCode.Enter]: { normalLabel: 'Enter', caspLabel: 'Enter', style: KeyItemStyle.middle },
    [KeyBoardCode.Shift]: { normalLabel: 'Shift', caspLabel: 'Shift', style: KeyItemStyle.middle },
    [KeyBoardCode.KEY_GRAVE]: { normalLabel: '`', caspLabel: '`', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_TILDE]: { normalLabel: '~', caspLabel: '~', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_EXCLAMATION]: { normalLabel: '!', caspLabel: '!', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_AT]: { normalLabel: '@', caspLabel: '@', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_HASH]: { normalLabel: '#', caspLabel: '#', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_DOLLAR]: { normalLabel: '$', caspLabel: '$', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_PERCENT]: { normalLabel: '%', caspLabel: '%', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_CARET]: { normalLabel: '^', caspLabel: '^', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_AMPERSAND]: { normalLabel: '&', caspLabel: '&', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_ASTERISK]: { normalLabel: '*', caspLabel: '*', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_LEFT_PARENTHESIS]: { normalLabel: '(', caspLabel: '(', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_RIGHT_PARENTHESIS]: { normalLabel: ')', caspLabel: ')', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_MINUS]: { normalLabel: '-', caspLabel: '-', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_PLUS]: { normalLabel: '+', caspLabel: '+', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_LEFT_BRACE]: { normalLabel: '{', caspLabel: '{', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_RIGHT_BRACE]: { normalLabel: '}', caspLabel: '}', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_LEFT_BRACKET]: { normalLabel: '[', caspLabel: '[', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_RIGHT_BRACKET]: { normalLabel: ']', caspLabel: ']', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_PIPE]: { normalLabel: '|', caspLabel: '|', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_COLON]: { normalLabel: ':', caspLabel: ':', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_SEMICOLON]: { normalLabel: ';', caspLabel: ';', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_QUOTE]: { normalLabel: '"', caspLabel: '"', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_LESS]: { normalLabel: '<', caspLabel: '<', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_GREATER]: { normalLabel: '>', caspLabel: '>', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_QUESTION]: { normalLabel: '?', caspLabel: '?', style: KeyItemStyle.normal },
    [KeyBoardCode.KEY_SLASH]: { normalLabel: '/', caspLabel: '/', style: KeyItemStyle.normal },
};