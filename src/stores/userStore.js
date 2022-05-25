import { observable, action, flow } from 'mobx'
import api from '../api'

import commonStore from './commonStore'

class UserStore {
    @observable isSubmitting = false
    @observable error = null
    @observable users = []
    @observable count = 0

    @action createUser = flow(function* (username, displayName, cardNumber, active, role) {
        const { token } = commonStore
        this.isSubmitting = true;

        try {
            const response = yield api.createUser(token, username, displayName, cardNumber, active, role);
            this.error = null;
            this.isSubmitting = false;

        } catch(error) {
            this.isSubmitting = false
            throw error;

        }
        
    })

    @action listUser = flow(function* (limit, skip, sort, username, displayName, role) {
        const { token } = commonStore
        this.isSubmitting = true;

        try {
            const response = yield api.listUser(token, limit, skip, sort, username, displayName, role);
            
            const { data: users, count } = response.data;

            this.users = users.sort((a, b) => a.username - b.username);
            this.count = count;
            
            this.error = null;
            this.isSubmitting = false;

        } catch(error) {
            this.isSubmitting = false
            throw error;

        }
        
    })
    

    @action updateUser = flow(function* (id, username, displayName, cardNumber, active, role) {
        const { token } = commonStore
        this.isSubmitting = true;

        try {
            const index = this.users.findIndex(u => u.id === id);
            if (index < 0) return;

            const response = yield api.editUser(token, id, username, displayName, cardNumber, active, role);
            
            this.users[index] = response.data;
            this.error = null;
            this.isSubmitting = false;

        } catch(error) {
            this.isSubmitting = false
            throw error;

        }
        
    })

}

export default new UserStore()
