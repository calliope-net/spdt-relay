
//% color=#00003F icon="\uf011" block="4-Relais" weight=02
namespace spdtrelay
/* 230903 231005 https://github.com/calliope-net/spdt-relay
https://www.seeedstudio.com/Grove-4-Channel-SPDT-Relay-p-3119.html
https://wiki.seeedstudio.com/Grove-4-Channel_SPDT_Relay/
https://github.com/Seeed-Studio/Multi_Channel_Relay_Arduino_Library/

Code anhand der Arduino Library neu programmiert von Lutz Elßner im August 2023
*/ {
    export enum eADDR { Rel_x11 = 0x11, Rel_x12 = 0x12 } // Optional I2c address 0x00 ~ 0x7F
    let n_i2cCheck: boolean = false // i2c-Check
    let n_i2cError: number = 0 // Fehlercode vom letzten WriteBuffer (0 ist kein Fehler)
    let n_channel_state: number = 0b0000

    export enum eCommandByte { CMD_CHANNEL_CTRL = 0x10, CMD_SAVE_I2C_ADDR = 0x11, CMD_READ_I2C_ADDR = 0x12, CMD_READ_FIRMWARE_VER = 0x13 }


    //% group="beim Start"
    //% block="i2c %pADDR i2c-Check %ck"
    //% pADDR.shadow="spdtrelay_eADDR"
    //% ck.shadow="toggleOnOff" ck.defl=1
    export function beimStart(pADDR: number, ck: boolean) {
        n_i2cCheck = ck
        n_i2cError = 0 // Reset Fehlercode
    }

    // ========== group="Multi Channel Relay (alle)"

    //% group="Multi Channel Relay (alle)"
    //% block="i2c %pADDR schalte R4 R3 R2 R1 (0-15) %pByte" weight=6
    //% pADDR.shadow="spdtrelay_eADDR"
    export function channelCtrl(pADDR: number, state: number) {
        n_channel_state = state & 0x0F
        writeRegister(pADDR, eCommandByte.CMD_CHANNEL_CTRL, n_channel_state)
        //readRegister(pADDR, eCommandByte.CMD_READ_FIRMWARE_VER, false)
    }

    //% group="Multi Channel Relay (alle)" 
    //% block="lese Status (binär 0-15)" weight=4
    export function getChannelState() {
        return n_channel_state
    }


    // ========== group="Multi Channel Relay (einzeln)"

    export enum eCannel { R1 = 1, R2 = 2, R3 = 3, R4 = 4 }
    //export enum eONOFF { AUS, EIN }

    //% group="Multi Channel Relay (einzeln)"
    //% block="i2c %pADDR schalte %channel %pOnOff"
    //% pADDR.shadow="spdtrelay_eADDR"
    //% pOnOff.shadow="toggleOnOff"
    export function turn_on_channel(pADDR: number, pChannel: eCannel, pOnOff: boolean) {
        if (pOnOff) {
            n_channel_state |= (1 << (pChannel - 1))  // turn_on_channel
        } else {
            n_channel_state &= ~(1 << (pChannel - 1)) // turn_off_channel
        }
        writeRegister(pADDR, eCommandByte.CMD_CHANNEL_CTRL, n_channel_state)
    }



    // ========== advanced=true

    // ========== group="Multi Channel Relay Register"

    //% group="Multi Channel Relay Register" advanced=true
    //% block="i2c %pADDR writeRegister %pRegister %pByte" weight=4
    //% inlineInputMode=inline
    //% pADDR.shadow="spdtrelay_eADDR"
    export function writeRegister(pADDR: number, pRegister: eCommandByte, pByte: number) {
        let bu = Buffer.create(2)
        bu.setUint8(0, pRegister)
        bu.setUint8(1, pByte)
        i2cWriteBuffer(pADDR, bu)
    }

    //% group="Multi Channel Relay Register" advanced=true
    //% block="i2c %pADDR readRegister %pRegister" weight=2
    //% pADDR.shadow="spdtrelay_eADDR"
    export function readRegister(pADDR: number, pRegister: eCommandByte) {
        let bu = Buffer.create(1)
        bu.setUint8(0, pRegister)
        i2cWriteBuffer(pADDR, bu, true)

        bu = i2cReadBuffer(pADDR, 1)

        return bu.getUint8(0)
    }


    // ========== group="i2c Adressen"

    //% blockId=spdtrelay_eADDR
    //% group="i2c Adressen" advanced=true
    //% block="%pADDR" weight=6
    export function spdtrelay_eADDR(pADDR: eADDR): number { return pADDR }

    //% group="i2c Adressen" advanced=true
    //% block="i2c Fehlercode" weight=2
    export function i2cError() { return n_i2cError }

    function i2cWriteBuffer(pADDR: number, buf: Buffer, repeat: boolean = false) {
        if (n_i2cError == 0) { // vorher kein Fehler
            n_i2cError = pins.i2cWriteBuffer(pADDR, buf, repeat)
            if (n_i2cCheck && n_i2cError != 0)  // vorher kein Fehler, wenn (n_i2cCheck=true): beim 1. Fehler anzeigen
                basic.showString(Buffer.fromArray([pADDR]).toHex()) // zeige fehlerhafte i2c-Adresse als HEX
        } else if (!n_i2cCheck)  // vorher Fehler, aber ignorieren (n_i2cCheck=false): i2c weiter versuchen
            n_i2cError = pins.i2cWriteBuffer(pADDR, buf, repeat)
        //else { } // n_i2cCheck=true und n_i2cError != 0: weitere i2c Aufrufe blockieren
    }

    function i2cReadBuffer(pADDR: number, size: number, repeat: boolean = false): Buffer {
        if (!n_i2cCheck || n_i2cError == 0)
            return pins.i2cReadBuffer(pADDR, size, repeat)
        else
            return Buffer.create(size)
    }

} // spdt-relay.ts
