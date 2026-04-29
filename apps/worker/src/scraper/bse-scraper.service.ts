import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser, BrowserContext } from 'playwright';
import { Company } from './nse-scraper.service';

@Injectable()
export class BseScraperService {
  private readonly logger = new Logger(BseScraperService.name);

  async getCompanyList(): Promise<Company[]> {
    const companies: Company[] = [];
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    const page = await context.newPage();
    
    try {
      await page.goto('https://www.bseindia.com/corporates/', { 
        timeout: 30000,
        waitUntil: 'domcontentloaded'
      });
      
      // Wait for content to load
      await page.waitForTimeout(3000);
      
      // Try to find company table or list
      const tableExists = await page.locator('table').first().isVisible().catch(() => false);
      
      if (tableExists) {
        const rows = await page.locator('tbody tr').all();
        for (const row of rows) {
          const cells = await row.locator('td').all();
          if (cells.length >= 2) {
            const symbol = await cells[0].textContent();
            const name = await cells[1].textContent();
            if (symbol && name) {
              companies.push({
                symbol: symbol.trim(),
                name: name.trim(),
                exchange: 'BSE',
                isin: '',
                series: ''
              });
            }
          }
        }
      } else {
        // Fallback: Try to find any list/grid of companies
        this.logger.log('Table not found, checking alternate selectors');
      }
    } catch (error) {
      this.logger.error(`Error fetching BSE companies: ${error}`);
    } finally {
      await browser.close();
    }
    
    this.logger.log(`Fetched ${companies.length} BSE companies`);
    return companies;
  }

  async test(): Promise<boolean> {
    try {
      const companies = await this.getCompanyList();
      return companies.length > 0;
    } catch {
      return false;
    }
  }
}