# Butterscotch Finance - Bill Management Application

A lightweight, responsive web application designed to help users track, organize, and visualize their recurring bills and expenses. Built with vanilla HTML, CSS, and JavaScript with persistent local storage.

## Overview

Butterscotch Finance provides a simple yet powerful interface for managing bills of varying frequencies. The application calculates monthly totals, visualizes spending patterns, and offers multiple sorting options to help users stay on top of their financial obligations.

## Features

- Dashboard with key metrics (monthly total, bill count, highest bill, average bill)
- Visual charts for frequency distribution and spending breakdown
- Sortable upcoming bills list with multiple organization options
- Add, view, and delete bills with flexible billing frequencies
- Persistent data storage using browser localStorage
- Responsive design optimized for desktop and mobile
- Multi-page navigation between Dashboard and Bills sections

## File Structure

### index.html

The HTML structure defines two main pages accessed through navigation:

**Navigation Bar**
- Static header with logo and page navigation buttons
- Active page indicator with color highlight
- Sticky positioning for constant access

**Dashboard Page**
- Statistics cards displaying:
  - Monthly total (sum of all bills normalized to monthly cost)
  - Total number of bills
  - Highest single bill amount
  - Average bill amount per month
- Two charts:
  - Bills by Frequency: Bar chart showing count of bills by frequency type
  - Amount Distribution: Pie chart displaying spending proportion by bill
- Upcoming bills section with sortable dropdown

**Bills Page**
- Add New Bill toggle button that reveals a form
- Form inputs for bill name, amount, frequency, and due date
- Responsive grid form layout with submit and cancel buttons
- List of all added bills with delete functionality

### styles.css

The stylesheet implements a minimalist design using a carefully selected color palette:

**Color Scheme**
- Primary: #2d2d44 (dark navy)
- Accent: #ff6b5b (coral red)
- Light background: #f5f7fa
- Borders: #e8ebf0

**Layout Components**

Navbar: Fixed position header with flexbox layout for navigation buttons. Active state highlighted with accent color underline.

Pages: Both Dashboard and Bills pages use absolute positioning with fade-in animation. Only one page displays at a time based on navigation state.

Stats Grid: Responsive grid that displays 4 stat cards. Cards include hover effects with transform and shadow animations.

Charts: Two chart cards in a responsive grid. The amount distribution uses SVG for pie chart rendering, while frequency uses CSS-based bar visualization.

Forms: Multi-column responsive grid layout that adapts to screen size. Hidden state managed by the "hidden" class.

Upcoming Section: Header contains title and sort dropdown with custom styling for the select element.

Bills List: Flex layout with bill cards that include name, frequency, amount, and delete button. Hover effects highlight the card border with accent color.

Responsive Design: Breakpoint at 768px reduces multi-column layouts to single column on mobile devices.

### main.js

The JavaScript handles all application logic and interactivity:

**Data Management**

Global State:
- `bills` array stores all bill objects
- `currentSort` tracks the selected sort method for upcoming bills

Bill Object Structure:

{
id: timestamp,
name: string,
amount: number,
frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly',
dueDate: number (1-31)
}

Storage Functions:
- `loadBills()`: Retrieves bills from localStorage on page load
- `saveBills()`: Persists bills array to localStorage after any change

**Initialization**

On DOM load, the application:
1. Loads bills from storage
2. Sets up navigation event listeners
3. Sets up form submission handlers
4. Sets up sort dropdown listener
5. Updates the dashboard display

**Navigation**

`setupNavigation()`: Attaches click handlers to navigation buttons. Removes active class from all buttons and adds to clicked button. Calls `showPage()` with the target page name.

`showPage()`: Hides all pages and displays the selected page. Triggers appropriate render functions based on which page is shown.

**Form Handling**

`setupForm()`: Initializes form interactions including:
- Toggle button to show/hide the add bill form
- Cancel button to hide form and reset inputs
- Form submission that validates inputs, creates bill object, saves to storage, and re-renders

**Dashboard Updates**

`updateDashboard()`: Called when page loads or after bills change. Recalculates all metrics:
- Monthly total: Normalizes each bill to monthly cost using frequency conversion
- Bill count: Simple array length
- Highest bill: Maximum amount from all bills
- Average bill: Monthly total divided by bill count

**Frequency Conversion**

`getMonthlyAmount()`: Converts bill amounts to monthly equivalent:
- Weekly: multiply by 4.33 (average weeks per month)
- Bi-weekly: multiply by 2.17
- Monthly: no change
- Quarterly: divide by 3
- Yearly: divide by 12

**Upcoming Bills Rendering**

`renderUpcoming()`: Displays bills with selected sort method:
- Sort by Due Date: Earliest month day first (1-31)
- Sort by Price: Highest amount first
- Closest Due Date: Most imminent payment first (accounts for month wraparound)
- Date Added: Most recently added first (uses timestamp ID)

Displays up to 5 bills in the selected order.

**Chart Rendering**

`renderFrequencyChart()`: Creates bar chart showing count of bills per frequency type. Calculates percentage of total bills for bar width.

`renderAmountChart()`: Generates SVG pie chart showing spending distribution. Special handling for single bill (displays as full circle). Each segment color-coded with legend below showing bill name and amount.

**Bills List Rendering**

`renderBillsList()`: Displays all bills in card format with name, frequency, due date, amount, and delete button. Called when Bills page is accessed.

**Deletion**

`deleteBill()`: Removes bill from array by ID, updates storage, and re-renders affected sections.

**Utility Functions**

`getDayWithSuffix()`: Converts day number to ordinal (1st, 2nd, 3rd, 4th, etc.)

`formatFrequency()`: Converts frequency codes to display text

## How It Works

1. User opens the application and existing bills load from localStorage
2. Dashboard displays with metrics and charts based on stored data
3. User can navigate to Bills page and add new bills using the form
4. Each bill creation automatically saves to storage
5. Dashboard metrics and charts update immediately after changes
6. User can sort upcoming bills using dropdown on Dashboard
7. Bills can be deleted from either the Bills page or through the list
8. All data persists between browser sessions

## Browser Compatibility

Works on all modern browsers supporting:
- ES6 JavaScript
- CSS Grid and Flexbox
- localStorage API
- SVG rendering

## Future Enhancement Possibilities

- Bill payment history tracking
- Recurring payment automation alerts
- Budget goal setting and tracking
- Export data as CSV
- Multiple currency support
- Category tags for bills
- Recurring payment reminders via notifications
