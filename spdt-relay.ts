
//% color=#00003F icon="\uf011" block="4Relais" weight=02
namespace spdtrelay
/*
*/ {
    export enum eADDR { Relay = 0x11, Relay_x12 = 0x12 } // Optional I2c address 0x00 ~ 0x7F

    export enum eCommandByte { CMD_CHANNEL_CTRL = 0x10, CMD_SAVE_I2C_ADDR = 0x11, CMD_READ_I2C_ADDR = 0x12, CMD_READ_FIRMWARE_VER = 0x13 }

    let m_channel_state: number = 0b0000




    //% group="Multi Channel Relay (alle)"
    //% block="i2c %pADDR schalte R4 R3 R2 R1 (0-15) %pByte" weight=96
    export function channelCtrl(pADDR: eADDR, state: number) {
        m_channel_state = state & 0x0F
        writeRegister(pADDR, eCommandByte.CMD_CHANNEL_CTRL, m_channel_state)
        //readRegister(pADDR, eCommandByte.CMD_READ_FIRMWARE_VER, false)
    }

    //% group="Multi Channel Relay (alle)" 
    //% block="lese Status (binär 0-15)" weight=94
    export function getChannelState() {
        return m_channel_state
    }

    export enum eCannel { R1 = 1, R2 = 2, R3 = 3, R4 = 4 }
    export enum eONOFF { AUS, EIN }

    //% group="Multi Channel Relay (einzeln)"
    //% block="i2c %pADDR schalte %channel %pONOFF" weight=92
    export function turn_on_channel(pADDR: eADDR, channel: eCannel, pONOFF: eONOFF) {
        if (pONOFF == eONOFF.EIN) {
            m_channel_state |= (1 << (channel - 1))  // turn_on_channel
        } else {
            m_channel_state &= ~(1 << (channel - 1)) // turn_off_channel
        }
        writeRegister(pADDR, eCommandByte.CMD_CHANNEL_CTRL, m_channel_state)
    }



    // ========== advanced=true

    //% group="Multi Channel Relay Register" advanced=true
    //% block="i2c %pADDR writeRegister %pRegister %pByte" weight=62
    //% inlineInputMode=inline
    export function writeRegister(pADDR: eADDR, pRegister: eCommandByte, pByte: number) {
        let bu = pins.createBuffer(2)
        bu.setUint8(0, pRegister)
        bu.setUint8(1, pByte)
        pins.i2cWriteBuffer(pADDR, bu)
    }


    //% group="Multi Channel Relay Register" advanced=true
    //% block="i2c %pi2cADDR readRegister %pRegister" weight=60
    export function readRegister(pADDR: eADDR, pRegister: eCommandByte) {
        let bu = pins.createBuffer(1)
        bu.setUint8(0, pRegister)
        pins.i2cWriteBuffer(pADDR, bu, true)

        bu = pins.i2cReadBuffer(pADDR, 1)

        return bu.getUint8(0)
    }
} // spdt-relay.ts
