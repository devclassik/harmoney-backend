export class CustomError extends Error {
  public statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode

    // Ensure the correct prototype chain is maintained
    Object.setPrototypeOf(this, CustomError.prototype)
  }
}
