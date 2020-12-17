import React from 'react'
import ReactDOM from 'react-dom'
import {Toast, ToastHeader, ToastBody} from 'reactstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import {sleep} from './utils'
import {get_create_element} from './confirm'


class ToastMessage extends React.Component {
  state = {open: true, closing: false}
  v = 0 // used to stop the animation progression on user input, eg. new message or close
  hover = false
  progress_ref = React.createRef()

  componentDidMount () {
    this.run(this.v)
  }

  run = async v => {
    const step = 20
    const steps = this.props.time / step
    let steps_remaining = steps
    while (steps_remaining > 0) {
      if (v !== this.v) {
        return
      }
      if (this.progress_ref.current) {
        this.progress_ref.current.style.width = `${steps_remaining / steps * 100}%`
      }
      if (!this.hover) {
        steps_remaining -= 1
      }
      await sleep(step)
    }
    await this._finish(v)
  }

  close = () => {
    this.v += 1
    this._finish(this.v)
  }

  _finish = async v => {
    this.setState({closing: true})
    await sleep(700)
    if (v === this.v) {
      this.setState({open: false, closing: false}, () => this.props.remove())
    }
  }

  set_hover = v => {
    this.hover = v
  }

  onClick = e => {
    if (this.props.onClick) {
      e.close = () => this.close()
      this.props.onClick(e)
    }
  }

  render () {
    if (!this.state.open) {
      return <div/>
    }
    const classes = ['toast-msg']
    this.state.closing && classes.push('t-closing')
    this.props.onClick && classes.push('cursor-pointer')
    this.props.className && classes.push(this.props.className)
    return (
      <div className={classes.join(' ')} onClick={this.onClick}>
        <Toast onMouseEnter={() => this.set_hover(true)} onMouseLeave={() => this.set_hover(false)}>
          <ToastHeader toggle={() => this.close()}>
            {this.props.icon && <FontAwesomeIcon icon={this.props.icon} className="mr-2"/>}
            {this.props.title}
          </ToastHeader>
          {this.props.progress ? <div ref={this.progress_ref} className="toast-progress"/> : null}
          <ToastBody>
            {this.props.message}
          </ToastBody>
        </Toast>
      </div>
    )
  }
}

class ToastMessages extends React.Component {
  state = {toasts: []}
  visible = 1  // number of visible toasts

  componentDidMount () {
    const toasts = [this.props]
    this.setState({toasts})
  }

  componentDidUpdate (prevProps) {
    if (this.props.tkey !== prevProps.tkey) {
      const toasts = [...this.state.toasts]
      toasts.push(this.props)
      this.setState({toasts})
      this.visible += 1
    }
  }

  remove = () => {
    this.visible -= 1
    if (this.visible === 0) {
      this.setState({toasts: []})
    }
  }

  render () {
    return (
      <div className="toast-msgs">
        {this.state.toasts.map(t => (
          <ToastMessage {...t} key={t.tkey} remove={this.remove}/>
        ))}
      </div>
    )
  }
}

const rand_int = () => Math.round(Math.random() * 100000)

export function message_toast (
  {title, message, icon, onClick, className, time = 5000, progress = true, body = null, toast_icon = null}
) {
  message = message || body
  icon = toast_icon || icon
  if (typeof(icon) === 'string' && !/^fa/.test(icon)) {
    // happens when the icon was set in notify
    icon = null
  }
  ReactDOM.render(
    <ToastMessages {...{title, message, icon, onClick, className, time, progress, tkey: rand_int()}}/>,
    get_create_element('rstb-message-toast')
  )
}
