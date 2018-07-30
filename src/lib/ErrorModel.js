export default class ErrorModel {
    constructor(type, message = '', data = '') {
        this._type = type;
        this._message = message;
        this._data = data;
    }

    get type() {
        return this._type;
    }

    get message() {
        return this._message;
    }

    get data() {
        return this._data;
    }

    toJson() {
        return {
            type: this.type,
            message: this.message,
            data: this.data
        }
    }
}