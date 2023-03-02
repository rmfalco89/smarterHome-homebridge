import {
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
} from "homebridge";
import { COLOR_MODES } from "./index";
import { TuyaWebCharacteristic } from "./base";
import { ColorAccessory } from "../ColorAccessory";
import { BaseAccessory } from "../BaseAccessory";
import { DeviceState } from "../../api/response";

export class SaturationCharacteristic extends TuyaWebCharacteristic<ColorAccessory> {
  public static Title = "Characteristic.Saturation";

  public static HomekitCharacteristic(accessory: BaseAccessory) {
    return accessory.platform.Characteristic.Saturation;
  }

  public static DEFAULT_VALUE = 0;

  public static isSupportedByAccessory(accessory): boolean {
    const configData = accessory.deviceConfig.data;
    return configData.color_mode !== undefined;
  }

  public getRemoteValue(callback: CharacteristicGetCallback): void {
    this.accessory
      .getDeviceState()
      .then((data) => {
        this.debug("[GET] %s", data?.color?.saturation);
        this.updateValue(data, callback);
      })
      .catch(this.accessory.handleError("GET", callback));
  }

  public setRemoteValue(
    homekitValue: CharacteristicValue,
    callback: CharacteristicSetCallback
  ): void {
    // Set device state in Tuya Web API
    const value = homekitValue as number;

    this.accessory
      .setColor({ saturation: value })
      .then(() => {
        this.debug("[SET] %s", value);
        callback();
      })
      .catch(this.accessory.handleError("SET", callback));
  }

  updateValue(data: DeviceState, callback?: CharacteristicGetCallback): void {
    let stateValue: number = SaturationCharacteristic.DEFAULT_VALUE;
    if (
      data?.color_mode !== undefined &&
      data?.color_mode in COLOR_MODES &&
      data?.color?.saturation
    ) {
      stateValue = Number(data.color.saturation);
    }

    this.accessory.setCharacteristic(
      this.homekitCharacteristic,
      stateValue,
      !callback
    );
    callback && callback(null, stateValue);
  }
}
