// ==UserScript==
// @name         [0100DB300B996000] Buddy Mission BOND
// @version      0.1 - 1.0.0, 1.0.1
// @author       [DC]
// @description  Yuzu
// * Nintendo
// * 
// ==/UserScript==
const gameVer = '1.0.0+1.0.1';

const { setHook } = require('./libYuzu.js');

const encoder = new TextEncoder('shift_jis');
const decoder = new TextDecoder('shift_jis');
const mainHandler = trans.send(handler, 100); // prevent double

setHook({
    '1.0.0': {
        0x8046dd0: mainHandler,
    },
    '1.0.1': {
        0x8046de0: mainHandler,
    },
    '1.0.0+1.0.1': { // unsafe
        0x8046dd0: mainHandler,
        0x8046de0: mainHandler,
    }
}[globalThis.gameVer ?? gameVer]);

function handler(regs) {
    const address = regs[8].value.add(1);

    console.log('onEnter');
    //console.log(hexdump(address, { header: false, ansi: false, length: 0x50 }));

    let s = readString(address);
    s = s.replace(/\n+/g, ' '); // single line

    return s;
}

function readString(address) {
    let s = '', i = 0, c;
    const buf = new Uint8Array(2);
    while ((c = address.add(i).readU8()) !== 0) {
        if (c < 0x20 && c > 0x10) { // skip bytecode: ruby, color,...
            let size = address.add(i+2).readU8();
            i = i + 3 + size;
        } else { // read one char
            buf[0] = c;
            buf[1] = address.add(i+1).readU8();
            c = decoder.decode(buf)[0]; // ShiftJIS: 1->2 bytes.
            s += c;
            i += encoder.encode(c).byteLength;
        }
    }
    return s;
}