import { observable, action, flow } from 'mobx'
import api from '../api'
import commonStore from './commonStore'

class RoleStore {
    @observable isSubmitting = false
    @observable error = null
    @observable roles = []
    @observable count = 0

    @action createRole = flow(function* (description, abbreviation, user, keyGroup) {
        const { token } = commonStore
        this.isSubmitting = true;

        try {
            const response = yield api.createRole(token, description, abbreviation, user, keyGroup);
            this.error = null;
            this.isSubmitting = false;

        } catch(error) {
            this.isSubmitting = false
            throw error;

        }

    })

    @action listRole = flow(function* (limit, skip, sort, description, abbreviation, keyGroup) {
        this.isSubmitting = true;

        try {
            const response = yield api.listRole(limit, skip, sort, description, abbreviation, keyGroup);
            
            const { data: roles, count } = response.data;

            this.roles = roles;
            this.count = count;

            this.error = null;
            this.isSubmitting = false;

        } catch(error) {
            this.isSubmitting = false
            throw error;

        }
        
    })

    @action deleteRole = flow(function* (id) {
        const { token } = commonStore
        this.isSubmitting = true;

        try {
            const index = this.roles.findIndex(kGp => kGp.id === id);
            if (index < 0) return;

            const response = yield api.deleteRole(token, id);
            this.roles.splice(index, 1);

            this.error = null;
            this.isSubmitting = false;

        } catch(error) {
            this.isSubmitting = false
            throw error;

        }
    })


    @action updateRole = flow(function* (id, description, abbreviation, user, keyGroup) {
        const { token } = commonStore
        this.isSubmitting = true;

        try {
            const index = this.roles.findIndex(r => r.id === id);
            if (index < 0) return;

            const response = yield api.editRole(token, id, description, abbreviation, user, keyGroup);
            
            this.roles[index] = response.data;
            this.error = null;
            this.isSubmitting = false;

        } catch(error) {
            this.isSubmitting = false
            throw error;

        }
        
    })

}

export default new RoleStore()
