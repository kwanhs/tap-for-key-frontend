import React from 'react'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'
import { withRouter } from "react-router"
import { Tabs, Descriptions } from 'antd'
import KeyServiceTable from '~/src/components/keyServiceTable'


const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
`

@inject('commonStore') @observer
class KeyServicePage extends React.Component {

    render() {
        return (
            <Container>
                <KeyServiceTable />
            </Container>
        )
    }
}

export default withRouter(KeyServicePage)