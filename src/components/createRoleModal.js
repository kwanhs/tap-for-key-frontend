import React, { Component } from 'react'
import { Modal } from 'antd'
import CreateRole from './forms/createRoleForm'
import { reaction } from 'mobx'

class CreateRoleModal extends Component {
    formRef = React.createRef();

    constructor(props) {
        super(props)
    }

    render() {
        const { visible, isSubmitting, role, users, keyGroups } = this.props
        const isNewRole = role.id === undefined;
        
        return (
            <Modal
                visible={visible}
                mask
                maskClosable={false}
                centered
                width={800}
                bodyStyle={{height: 400}}
                title={isNewRole ? 'Create Role' : 'Edit Role'}
                okText='Save'
                cancelText='Cancel'
                onOk={() => this.formRef.handleSubmit()}
                onCancel={() => {
                    this.props.onClose()
                    this.formRef.resetForm()
                }}
                forceRender
            >
                <CreateRole
                    initial={role}
                    users={users}
                    keyGroups={keyGroups}
                    isSubmitting={isSubmitting}
                    onSubmit={(values, reset) => this.props.onSubmit(values, reset)}
                    ref={(inst) => this.formRef = inst}
                />
            </Modal>
        )
    }
}

export default CreateRoleModal
