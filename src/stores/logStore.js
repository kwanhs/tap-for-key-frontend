import { observable, action, flow } from 'mobx'
import api from '../api'
import commonStore from './commonStore'

class LogStore {
    @observable isSubmitting = false
    @observable error = null
    @observable log = []

    @action listLog = flow(function* (id, limit, skip, sort) {
        this.isSubmitting = true

        try {
            const response = yield api.listLog(id, limit, skip, sort);
            const { data: log, count } = response.data;
            this.log = log;
            this.count = count;
            this.isSubmitting = false;
        } catch(error) {
            this.isSubmitting = false;
            throw error;
        }
    })

}

export default new LogStore()
