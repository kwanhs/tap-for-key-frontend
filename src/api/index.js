import axios from 'axios'

const BASE_URL = process.env.REACT_APP_BASE_URL

async function createKey(token, cellNumber, description, keyGroupId, keyTagNumber) {
    const options ={
        method: 'post',
        url: `${BASE_URL}/key`,
        headers: {
            'Authorization': `jwt ${token}`,
        },
        data: {
            cellNumber,
            description,
            keyGroupId,
            keyTagNumber,
        }
    }
    return axios(options)
}

async function createKeyGroup(token, description, abbreviation, role) {
    const options ={
        method: 'post',
        url: `${BASE_URL}/keygroup`,
        headers: {
            'Authorization': `jwt ${token}`,
        },
        data: {
            description,
            abbreviation,
            role,
        }
    }
    return axios(options)
}

async function createRole(token, description, abbreviation, user, keyGroup) {
    const options ={
        method: 'post',
        url: `${BASE_URL}/role`,
        headers: {
            'Authorization': `jwt ${token}`,
        },
        data: {
            description,
            abbreviation,
            user,
            keyGroup,
        }
    }
    return axios(options)
}

async function createUser(token, username, displayName, cardNumber, active, role) {
    const options ={
        method: 'post',
        url: `${BASE_URL}/user`,
        headers: {
            'Authorization': `jwt ${token}`,
        },
        data: {
            username,
            displayName,
            cardNumber,
            active,
            role,
        }
    }
    return axios(options)
}


async function deleteKeyGroup(token, id) {
    const options ={
        method: 'delete',
        url: `${BASE_URL}/keygroup/${id}`,
        headers: {
            'Authorization': `jwt ${token}`,
        },
    }
    return axios(options)
}

async function deleteRole(token, id) {
    const options ={
        method: 'delete',
        url: `${BASE_URL}/role/${id}`,
        headers: {
            'Authorization': `jwt ${token}`,
        },
    }
    return axios(options)
}

async function editKey(token, id, cellNumber, description, keyGroupId, keyTagNumber) {
    const options ={
        method: 'put',
        url: `${BASE_URL}/key/${id}`,
        headers: {
            'Authorization': `jwt ${token}`,
        },
        data: {
            cellNumber,
            description,
            keyGroupId,
            keyTagNumber,
        }
    }
    return axios(options)
}

async function editKeyGroup(token, id, description, abbreviation, role) {
    const options ={
        method: 'put',
        url: `${BASE_URL}/keygroup/${id}`,
        headers: {
            'Authorization': `jwt ${token}`,
        },
        data: {
            description,
            abbreviation,
            role,
        }
    }
    return axios(options)
}

async function editRole(token, id, description, abbreviation, user, keyGroup) {
    const options ={
        method: 'put',
        url: `${BASE_URL}/role/${id}`,
        headers: {
            'Authorization': `jwt ${token}`,
        },
        data: {
            description,
            abbreviation,
            user,
            keyGroup,
        }
    }
    return axios(options)
}

async function editUser(token, id, username, displayName, cardNumber, active, role) {
    const options ={
        method: 'put',
        url: `${BASE_URL}/user/${id}`,
        headers: {
            'Authorization': `jwt ${token}`,
        },
        data: {
            username,
            displayName,
            cardNumber,
            active,
            role,
        }
    }
    return axios(options)
}

async function getTag(tagNumber) {
    const options = {
        method: 'get',
        url: `${BASE_URL}/tag/${tagNumber}`,
    }
    return axios(options)
}

async function listKey(limit, skip, sort, cellNumber, description, keyGroup, status, actionBy, actionTime) {
    const options = {
        method: 'get',
        url: `${BASE_URL}/key`,
        params: {
            limit,
            skip,
            sort,
            cellNumber,
            description,
            keyGroup,
            status,
            actionBy,
            actionTime,
        },
    }
    return axios(options)
}

async function listKeyGroup(limit, skip, sort, description, abbreviation, key) {
    const options = {
        method: 'get',
        url: `${BASE_URL}/keygroup`,
        params: {
            limit,
            skip,
            sort,
            description,
            abbreviation,
            key,
        }
    }
    return axios(options)
}

async function listLog(id, limit, skip, sort) {
    const options = {
        method: 'get',
        url: `${BASE_URL}/key/get/${id}/log`,
        params: {
            id,
            limit,
            skip,
            sort,
        }
    }
    return axios(options)
}

async function listRole(limit, skip, sort, description, abbreviation, keyGroup) {
    const options = {
        method: 'get',
        url: `${BASE_URL}/role`,
        params: {
            limit,
            skip,
            sort,
            description,
            abbreviation,
            keyGroup,
        }
    }
    return axios(options)
}

async function listUser(token, limit, skip, sort, username, displayName, role) {
    const options = {
        method: 'get',
        url: `${BASE_URL}/user`,
        headers: {
            'Authorization': `jwt ${token}`,
        },
        params: {
            limit,
            skip,
            sort,
            username,
            displayName,
            role,
        }
    }
    return axios(options)
}

async function login(username, password) {
    const options = {
        method: 'post',
        url: `${BASE_URL}/user/login`,
        data: {
            username,
            password,
        }
    }
    return axios(options)
}

async function unlockCell(action, user, key) {
    const options = {
        method: 'get',
        url: `${BASE_URL}/key/${action}`,
        params: {
            user_id: user.id,
            key_id: key.id,
        }
    }
    return axios(options)
}

export default {
    createKey,
    createKeyGroup,
    createRole,
    createUser,
    deleteKeyGroup,
    deleteRole,
    editKey,
    editKeyGroup,
    editRole,
    editUser,
    getTag,
    listKey,
    listKeyGroup,
    listLog,
    listRole,
    listUser,
    login,
    unlockCell,
}