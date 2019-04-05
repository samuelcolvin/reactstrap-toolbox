import React from 'react'
import {Spinner} from 'reactstrap'
import {withRouter} from 'react-router-dom'

const combine_classes = (className, default_cls) => className ? `${default_cls} ${className}` : default_cls

export const Error = ({error, className}) => {
  if (error.status === 404) {
    return <NotFound className={className} url={error.url}/>
  } else {
    return (
      <div className={combine_classes(className, 'error')}>
        <h1>Error</h1>
        <p>
          {error.status ? <span>{error.status}: </span> : ''}
          {error.message ? error.message : error.toString()}.
        </p>
      </div>
    )
  }
}

export const NotFound = withRouter(({url, children, location, className}) => (
  <div className={combine_classes(className, 'not-found')}>
    <h1>Page not found</h1>
    <p>The page <code>{url || location.pathname}</code> does not exist.</p>
    {children}
  </div>
))

export const Loading = ({className, children}) => (
  <div className={combine_classes(className,'d-flex justify-content-center py-2 loading')}>
    <Spinner color="info"/>
    {children}
  </div>
)
