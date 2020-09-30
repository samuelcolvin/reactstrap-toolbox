import React from 'react'
import {Spinner} from 'reactstrap'
import {withRouter} from 'react-router-dom'
import {combine_classes} from './utils'

export const Error = ({error, className}) => {
  if (error.status === 404) {
    return <NotFound className={className} url={error.url}/>
  } else {
    return (
      <div className={combine_classes(className, 'error')}>
        <h1>Error</h1>
        <p>
          {error.status ? <span>{error.status}: </span> : null}
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
  <div role="progressbar" className={combine_classes(className, 'loading')}>
    <div className="text-center py-2">
      <Spinner color="info"/>
    </div>
    <div className="text-center text-muted">
      {children}
    </div>
  </div>
)
