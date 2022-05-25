import React, { Component } from 'react'
import styled from 'styled-components'

const FooterWrapper = styled.div`
    background: #333333;
    width: 100%;
`

const FooterDetail = styled.div`
    min-width: 960px;
    width: 80%;
    height: 64px;
    margin: 0 auto;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
`

const Copyright = styled.div`
    color: #fff;
    padding: 8px;
`

class Footer extends Component {

    render() {
        return (
            <FooterWrapper>
                <FooterDetail>
                    <Copyright>© 2022 William Kwan</Copyright>
                </FooterDetail>
            </FooterWrapper>
        )
    }
}

export default Footer