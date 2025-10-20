// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-testid attribute.
       * @example cy.getByTestId('greeting')
       */
      getByTestId(value: string): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Custom command to wait for the chart to be loaded
       * @example cy.waitForChartLoad()
       */
      waitForChartLoad(): Chainable<void>;
      
      /**
       * Custom command to select a trading pair
       * @example cy.selectPair('BTC/USD')
       */
      selectPair(pair: string): Chainable<void>;
      
      /**
       * Custom command to select a time interval
       * @example cy.selectInterval('1h')
       */
      selectInterval(interval: string): Chainable<void>;
    }
  }
}

// Custom command to select by data-testid
Cypress.Commands.add('getByTestId', (selector: string) => {
  return cy.get(`[data-testid="${selector}"]`);
});

// Custom command to wait for chart to load
Cypress.Commands.add('waitForChartLoad', () => {
  cy.get('.recharts-wrapper', { timeout: 10000 }).should('be.visible');
});

// Custom command to select trading pair
Cypress.Commands.add('selectPair', (pair: string) => {
  cy.contains('button', pair).click();
});

// Custom command to select interval
Cypress.Commands.add('selectInterval', (interval: string) => {
  cy.contains('button', interval).click();
});

export {};
