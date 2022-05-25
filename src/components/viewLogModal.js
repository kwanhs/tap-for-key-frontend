import React, { Component } from 'react'
import { Modal, Button } from 'antd'
import LogTable from './logTable'
import { reaction } from 'mobx'

class ViewLogModal extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { visible, isSubmitting, selectedKey, onClose } = this.props;
        const { id, description, keyGroup } = selectedKey;
        const isNewKey = selectedKey.id === undefined;

        let fullDescription = description;
        
        if (id && keyGroup && keyGroup.description)
            fullDescription = `${keyGroup.description} / ${fullDescription}`
            
        return (
            <Modal
                visible={visible}
                mask
                maskClosable={false}
                centered
                width={800}
                title={id && `Logs for ${fullDescription}`}
                footer={[
                    <Button
                        key="Close"
                        onClick={() => onClose()}
                    >
                        Close
                    </Button>
                ]}
                forceRender
                onCancel = {() => onClose()}
            >
            <LogTable
                selectedKey={selectedKey}
                isSubmitting={isSubmitting}
            />
            </Modal>
        )
    }
}

export default ViewLogModal
