import { action, observable, computed } from 'mobx'

class CommonStore {
    @observable userId = sessionStorage.getItem('userId')
    @observable username = sessionStorage.getItem('username')
    @observable role = sessionStorage.getItem('role')
    @observable token = sessionStorage.getItem('token')

    @action setUser(user) {
        const { id, username, role, token } = user
        sessionStorage.setItem('userId', id)
        sessionStorage.setItem('username', username)
        sessionStorage.setItem('role', role)
        sessionStorage.setItem('token', token)

        this.userId = id;
        this.username = username;
        this.role = role;
        this.token = token;
    }

    @action removeUser() {
        sessionStorage.removeItem('userId')
        sessionStorage.removeItem('username')
        sessionStorage.removeItem('role')
        sessionStorage.removeItem('token')

        this.userId = null;
        this.username = null;
        this.role = null;
        this.token = null;
    }

    isLoggedIn() {
        return (!!this.username);
    }

    isAdmin() {
        return (this.role === 'admin');
    }

}
export default new CommonStore()
