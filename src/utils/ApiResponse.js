class ApiResponse {
    constructor( statusCode, code, message = "Success"){
        this.statusCode = statusCode
        this.data = this.data
        this.message = message
        this.success = statusCode < 400
    }
}
export {ApiResponse}