# E2E Testing with Cypress

## Setup Complete ✅

Cypress has been installed and configured for your Crypto Insight AI project with comprehensive end-to-end tests.

## Test Structure

### Test Suites

1. **app-loading.cy.ts** - Basic application loading tests
2. **landing-page.cy.ts** - Landing page functionality
3. **dashboard-layout.cy.ts** - Dashboard layout and panels
4. **chart-functionality.cy.ts** - Chart interactions and indicators
5. **market-data-panel.cy.ts** - Market data display
6. **ai-trading-feed.cy.ts** - AI trading feed functionality
7. **ai-assistant.cy.ts** - AI chat assistant
8. **layout-customization.cy.ts** - Layout customization features
9. **theme-toggle.cy.ts** - Theme switching

## Running Tests

### Headless Mode (CI/CD Ready)

```bash
# Run all e2e tests in headless mode (starts dev server automatically)
npm run e2e

# Run tests only (requires dev server running separately)
npm test

# Run in specific browsers
npm run test:chrome
npm run test:firefox
npm run test:edge
```

### Headed Mode (with visible browser)

```bash
# Run with visible browser
npm run test:headed

# Or run e2e with visible browser
npm run e2e:headed
```

### Interactive Mode

```bash
# Open Cypress Test Runner for interactive development
npm run cy:open
```

## Manual Testing Steps

If you want to run tests manually:

### Step 1: Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Step 2: Run Cypress Tests (in a new terminal)

```bash
# Headless mode
npm test

# With browser visible
npm run test:headed

# Interactive mode
npm run cy:open
```

## Test Coverage

### ✅ Implemented Tests

- Application loading and initialization
- Landing page display and navigation
- Dashboard layout responsiveness
- Chart rendering and interactions
- Technical indicators modal
- Time interval switching
- Trading pair selection
- Market data panel display
- OHLC data verification
- AI Trading Feed display and filtering
- AI Chat Assistant interactions
- Layout customization
- Panel visibility toggles
- Theme switching (dark/light mode)

### 🎯 Key Features Tested

- **Responsive Design**: Tests run at 1920x1080 viewport
- **Dynamic Content**: Waits for charts and data to load
- **User Interactions**: Clicks, form inputs, modal interactions
- **State Management**: Layout persistence, theme preference
- **Real-time Updates**: Market data, AI feed items

## Configuration

### Cypress Config (`cypress.config.ts`)

- **BaseURL**: `http://localhost:3000`
- **Viewport**: 1920x1080
- **Video**: Disabled (to save space)
- **Screenshots**: Enabled on failure
- **Spec Pattern**: `cypress/e2e/**/*.cy.{js,jsx,ts,tsx}`

### Custom Commands

Located in `cypress/support/commands.ts`:

- `cy.getByTestId()` - Select by data-testid attribute
- `cy.waitForChartLoad()` - Wait for charts to render
- `cy.selectPair()` - Select trading pair
- `cy.selectInterval()` - Select time interval

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

## Troubleshooting

### Tests Failing Due to Landing Page

The app shows a landing page by default. Tests are configured to:
1. Visit the root URL
2. Check if "Get Started" button exists
3. Click it if present
4. Wait for dashboard to load

### Timeouts

If tests timeout, increase wait times in the test files or check that the dev server is responding quickly.

### Browser Issues

Cypress runs in Electron by default (headless mode). For debugging:
```bash
npm run test:chrome    # Use Chrome
npm run test:headed    # Show browser window
npm run cy:open        # Interactive mode
```

## Next Steps

1. **Run the tests**: `npm run e2e`
2. **Add more tests** as you add new features
3. **Integrate with CI/CD** for automatic testing
4. **Add component tests** using Cypress component testing
5. **Add visual regression tests** with `@percy/cypress`

## Notes

- Tests are designed to be resilient to timing issues
- Screenshots are captured on failure for debugging
- Tests can run in parallel for faster execution
- Custom commands make tests more maintainable
