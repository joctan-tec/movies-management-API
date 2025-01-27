

class User {
    constructor(userName, bornDate, email, password) {
        this.id = "";
        this.userName = userName;
        console.log(bornDate);
        this.bornDate = new Date(bornDate);
        console.log(this.bornDate);
        this.email = email;
        this.pictureLink = [];

    }

    setId(id) {
        this.id = id;
    }

    getId() {
        return this.id;
    }

    getUserName() {
        return this.userName;
    }

    setUserName(userName) {
        this.userName = userName;
    }

    getBornDate() {
        return this.bornDate;
    }

    setBornDate(bornDate) {
        this.bornDate = bornDate;
    }

    getEmail() {
        return this.email;
    }

    setEmail(email) {
        this.email = email;
    }

    getPictureLink() {
        return this.pictureLink;
    }

    addPictureLink(pictureLink) {
        this.pictureLink.push(pictureLink);
    }

    toJson() {
        return {
            id: this.id,
            userName: this.userName,
            bornDate: this.bornDate,
            email: this.email,
            pictureLink: this.pictureLink
        }
    }

}

module.exports = User;