describe('Chart Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('button', 'Get Started').then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
      }
    });
    cy.wait(1000); // Wait for initial render
  });

  it('should display the financial chart', () => {
    cy.contains('Chart').should('be.visible');
    cy.waitForChartLoad();
  });

  it('should display candlestick data', () => {
    cy.get('.recharts-wrapper').should('exist');
  });

  it('should have drawing toolbar', () => {
    cy.contains('✏️').should('exist');
  });

  it('should have indicators button', () => {
    cy.contains('Indicators').should('be.visible');
  });

  it('should open indicators modal when clicked', () => {
    cy.contains('button', 'Indicators').click();
    cy.contains('Technical Indicators').should('be.visible');
    cy.contains('SMA').should('be.visible');
    cy.contains('RSI').should('be.visible');
  });

  it('should toggle indicators on and off', () => {
    cy.contains('button', 'Indicators').click();
    
    // Toggle SMA
    cy.contains('SMA').parent().find('input[type="checkbox"]').click();
    
    // Close modal
    cy.get('body').type('{esc}');
    
    // Wait for chart to update
    cy.wait(500);
  });

  it('should change time intervals', () => {
    cy.contains('button', '1m').should('be.visible');
    cy.contains('button', '15m').should('be.visible');
    cy.contains('button', '1h').should('be.visible');
    cy.contains('button', '4h').should('be.visible');
    cy.contains('button', '1d').should('be.visible');
    
    // Click on 1h interval
    cy.contains('button', '1h').click();
    cy.wait(500);
  });

  it('should switch between trading pairs', () => {
    // Click on pair selector
    cy.contains('BTC/USD').click();
    
    // Select a different pair
    cy.contains('ETH/USD').click();
    
    // Verify the pair changed
    cy.contains('ETH/USD').should('be.visible');
    cy.wait(500);
  });

  it('should display volume bars', () => {
    cy.get('.recharts-bar').should('exist');
  });
});
