import React from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'
import { Table, Button, Input, Select, Checkbox, Row, Tag, DatePicker, Tooltip, Card, List } from 'antd'
import moment from 'moment'
import update from 'immutability-helper'
import _, { keys } from 'lodash'
import Meta from 'antd/lib/card/Meta'
import CreateKeyModal from './createKeyModal'
import ViewLogModal from './viewLogModal'
import { SearchOutlined, StopOutlined } from '@ant-design/icons'
import keyGroupStore from '../stores/keyGroupStore'
import commonStore from '../stores/commonStore'
import { withRouter } from 'react-router-dom'
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

const initialFilterValues = {
    cellNumber: undefined,
    description: undefined,
    keyGroup: undefined,
    status: undefined,
    actionBy: undefined,
    actionTime: undefined,
}

@inject('commonStore', 'keyStore', 'keyGroupStore') @observer
class KeyTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,
            pageSize: 15,
            filterValues: initialFilterValues,
            sortedInfo: undefined,
            createUserVisible: false,
            viewKeyLogVisible: false,
            selectedKeyId: undefined,
        };
        
        this.emptyKey = {
            id: undefined,
            description: undefined,
            keyGroup: undefined,
        };
    }

    async componentDidMount() {
        const { keyStore, keyGroupStore, commonStore } = this.props;
        const { pageSize } = this.state
        const currentPage = 1

        try {
            await keyStore.listKey(pageSize, pageSize * (currentPage - 1));
            await keyGroupStore.listKeyGroup();

        } catch (error) {
            switch (error.response.status) {
                default:
                    ZoomMessage.error(`Uncaught error ${error.response.status}: ${error.response.data}`);
                    break;
            }

        }

        this.setState({ currentPage })
    }

    getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
            return (
                <div style={{ padding: 8 }}>
                    {this.renderFilterDropdownInput(dataIndex)}
                    <Row type='flex' justify='space-between'>
                        <a onClick={() => this.handleSearch(confirm)}> Search </a>
                        <a onClick={() => this.handleReset(dataIndex, clearFilters)}> Reset </a>
                    </Row>
                </div>
            )
        },
        filterIcon: filtered => <SearchOutlined type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilterDropdownVisibleChange: (visible) => {
            if (visible
                && (
                    dataIndex === 'cellNumber' ||
                    dataIndex === 'description' ||
                    dataIndex === 'keyGroup' //||
                    // dataIndex === 'status' ||
                    // dataIndex === 'actionBy' ||
                    // dataIndex === 'action'
                )
            ) {
                setTimeout(() => this.searchInput.select())
            }
        },
    })

    handleOnAddNewClick() {
        this.setState({ createUserVisible: true, selectedKeyId: undefined })
    }

    handleOnEditClick(record) {
        this.setState({ createUserVisible: true, selectedKeyId: record.id })
    }

    handleOnLogClick(record) {
        this.setState({ viewKeyLogVisible: true, selectedKeyId: record.id })
    }

    handleReset(dataIndex, clearFilters) {
        clearFilters()
        switch (dataIndex) {
            case 'cellNumber':
            case 'description':
            case 'keyGroup':
            // case 'status':
            // case 'action':
            // case 'time':
                this.setState({
                    filterValues: update(this.state.filterValues, { [dataIndex]: { $set: undefined } })
                }, () => this.handleOnTableChange({ current: 1, pageSize: this.state.pageSize }, null, {}))
                break;

            default:
                break
        }
    }

    handleOnResetAllClick() {
        this.setState({
            filterValues: initialFilterValues,
            sortField: undefined
        }, () => this.handleOnTableChange({ current: 1, pageSize: this.state.pageSize }, null, {}))
    }

    handleSearch(confirm) {
        confirm()
        this.handleOnTableChange({ current: 1, pageSize: this.state.pageSize }, null, {})
    }

    handleOnTableChange(pagination, filters, sorter) {
        const { order } = sorter
        const sortField = order ? (order === 'ascend' ? `${sorter.columnKey}` : `-${sorter.columnKey}`) : null
        const page = pagination.current
        const { keyStore } = this.props
        const { pageSize } = pagination
        const { cellNumber, description, keyGroup, status, actionBy, actionTime } = this.state.filterValues;

        keyStore
            .listKey(pageSize, pageSize * (page - 1),
                sortField,
                cellNumber, description, keyGroup, status, actionBy, actionTime
            )
            .catch(error => {
                switch (error.response.status) {
                    default:
                        ZoomMessage.error(`Uncaught error ${error.response.status}: ${error.response.data}`);
                        break;
                }
            });

        this.setState({
            currentPage: page,
            pageSize: pageSize,
            sortedInfo: sorter
        })
    }

    handleOnKeyCreate(values, reset) {
        const { commonStore, keyStore, keyGroupStore } = this.props;
        const { selectedKeyId } = this.state;
        const { cellNumber, description, keyGroupId, keyTagNumber } = values;

        if (selectedKeyId) { // update
            keyStore
                .updateKey(selectedKeyId, cellNumber, description, keyGroupId, keyTagNumber)
                .then(() => {
                    reset()
                    ZoomMessage.success('Update successful')
                    this.setState({ createUserVisible: false, selectedKeyId: undefined })
                })
                .then(() => keyGroupStore.listKeyGroup())
                .catch(error => {
                    console.log(error);
                    // switch (error.response.status) {
                    //     case 401: // Unauthorized
                    //         ZoomMessage.error('Unauthorized or expired access');
                    //         if (commonStore.isLoggedIn) commonStore.removeUser();
                    //         this.props.history.push('/login')
                    //         break;
                    //     case 403: // Forbidden
                    //         ZoomMessage.error('Access denied');
                    //         break;
                    //     case 409: // Conflict
                    //         ZoomMessage.error('Duplicates exist');
                    //         keyStore.listKey();
                    //         break;
                    //     default:
                    //         ZoomMessage.error(`Uncaught error ${error.response.status}: ${error.response.data}`);
                    //         break;
                    // }
                });

        } else { // create
            keyStore
                .createKey(cellNumber, description, keyGroupId, keyTagNumber)
                .then(() => {
                    reset()
                    ZoomMessage.success('Creation successful')
                    this.setState({ createUserVisible: false, selectedKeyId: undefined })
                    this.handleOnResetAllClick()
                })
                .then(() => keyGroupStore.listKeyGroup())
                .catch(error => {
                    switch (error.response.status) {
                        case 401: // Unauthorized
                            ZoomMessage.error('Unauthorized or expired access');
                            if (commonStore.isLoggedIn) commonStore.removeUser();
                            this.props.history.push('/login')
                            break;
                        case 403: // Forbidden
                            ZoomMessage.error('Access denied');
                            break;
                        case 409: // Conflict
                            ZoomMessage.error('Duplicates exist');
                            keyStore.listKey();
                            break;
                        default:
                            ZoomMessage.error(`Uncaught error ${error.response.status}: ${error.response.data}`);
                            break;
                    }
                });

        }
    }

    renderFilterDropdownInput(dataIndex) {
        switch (dataIndex) {
            case 'description':
            case 'keyGroup':
            // case 'status':
            // case 'actionBy':
            // case 'actionTime':
                return (
                    <Input
                        ref={node => { this.searchInput = node }}
                        placeholder='Search ...'
                        value={this.state.filterValues[dataIndex]}
                        onChange={e => {
                            const filterValues = update(this.state.filterValues, { [dataIndex]: { $set: e.target.value } })
                            this.setState({
                                filterValues
                            })
                        }}
                        style={{ width: 100, marginBottom: 8, display: 'block' }}
                    />
                )
            default:
                return null
        }
    }

    
    renderTableColumn() {
        const { commonStore } = this.props
        const { sortedInfo } = this.state

        let columns = [
            {
                title: 'Cell',
                dataIndex: 'cellNumber',
                key: 'cellNumber',
                sorter: true,
                sortOrder: sortedInfo && sortedInfo.columnKey === 'cellNumber' && sortedInfo.order,
                width: 20,
                ...this.getColumnSearchProps('cellNumber')
            },
            {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
                sorter: true,
                sortOrder: sortedInfo && sortedInfo.columnKey === 'description' && sortedInfo.order,
                width: 150,
                render: (text, record) => {
                    return record.description || '-'
                },
                ...this.getColumnSearchProps('description')
            },
            {
                title: 'Key group',
                dataIndex: 'keyGroup',
                key: 'keyGroup',
                sorter: true,
                sortOrder: sortedInfo && sortedInfo.columnKey === 'keyGroup' && sortedInfo.order,
                width: 130,
                render: keyGroup => (
                    keyGroup &&
                    (<Tag color = 'geekblue'>
                        <Tooltip title={keyGroup.description}>
                            {keyGroup.abbreviation}
                        </Tooltip>
                    </Tag>)
                ),
                ...this.getColumnSearchProps('keyGroup')
            },
            {
                title: 'Status',
                dataIndex: 'isAvailable',
                key: 'status',
                // sorter: true,
                // sortOrder: sortedInfo && sortedInfo.columnKey === 'status' && sortedInfo.order,
                width: 120,
                render: isAvailable => (isAvailable ? 'Available' : 'Not available'),
                // ...this.getColumnSearchProps('status')
            },
            {
                title: 'Action',
                dataIndex: 'lastLog',
                key: 'actionBy',
                // sorter: true,
                // sortOrder: sortedInfo && sortedInfo.columnKey === 'actionBy' && sortedInfo.order,
                align: 'right',
                width: 150,
                render: log => (
                    log ?
                    (<span>
                        {(log.action === 'retrieve' ? 'Retrieved by ' : 'Returned by ')}
                        {log.user &&
                            <Tag color = 'geekblue'>
                                <Tooltip title={log.user.displayName}>
                                    {log.user.username}
                                </Tooltip>
                            </Tag>
                        }
                    </span>) :
                    'No history yet'
                ),
                // ...this.getColumnSearchProps('actionBy')
            },
            {
                title: 'Time',
                dataIndex: 'lastLog',
                key: 'actionTime',
                // sorter: true,
                // sortOrder: sortedInfo && sortedInfo.columnKey === 'actionTime' && sortedInfo.order,
                width: 150,
                render: log => log && moment(log.createdAt).fromNow(),
                // ...this.getColumnSearchProps('actionTime')
            },
        ]

        columns = columns.concat({
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 70,
            render: (text, record) => (
                <span>
                    <a onClick={() => this.handleOnLogClick(record)}>
                        Log
                    </a>
                    {commonStore.isAdmin() &&
                        <span>
                            &nbsp;|&nbsp;
                            <a onClick={() => this.handleOnEditClick(record)}>
                                Edit
                            </a>
                        </span>
                    }
                </span>
            )
        })

        return columns
    }
    

    render() {
        const { commonStore, keyStore, keyGroupStore } = this.props;
        const { currentPage, pageSize, selectedKeyId } = this.state;

        let selectedKeyIndex;

        if (selectedKeyId) selectedKeyIndex = keyStore.keys.findIndex(u => u.id === selectedKeyId);
        
        return (
            <TableWrapper>
                <ActionWrapper>
                    <ActionLeftWrapper>
                        {/* {this.renderFilterTags()} */}
                    </ActionLeftWrapper>

                    <Button type="primary" onClick={() => this.handleOnResetAllClick()}>
                        Reset view
                    </Button>
                    {commonStore.isAdmin() ?
                        <Button type="primary" onClick={() => this.handleOnAddNewClick()}>
                            New
                        </Button> :
                        null
                    }
                </ActionWrapper>
                <Table
                    columns={this.renderTableColumn()}
                    dataSource={toJS(keyStore.keys)}
                    pagination={
                        {
                            showQuickJumper: true,
                            current: +currentPage,
                            pageSize: pageSize,
                            // total: keyStore.count,
                        }
                    }
                    onChange={(pagination, filters, sorter) => this.handleOnTableChange(pagination, filters, sorter)}
                    loading={keyStore.isSubmitting}
                    rowKey={record => record.id}
                />

                <CreateKeyModal
                    selectedKey={selectedKeyIndex > -1 ? toJS(keyStore.keys[selectedKeyIndex]) : this.emptyKey}
                    keyGroups={toJS(keyGroupStore.keyGroups)}
                    visible={this.state.createUserVisible}
                    isSubmitting={keyStore.isSubmitting}
                    onSubmit={(values, reset) => this.handleOnKeyCreate(values, reset)}
                    onClose={() => this.setState({ createUserVisible: false })}
                />

                <ViewLogModal
                    selectedKey={selectedKeyIndex > -1 ? toJS(keyStore.keys[selectedKeyIndex]) : this.emptyKey}
                    visible={this.state.viewKeyLogVisible}
                    isSubmitting={keyStore.isSubmitting}
                    onClose={() => this.setState({ viewKeyLogVisible: false })}
                />

            </TableWrapper>
        )
    }
}

export default withRouter(KeyTable)