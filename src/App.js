import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { Provider } from 'mobx-react'
import { inject, observer } from 'mobx-react'
import { ThemeProvider } from 'styled-components'
import { ConfigProvider, message } from 'antd'
import queryString from 'query-string'
import moment from 'moment'
// import PrivateRoute from '~/src/components/routes/privateRoute'
import PageLayout from '~/src/components/layouts/main'


import commonStore from './stores/commonStore'
import authStore from './stores/authStore'
import keyStore from './stores/keyStore'
import keyGroupStore from './stores/keyGroupStore'
import logStore from './stores/logStore'
import userStore from './stores/userStore'
import roleStore from './stores/roleStore'

import LoginPage from './containers/loginPage'
import KeyServicePage from './containers/keyServicePage'
import UserPage from './containers/userPage'
import KeyPage from './containers/keyPage'

import './styles/index.css'

moment.locale('zh-hk')

const theme = {
    primary: '#1890ff'
}

@observer
class App extends Component {

    constructor(props) {
        super(props)
        const params = queryString.parse(window.location.search)
    }

    isTokenExpired() {
        const tokenExpAt = localStorage.getItem('tokenExpAt')
        const expiresIn = Date.parse(tokenExpAt) - Date.now() // in milliseconds
        return expiresIn < 0
    }

    render() {
        return (
            <Provider
                commonStore={commonStore}
                authStore={authStore}
                keyStore={keyStore}
                keyGroupStore={keyGroupStore}
                logStore={logStore}
                userStore={userStore}
                roleStore={roleStore}
            >
                <ThemeProvider theme={theme}>
                        <Router>
                            <Switch>
                                <PageLayout>
                                    <Route exact path="/" component={KeyServicePage} />
                                    <Route exact path="/user" component={UserPage} />
                                    <Route exact path="/key" component={KeyPage} />
                                    <Route exact path="/login" component={LoginPage} />
                                    <Route exact path="/logout" component={KeyPage} />
                                </PageLayout>
                            </Switch>
                        </Router>
                </ThemeProvider>
            </Provider>
        )
    }
}

export default App
