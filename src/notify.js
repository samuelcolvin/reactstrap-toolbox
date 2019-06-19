import {message_toast} from './toast'


const now = () => new Date()

export class Notify {
  constructor (history, browser_inactive_time) {
    this.history = history
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

  window_active = () => !document.hidden && now() - this.last_event < this.browser_inactive_time

  _on_event = () => {
    this.last_event = now()
  }

  _show_notification = msg => {
    if (this.window_active()) {
      this._toast(msg)
    } else {
      const n = new Notification(msg.title, {
        body: msg.message || msg.body,
        icon: msg.icon,
        badge: msg.badge,
      })
      n.onclick = () => {
        n.close()
        window.focus()
        const link = msg.link || (msg.data || {}).link
        if (link) {
          this.history.push(link)
        }
      }
    }
  }

  _toast = msg => {
    const onClick = e => {
      e.close()
      const link = msg.link || (msg.data || {}).link
      if (link) {
        this.history.push(link)
      }
    }
    message_toast(Object.assign({onClick, progress: false}, msg))
  }
}
