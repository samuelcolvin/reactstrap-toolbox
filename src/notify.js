import {message_toast} from './toast'


const now = () => new Date()

export class Notify {
  constructor (history, icon, browser_inactive_time) {
    this.history = history
    this.icon = icon || null
    this.last_event = now()
    this.browser_inactive_time = browser_inactive_time || 5000
    document.addEventListener('keydown', this._on_event)
    document.addEventListener('mousemove', this._on_event)
  }

  request = () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification')
    } else if (Notification.permission === 'default') {
        Notification.requestPermission()
    }
  }

  notify = msg => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification')
    } else if (Notification.permission === 'granted') {
      this._show_notification(msg)
      return
    } else {
      console.warn('notifications not permitted')
    }
    this._toast(msg)
  }

  _on_event = () => {
    this.last_event = now()
  }

  _show_notification = msg => {
    if (!document.hidden && now() - this.last_event < this.browser_inactive_time) {
      this._toast(msg)
    } else {
      const n = new Notification(msg.title, {
        body: msg.message,
        icon: this.icon,
      })
      n.onclick = () => {
        n.close()
        window.focus()
        this.history.push(msg.link)
      }
    }
  }

  _toast = msg => {
    const onClick = e => {
      e.close()
      this.history.push(msg.link)
    }
    message_toast(Object.assign({onClick, progress: false}, msg))
  }
}
