module.exports = class User {

    #doc

    // Recieves a FaunaDB m_users document
    constructor(document) {
        this.#doc = document

        this.id = document.data.id
        this.name = document.data.name
        this.email = document.data.email
        this.role = document.data.role
        this.fields = document.data.fields
        this.last_modified = (new Date(document.ts * Math.pow(10, -3))).toJSON()
    }

    getDocument() {
        return this.#doc
    }

}