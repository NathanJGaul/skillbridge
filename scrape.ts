import { BrowserContext, chromium, Locator, Page } from "playwright";
import { Position, Location } from "./schema.ts";


async function waitForData(page: Page) {
  await page.waitForSelector(".loading-screen", { state: "hidden" });
}

async function loadPage(url: string, context: BrowserContext): Promise<Page> {
  const page = await context.newPage();
  await page.goto(url);
  return page;
}

async function loadAllData(page: Page) {
  // Set and reset "Duration of Training" to load all data onto page
  const durationSelector =
    `//html/body/div[1]/div/div/div/div/div/div[3]/div/div[1]/form/div[2]/div[2]/div/div[3]/span/span[1]/span/span[1]`;
  const durationFirstChildSelector = `//html/body/span/span/span[2]/ul/li[1]`;
  const durationSecondChildSelector = `//html/body/span/span/span[2]/ul/li[2]`;

  await page.locator(durationSelector).click();
  await page.locator(durationSecondChildSelector).click();
  await waitForData(page);
  await page.locator(durationSelector).click();
  await page.locator(durationFirstChildSelector).click();
  await waitForData(page);

  // return await page.locator(`#results-container`).innerHTML(); // get data results container html
}

async function getTotalPageNumber(page: Page): Promise<number> {
  return parseInt(
    (await page.locator(
      `#location-table_paginate > span > a:nth-child(5)`,
    ).textContent())!,
  );
}

async function getCurrentPageNumber(page: Page): Promise<number> {
  return parseInt(
    (await page.locator(
      `#location-table_paginate > span > a.paginate_button.current`,
    ).textContent())!,
  );
}

async function isLastPage(nextPageButton: Locator): Promise<boolean> {
  return (await nextPageButton.getAttribute("class"))!.split(" ")
    .includes("disabled");
}

(async () => {
  const url = "https://skillbridge.osd.mil/locations.htm";
  const browser = await chromium.launch({
    headless: true,
    // slowMo: 50,
  });
  const context = await browser.newContext();
  const page = await loadPage(url, context);

  await loadAllData(page);

  const numberOfPages = await getTotalPageNumber(page);
  let currentPageNumber = await getCurrentPageNumber(page);

  const nextPageButton = page.locator(`#location-table_next`);
  let onLastPage = await isLastPage(nextPageButton);

  while (!onLastPage) {
    // Scrape
    const rows = await page.getByRole("row");
    const dataRows = rows.filter({ has: page.locator('td') });
    const numberOfRoles = await dataRows.count();
    console.log(`On page ${currentPageNumber} of ${numberOfPages}: scraping ${numberOfRoles} roles`);

    const positions: Position[] = await dataRows.evaluateAll((rows: Element[]) => {
      // Implement the helper functions directly inside the browser context
      function parseCoordinate(value: string, defaultValue: number = 0): number {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
      }
    
      function parseShowPinFunction(onclickAttr: string): Location | undefined {
        try {
          const showPinRegex = /ShowPin\(([^,]+),([^,]+),["']([^"']+)["'],["']([^"']+)["'],["']([^"']+)["'],["']([^"']+)["'],["']([^"']+)["'],["']([^"']+)["']\)/;
          const match = onclickAttr.match(showPinRegex);
          
          if (!match || match.length < 9) {
            return undefined;
          }
          
          return {
            latitude: parseCoordinate(match[1]),
            longitude: parseCoordinate(match[2]),
            city: match[3] || '',
            state: match[4] || '',
            zip: match[5] || '',
            title: match[6] || '',
            contactName: match[7] || '',
            contactEmail: match[8] || ''
          };
        } catch (error) {
          console.error("Error occured:", error);
          return undefined;
        }
      }
    
      function extractElementText(element: Element | null | undefined): string {
        return element && element.textContent ? element.textContent.trim() : '';
      }
      
      return rows.map((row: Element) => {
        // Get all cells in the row
        const cells = Array.from(
          row.querySelectorAll('td')
        );
        
        // Extract location data from ShowPin function if available
        const mapButton = row.querySelector('button.table-map-location');
        const location = mapButton 
          ? parseShowPinFunction(mapButton.getAttribute('onclick') || '')
          : undefined;
        
        // Helper function to safely extract text from cell at given index
        const getCellText = (index: number): string => {
          return index >= 0 && index < cells.length 
            ? extractElementText(cells[index]) 
            : '';
        };
        
        // Create position object with all data
        const position: Position = {
          partnerProgramAgency: getCellText(1),
          service: getCellText(2),
          city: getCellText(3),
          state: getCellText(4),
          durationOfTraining: getCellText(5),
          employerPOC: getCellText(6),
          pocEmail: getCellText(7),
          cost: getCellText(8),
          closestInstallation: getCellText(9),
          opportunityLocationsByState: getCellText(10),
          deliveryMethod: getCellText(11),
          targetMOCs: getCellText(12),
          otherEligibilityFactors: getCellText(13),
          otherPrerequisite: getCellText(14),
          jobsDescription: getCellText(15),
          summaryDescription: getCellText(16),
          jobFamily: getCellText(17),
          mouOrganization: getCellText(18)
        };
        
        // Add location if available
        if (location) {
          position.location = location;
        }
        
        return position;
      });
    });

    positions.forEach(position => {
      console.log(position);
    });

    // break; // testing

    // Go to next page
    await nextPageButton.click();
    onLastPage = await isLastPage(nextPageButton);
    currentPageNumber = await getCurrentPageNumber(page);
  }

  await context.close();
  await browser.close();
})();
