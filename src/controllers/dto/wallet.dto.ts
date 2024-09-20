export interface SetupTrnxPinDto {
  pin: string;
  confirmPin: string;
}

export interface ChangeTrnxPinDto {
  oldPin: string;
  newPin: string;
  confirmNewPin: string;
}
