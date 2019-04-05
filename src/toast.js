import React from 'react'
import ReactDOM from 'react-dom'
import {Toast, ToastHeader, ToastBody} from 'reactstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {sleep} from 'reactstrap-toolbox'

import {get_create_element} from './confirm'


class ToastMessage extends React.Component {
  state = {open: true, closing: false}
  v = 0

  componentDidMount () {
    this.run()
  }

  componentDidUpdate (prevProps) {
    if (this.props !== prevProps) {
      this.v += 1
      this.setState({open: true, closing: false})
      this.run()
    }
  }

  run = async () => {
    const v = this.v
    await sleep(this.props.show_time || 5000)
    if (v === this.v) {
      await this._finish(v)
    }
  }

  close = () => {
    this.v += 1
    this._finish(this.v)
  }

  _finish = async v => {
    this.setState({closing: true})
    await sleep(700)
    if (v === this.v) {
      this.setState({open: false, closing: false})
    }
  }

  render () {
    if (!this.state.open) {
      return null
    }
    return (
      <div className={'toast-msg' + (this.state.closing ? ' t-close' : '')}>
        <Toast>
          <ToastHeader toggle={() => this.close()}>
            {this.props.icon && <FontAwesomeIcon icon={this.props.icon} className="mr-2"/>}
            {this.props.title}
          </ToastHeader>
          <ToastBody>
            {this.props.message}
          </ToastBody>
        </Toast>
      </div>
    )
  }
}

export function message_toast ({message, title, icon}) {
  ReactDOM.render(<ToastMessage {...{message, title, icon}}/>, get_create_element('rstb-message-toast'))
}
