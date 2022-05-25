import { observable, action, flow } from 'mobx'
import api from '../api'
import commonStore from './commonStore'

class KeyStore {
    @observable isSubmitting = false
    @observable error = null
    @observable keys = []
    @observable searchedTag = []
    @observable log = []

    @action createKey = flow(function* (cellNumber, description, keyGroupId, keyTagNumber) {
        const { token } = commonStore
        this.isSubmitting = true;

        try {
            const response = yield api.createKey(token, cellNumber, description, keyGroupId, keyTagNumber);
            this.error = null;
            this.isSubmitting = false;

        } catch(error) {
            this.isSubmitting = false
            throw error;

        }
        
    })

    @action getTag = flow(function* (tagNumber) {
        this.isSubmitting = true

        try {
            const response = yield api.getTag(tagNumber);
            const tag = response.data;
            this.searchedTag = tag;
            this.isSubmitting = false;
        } catch(error) {
            this.isSubmitting = false
            throw error;
        }
        
    })

    @action listKey = flow(function* (limit, skip, sort, cellNumber, description, keyGroup, status, actionBy, actionTime) {
        this.isSubmitting = true;

        try {
            const response = yield api.listKey(limit, skip, sort, cellNumber, description, keyGroup, status, actionBy, actionTime);
            
            const { data: keys, count } = response.data;

            this.count = count;

            this.keys = keys
                .sort((a, b) => a.cellNumber - b.cellNumber)
                .map(k => {
                    if (!k.log.length) {
                        k.lastLog = undefined;
                        k.isAvailable = true;
                        return k;
                    }

                    k.lastLog = k.log.reduce(
                        (max, p) => p.createdAt > max.createdAt ? p : max, k.log[0]
                    );

                    // console.log(k.lastLog)

                    k.isAvailable = k.lastLog.action === 'return';

                    return k;
                });



            this.error = null;
            this.isSubmitting = false;

        } catch(error) {
            this.isSubmitting = false
            throw error;

        }
        
    })


    @action unlockCell = flow(function* (action, user, key) {
        this.isSubmitting = true

        try {
            const response = yield api.unlockCell(action, user, key);
            yield this.listKey();
            this.isSubmitting = false;
        } catch(error) {
            this.isSubmitting = false
            throw error;
        }
        
    })



    @action updateKey = flow(function* (id, cellNumber, description, keyGroupId, keyTagNumber) {
        const { token } = commonStore
        this.isSubmitting = true;

        try {
            const index = this.keys.findIndex(k => k.id === id);
            if (index < 0) return;

            const response = yield api.editKey(token, id, cellNumber, description, keyGroupId, keyTagNumber);

            let key = response.data;

            if (!key.log.length) {
                key.lastLog = undefined;
                key.isAvailable = true;

            } else {    
                key.lastLog = key.log.reduce(
                    (max, p) => p.createdAt > max.createdAt ? p : max, key.log[0]
                );

                key.isAvailable = key.lastLog.action === 'return';

            }
            
            this.keys[index] = key;
            this.error = null;
            this.isSubmitting = false;

        } catch(error) {
            this.isSubmitting = false
            throw error;

        }
        
    })

}

export default new KeyStore()
