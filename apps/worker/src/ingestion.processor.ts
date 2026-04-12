import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { StorageService } from '@app/storage';
import * as pdfParseImport from 'pdf-parse';
const pdfParse = pdfParseImport as any;

@Processor('ingestion')
export class IngestionProcessor extends WorkerHost {
  private readonly logger = new Logger(IngestionProcessor.name);

  constructor(private readonly storageService: StorageService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}...`,
    );

    if (job.name === 'parse-pdf') {
      try {
        const { symbol, url } = job.data;

        // 1. Fetch the PDF from the URL
        this.logger.log(`Fetching PDF from ${url} for symbol ${symbol}...`);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Upload to MinIO
        const filename = `${symbol}-${Date.now()}.pdf`;
        const minioUrl = await this.storageService.uploadBuffer(
          filename,
          buffer,
        );
        this.logger.log(`Uploaded to MinIO at ${minioUrl}`);

        // 3. Parse PDF to extract text
        this.logger.log('Extracting text from PDF...');
        const pdfData = await pdfParse(buffer);

        const extractedText = pdfData.text;
        this.logger.log(`Extracted ${extractedText.length} characters of text`);

        // Output a snippet to demonstrate parsing
        this.logger.log(
          `Text preview: ${extractedText.substring(0, 100).replace(/\n/g, ' ')}...`,
        );

        // We would normally parse the tables and save to the Database here
        // (to be done with Entity resolution logic in Phase 4)

        return {
          success: true,
          symbol,
          minioUrl,
          textLength: extractedText.length,
        };
      } catch (error) {
        this.logger.error(`Error processing job ${job.id}: ${error.message}`);
        throw error;
      }
    }

    return { success: false, reason: 'Unknown job type' };
  }
}
