import React from 'react'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'
import { withRouter } from "react-router"
import { Tabs, Descriptions } from 'antd'

import KeyTable from '~/src/components/keyTable'
import KeyGroupTable from '~/src/components/keyGroupTable'

const { TabPane } = Tabs;

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
                <Tabs defaultActiveKey='key'>
                    <TabPane tab='Key' key='key'>
                        <KeyTable />
                    </TabPane>
                    
                    <TabPane tab='Group' key='keyGroup'>
                        <KeyGroupTable />
                    </TabPane>
                </Tabs>
            </Container>
        )
    }
}

export default withRouter(UserPage)