import React from 'react'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'
import { withRouter } from "react-router"
import { Tabs, Descriptions } from 'antd'

import UserTable from '~/src/components/userTable'
import RoleTable from '~/src/components/roleTable'

const { TabPane } = Tabs

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
`

@inject('commonStore') @observer
class UserPage extends React.Component {

    render() {
        return (
            <Container>
                <Tabs defaultActiveKey='user'>
                    <TabPane tab='User' key='user'>
                        <UserTable />
                    </TabPane>
                    
                    <TabPane tab='Role' key='role'>
                        <RoleTable />
                    </TabPane>
                </Tabs>
            </Container>
        )
    }
}

export default withRouter(UserPage)