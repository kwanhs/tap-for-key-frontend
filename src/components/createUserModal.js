import React, { Component } from 'react'
import { Modal } from 'antd'
import CreateUserForm from './forms/createUserForm'
import { reaction } from 'mobx'

class CreateUserModal extends Component {
    formRef = React.createRef();

    constructor(props) {
        super(props)
    }

    render() {
        const { visible, isSubmitting, user, roles } = this.props
        const isNewUser = user.id === undefined;
        
        return (
            <Modal
                visible={visible}
                mask
                maskClosable={false}
                centered
                width={800}
                bodyStyle={{height: 400}}
                title={isNewUser ? 'Create user' : 'Edit user'}
                okText='Save'
                cancelText='Cancel'
                onOk={() => this.formRef.handleSubmit()}
                onCancel={() => {
                    this.props.onClose()
                    this.formRef.resetForm()
                }}
                forceRender
            >
                <CreateUserForm
                    initial={user}
                    roles={roles}
                    isSubmitting={isSubmitting}
                    onSubmit={(values, reset) => this.props.onSubmit(values, reset)}
                    ref={(inst) => this.formRef = inst}
                />
            </Modal>
        )
    }
}

export default CreateUserModal
