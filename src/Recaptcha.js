import React from 'react'
import {load_script} from './utils'

const load_callback = 'recaptcha_load_callback'
const click_callback = 'recaptcha_click_callback'


export default ({onChange, className, element_id='google-recaptcha'}) => {
  window[click_callback] = r => {
    if (onChange) {
      onChange(r)
    } else {
      console.warn('no onChange for Recaptcha, response:', r)
    }
  }

  React.useEffect(() => {
    function recaptcha_render () {
      window.grecaptcha.render(element_id, {sitekey: process.env.REACT_APP_RECAPTCHA_KEY, callback: click_callback})
    }

    if (window[load_callback]) {
      // recaptcha has already been loaded
      try {
        recaptcha_render()
      } catch (error) {
        // already rendered is ok, ignore
        if (error.message !== 'reCAPTCHA has already been rendered in this element') {
          throw error
        }
      }
      window.grecaptcha.reset()
    } else {
      window[load_callback] = recaptcha_render
      load_script(`https://www.google.com/recaptcha/api.js?onload=${load_callback}&render=explicit`)
    }
  }, [])

  return <div className={className} id={element_id}/>
}
