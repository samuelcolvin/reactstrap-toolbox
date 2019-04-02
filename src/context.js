import React from 'react'
import {get_component_name} from './utils'

export const GlobalContext = React.createContext({})

export function WithContext (WrappedComponent) {
  const WithContext = props => (
    <GlobalContext.Consumer>
      {ctx => <WrappedComponent {...props} ctx={ctx}/>}
    </GlobalContext.Consumer>
  )
  WithContext.displayName = `WithContext(${get_component_name(WrappedComponent)})`
  return WithContext
}
