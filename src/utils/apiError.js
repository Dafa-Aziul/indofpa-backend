export default class ApiError extends Error {
  constructor(status, message, errors = null) {
    super(message);
    this.status = status;   // <-- SAMA DENGAN EXPRESS & BODY-PARSER
    this.errors = errors;
  }
}
