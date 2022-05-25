import React from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'
import { Table, Button, Input, Select, Checkbox, Row, Tag, DatePicker, Tooltip, Card, List, Popconfirm, message } from 'antd'
import { LIMIT } from '~/src/constants/common'
import moment from 'moment'
import { pageSizeOptions } from '~/src/constants/options'
import update from 'immutability-helper'
import _, { keys } from 'lodash'
import Meta from 'antd/lib/card/Meta'
import keyStore from '../stores/keyStore'
import ZoomMessage from './zoomMessage'

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
`

const ActionWrapper = styled.div`
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin-bottom: 16px;

    button {
        margin-right: 8px;
    }
`

const ActionLeftWrapper = styled.div`
    flex-grow: 1;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
`

const TableWrapper = styled.div`
    background-color: white;
`

const EllipsisText = styled.div`
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;
`

const TagWrapper = styled.div`
    display: flex;
    flex-flow: row nowrap;
    margin-bottom: 16px;

`

const DurationInSeconds = 30;

@inject('commonStore', 'keyStore') @observer
class KeyServiceTable extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            keyString: '',
            action: {
                type: '',
                user: {id: null},
                key: {id: null},
            },
            timeout: undefined,
        }

        // https://stackoverflow.com/questions/38564080/remove-event-listener-on-unmount-react
        // .bind always creates a new function so you need to do like below, so it adds and removes the same function.
        this.handleOnKeyDown = this.handleOnKeyDown.bind(this);
        this.handleClearAction = this.handleClearAction.bind(this);
    }

    async componentDidMount() {
        const { keyStore } = this.props
        await keyStore.listKey();

        window.addEventListener('keydown', this.handleOnKeyDown);

        setInterval(() => {keyStore.listKey()}, DurationInSeconds * 1000)
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleOnKeyDown);
    }

    async handleOnAction() {
        let { action } = this.state;
        
        keyStore
            .unlockCell(...Object.values(action))
            .catch(error => {
                const { data, status } = error.response

                switch (status) {
                    case 401: // Unauthorized
                        ZoomMessage.error('Unauthorized access');
                        break;
                    case 403: // Forbidden
                        ZoomMessage.error('Access denied');
                        break;
                    case 409: // Conflict
                        ZoomMessage.error('Conflicting key status');
                        keyStore.listKey();
                        break;
                    case 429: // Too many requests
                        ZoomMessage.error(`Unclosed doors (#${data.cellNumber})`);
                        break;
                    default:
                        ZoomMessage.error(`Uncaught error ${error.response.status}: ${error.response.data}`);
                        break;
                }
            });

        this.setState({
            action: {
                type: '',
                user: {id: null},
                key: {id: null},
            }
        });
    }

    handleOnKeyDown(event) {
        let thisCode = event.keyCode;

        let keyString = this.state.keyString;

        if (thisCode == 13 && keyString.length) {

            keyStore
                .getTag(keyString)
                .then(() => {
                    let tag = toJS(keyStore.searchedTag);

                    let { action, timeout } = this.state;

                    if (timeout) {
                        clearTimeout(timeout);
                        this.setState({ timeout: undefined });
                        message.destroy('user');
                    }
                    
                    if (tag.type === 'key') {
                        if (action.key.id !== null) {
                            ZoomMessage.error('Keys were tapped twice.');
                            action.key = {id: null};

                        } else {
                            action.type = 'return';
                            action.key = tag.content;
                            timeout = setTimeout(this.handleClearAction, 30000);
                            this.setState({ timeout: timeout });

                        }

                        this.setState( {action} );

                    } else if (tag.type === 'user') {
                        if (action.user.id !== null) {
                            ZoomMessage.error('Staff cards were tapped twice.');
                            action.user = {id: null};

                        } else {
                            if (action.key.id == null) {
                                message.info({
                                    content: `Accessing keys as ${tag.content.displayName}`,
                                    key: 'user',
                                    duration: DurationInSeconds,
                                });
                            }

                            action.user = tag.content;

                            timeout = setTimeout(this.handleClearAction, 30000);
                            this.setState({ timeout: timeout });

                        }

                        this.setState( {action} );

                    }
                    
                    if (action.key.id !== null && action.user.id !== null) {
                        this.handleOnAction();
                    }
                })
                .catch(error => {
                    switch (error.response.status) {
                        case 400: // Bad Request
                            ZoomMessage.error('Unidentified tag');
                            break;
                        case 401: // Unauthorized
                            ZoomMessage.error('Unauthorized access');
                            break;
                        default:
                            ZoomMessage.error(`Uncaught error ${error.response.status}: ${error.response.data}`);
                            break;
                    }
                });

            this.setState( {keyString:''} );

        } else if (48 <= thisCode && thisCode <= 57 ) {
            keyString += thisCode - 48;
            this.setState({ keyString });

        } else if (96 <= thisCode && thisCode <= 105) {
            keyString += thisCode - 96;
            this.setState({ keyString });

        } 
            
    }


    handleOnCardClick(key, customAction) {
        let { action, timeout } = this.state;
        let { user } = action;
        
        let isAcceessible = (user.keys && user.keys.length) ? 
            user.keys.some(accessibleKey => accessibleKey.id == key.id) :
            true;

        if (key.isAvailable && !isAcceessible) {
            ZoomMessage.error('Unauthorized access');
            return;
        }

        if (action.key.id == key.id) {
            action.key = {id: null};
            action.type = ''
        } else {
            action.key = key;
            
            if (customAction)
                action.type = customAction;
            else
                action.type = (!key.isAvailable) ? 'return' : 'retrieve';
        }

        this.setState({ action });

        if (timeout) {
            clearTimeout(timeout);
            this.setState({ timeout: undefined });
            message.destroy('user');
        }
        
        timeout = setTimeout(this.handleClearAction, 30000);
        this.setState({ timeout: timeout });
                    
        if (action.key.id !== null && action.user.id !== null) {
            this.handleOnAction();
        }
    }

    handleClearAction() {
        const { timeout } = this.state;

        if (timeout) {
            clearTimeout(timeout);
            this.setState({ timeout: undefined });
        }

        this.setState({
            action: {
                type: '',
                user: {id: null},
                key: {id: null},
            }
        })
    }

    render() {
        const { keyStore } = this.props
        const { user } = this.state.action;

        let keys = toJS(keyStore.keys)

        const cellRange = [...Array(29).keys()].slice(1);
        const cellNumbers = keys.map(k => k.cellNumber);

        cellRange
            .filter(c => !cellNumbers.includes(c))
            .forEach(c => {
                keys.push({
                    id: -1,
                    description: 'Empty cell',
                    keyGroupId: -1,
                    cellNumber: c,
                    isPlaceholder: true,
                })
            })

        keys = keys.sort((a,b) => a.cellNumber - b.cellNumber)

        return (
            <List 
                grid={{ gutter: 30, column: 4 }}
                dataSource={keys}
                loading={keyStore.isSubmitting}
                renderItem={key => {
                    let isSelected = this.state.action.key.id==key.id;
                    let isAcceessible = (user.keys && user.keys.length) ? 
                        user.keys.some(accessibleKey => accessibleKey.id == key.id) :
                        true;

                    let cardStyle = {};
                    let title;

                    if (isSelected) {
                        cardStyle = {
                            headStyle: {backgroundColor: 'rgba(24, 144, 255, 0.4)', border: 0 },
                            bodyStyle: {backgroundColor: 'rgba(24, 144, 255, 0.4)', border: 0 },
                        };

                    } else if (!key.isAvailable) {
                        cardStyle = {
                            headStyle: {backgroundColor: 'rgba(0, 0, 0, 0.2)', border: 0 },
                            bodyStyle: {backgroundColor: 'rgba(0, 0, 0, 0.2)', border: 0 },
                        };

                    } else if (!isAcceessible) {
                        cardStyle = {
                            headStyle: {backgroundColor: 'rgba(0, 0, 0, 0.4)', border: 0 },
                            bodyStyle: {backgroundColor: 'rgba(0, 0, 0, 0.4)', border: 0 },
                        };

                    }

                    if (key.isAvailable && !isAcceessible)
                        title = 'Unauthorized';
                    else if (key.isAvailable)
                        title = 'Available';
                    else
                        title = 'Not available';

                    let onClickProps = (key.isAvailable && !key.isPlaceholder) ?
                        { onClick: () => this.handleOnCardClick(key) }:
                        {  }

                    let cardDom = (
                        <Card
                            size="small"
                            title={title}
                            hoverable
                            {... onClickProps}
                            {... cardStyle}
                        >
                            <h1>#{key.cellNumber}. {key.description}</h1>
                            <Meta    
                                description={
                                    key.lastLog ?
                                    `${key.lastLog.user.username} | ${moment(key.lastLog.createdAt).fromNow()}` :
                                    'No history yet'
                                }
                            />
                        </Card>
                    );

                    cardDom = (key.isAvailable || key.isPlaceholder) ?
                        cardDom :
                        (
                            <Popconfirm
                                title = {
                                    <div>
                                        Are you sure to force reset as returned?<br />
                                        You will be recorded for this action.<br />
                                        Proceed only after you checked the key is still inside the cell.
                                    </div>
                                }
                                onConfirm = { () => this.handleOnCardClick(key, 'force-return') }
                            >
                                {cardDom}
                            </Popconfirm>
                        );

                    return (
                        key.cellNumber >= 1 && // render cell #1-28 only
                        key.cellNumber <= 28 && // render cell #1-28 only
                        <List.Item>
                            { cardDom }
                        </List.Item>
                    )
                }}
            />
        )
    }
}

export default KeyServiceTable