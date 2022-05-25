import { action, observable, flow } from 'mobx'
import api from '../api'
import commonStore from './commonStore'

class AuthStore {
    @observable isSubmitting = false
    @observable error = null

    login = flow(function * (username, password) {
        this.isSubmitting = true
        try {
            const response = yield api.login(username, password)
            // console.log(response.data);
            commonStore.setUser(response.data)
            this.error = null
            this.isSubmitting = false
            return Promise.resolve()
        } catch (error) {
            this.isSubmitting = false
            throw error;
        }
    })

    @action logout() {
        commonStore.removeUser()
        localStorage.setItem('logout', Date.now())
        return Promise.resolve()
    }

    getSelf = flow(function* (token) {
        this.isSubmitting = true
        try {
            const response = yield api.getSelf(token)
            commonStore.setUser(response.data)
            this.error = null
        this.isSubmitting = false
        } catch(error) {
            this.isSubmitting = false
            throw error;
        }
    })
}

export default new AuthStore()
