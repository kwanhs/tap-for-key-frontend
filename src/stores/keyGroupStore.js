import { observable, action, flow } from 'mobx'
import api from '../api'
import commonStore from './commonStore'

class KeyGroupStore {
    @observable isSubmitting = false
    @observable error = null
    @observable keyGroups = []
    @observable searchedTag = []


    @action createKeyGroup = flow(function* (description, abbreviation, role) {
        const { token } = commonStore
        this.isSubmitting = true;

        try {
            const response = yield api.createKeyGroup(token, description, abbreviation, role);
            this.error = null;
            this.isSubmitting = false;

        } catch(error) {
            this.isSubmitting = false
            throw error;

        }
    })

    @action deleteKeyGroup = flow(function* (id) {
        const { token } = commonStore
        this.isSubmitting = true;

        try {
            const index = this.keyGroups.findIndex(kGp => kGp.id === id);
            if (index < 0) return;

            const response = yield api.deleteKeyGroup(token, id);
            this.keyGroups.splice(index, 1);

            this.error = null;
            this.isSubmitting = false;

        } catch(error) {
            this.isSubmitting = false
            throw error;

        }
    })

    @action listKeyGroup = flow(function* (limit, skip, sort, description, abbreviation, key) {
        this.isSubmitting = true;

        try {
            const response = yield api.listKeyGroup(limit, skip, sort, description, abbreviation, key);
            
            const { data: keyGroups, count } = response.data;

            this.keyGroups = keyGroups;
            this.count = count;

            this.error = null;
            this.isSubmitting = false;

        } catch(error) {
            this.isSubmitting = false
            throw error;

        }
        
    })


    @action updateKeyGroup = flow(function* (id, description, abbreviation, role) {
        const { token } = commonStore
        this.isSubmitting = true;

        try {
            const index = this.keyGroups.findIndex(kGp => kGp.id === id);
            if (index < 0) return;

            const response = yield api.editKeyGroup(token, id, description, abbreviation, role);
            
            this.keyGroups[index] = response.data;
            this.error = null;
            this.isSubmitting = false;

        } catch(error) {
            this.isSubmitting = false
            throw error;

        }
        
    })
}

export default new KeyGroupStore()
