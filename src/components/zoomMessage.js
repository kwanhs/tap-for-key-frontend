import React from 'react'
import { message } from 'antd'

export default class ZoomMessage extends React.Component {
    static zoom = 1.4;

    static options = () => ({
        style: { zoom: this.zoom }
    })

    static success = (msg, otherOptions) => message.success({
        content: msg,
        ... otherOptions,
        ... this.options(),
    });

    static error = (msg, otherOptions) => message.error({
        content: msg,
        ... otherOptions,
        ... this.options(),
    });

    static info = (msg, otherOptions) => message.info({
        content: msg,
        ... otherOptions,
        ... this.options(),
    });

    static warning = (msg, otherOptions) => message.warning({
        content: msg,
        ... otherOptions,
        ... this.options(),
    });

    static loading = (msg, otherOptions) => message.loading({
        content: msg,
        ... otherOptions,
        ... this.options(),
    });

}
