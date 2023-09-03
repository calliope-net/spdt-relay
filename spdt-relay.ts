
//% color=#00003F icon="\uf011" block="4-Relais" weight=02
namespace spdtrelay
/* 230903
https://www.seeedstudio.com/Grove-4-Channel-SPDT-Relay-p-3119.html
https://wiki.seeedstudio.com/Grove-4-Channel_SPDT_Relay/
https://github.com/Seeed-Studio/Multi_Channel_Relay_Arduino_Library/

Code anhand der Arduino Library neu programmiert von Lutz Elßner im August 2023
*/ {
    export enum eADDR { Relay = 0x11, Relay_x12 = 0x12 } // Optional I2c address 0x00 ~ 0x7F

    export enum eCommandByte { CMD_CHANNEL_CTRL = 0x10, CMD_SAVE_I2C_ADDR = 0x11, CMD_READ_I2C_ADDR = 0x12, CMD_READ_FIRMWARE_VER = 0x13 }

    let m_channel_state: number = 0b00


    // ========== group="Multi Channel Relay (alle)"

    //% group="Multi Channel Relay (alle)"
    //% block="i2c %pADDR schalte R4 R3 R2 R1 (0-15) %pByte" weight=6
    //% pADDR.shadow="spdtrelay_eADDR"
    export function channelCtrl(pADDR: number, state: number) {
        m_channel_state = state & 0x0F
        writeRegister(pADDR, eCommandByte.CMD_CHANNEL_CTRL, m_channel_state)
        //readRegister(pADDR, eCommandByte.CMD_READ_FIRMWARE_VER, false)
    }

    //% group="Multi Channel Relay (alle)" 
    //% block="lese Status (binär 0-15)" weight=4
    export function getChannelState() {
        return m_channel_state
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
            m_channel_state |= (1 << (pChannel - 1))  // turn_on_channel
        } else {
            m_channel_state &= ~(1 << (pChannel - 1)) // turn_off_channel
        }
        writeRegister(pADDR, eCommandByte.CMD_CHANNEL_CTRL, m_channel_state)
    }



    // ========== advanced=true

    // ========== group="Multi Channel Relay Register"

    //% group="Multi Channel Relay Register" advanced=true
    //% block="i2c %pADDR writeRegister %pRegister %pByte" weight=4
    //% inlineInputMode=inline
    //% pADDR.shadow="spdtrelay_eADDR"
    export function writeRegister(pADDR: number, pRegister: eCommandByte, pByte: number) {
        let bu = pins.createBuffer(2)
        bu.setUint8(0, pRegister)
        bu.setUint8(1, pByte)
        pins.i2cWriteBuffer(pADDR, bu)
    }

    //% group="Multi Channel Relay Register" advanced=true
    //% block="i2c %pADDR readRegister %pRegister" weight=2
    //% pADDR.shadow="spdtrelay_eADDR"
    export function readRegister(pADDR: number, pRegister: eCommandByte) {
        let bu = pins.createBuffer(1)
        bu.setUint8(0, pRegister)
        pins.i2cWriteBuffer(pADDR, bu, true)

        bu = pins.i2cReadBuffer(pADDR, 1)

        return bu.getUint8(0)
    }


    // ========== group="i2c Adressen"

    //% blockId=spdtrelay_eADDR
    //% group="i2c Adressen" advanced=true
    //% block="%pADDR" weight=6
    export function spdtrelay_eADDR(pADDR: eADDR): number { return pADDR }

    //% group="i2c Adressen" advanced=true
    //% block="Fehlercode vom letzten WriteBuffer (0 ist kein Fehler)" weight=2
    //export function i2cError() { return spdtrelay_i2cWriteBufferError }
    //let spdtrelay_i2cWriteBufferError: number = 0 // Fehlercode vom letzten WriteBuffer (0 ist kein Fehler)

} // spdt-relay.ts
