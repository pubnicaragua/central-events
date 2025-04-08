import React from 'react'
import EventCard from './EventCard'

describe('<EventCard />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<EventCard />)
  })
})