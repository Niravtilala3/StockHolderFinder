import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly minioClient: Minio.Client;
  private readonly bucketName = 'filings';
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: this.configService.get<number>('MINIO_PORT', 9000),
      useSSL:
        this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'admin'),
      secretKey: this.configService.get<string>(
        'MINIO_SECRET_KEY',
        'password123',
      ),
    });
  }

  async onModuleInit() {
    await this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'ap-south-1');
        this.logger.log(`Bucket '${this.bucketName}' created successfully.`);

        // Set policy to public read for easy UI access locally
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Action: ['s3:GetObject'],
              Effect: 'Allow',
              Principal: '*',
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(
          this.bucketName,
          JSON.stringify(policy),
        );
      }
    } catch (error) {
      this.logger.error(`Error initializing bucket: ${error.message}`);
    }
  }

  async uploadBuffer(
    filename: string,
    buffer: Buffer,
    contentType: string = 'application/pdf',
  ): Promise<string> {
    try {
      await this.minioClient.putObject(
        this.bucketName,
        filename,
        buffer,
        buffer.length,
        {
          'Content-Type': contentType,
        },
      );
      return this.getFileUrl(filename);
    } catch (error) {
      this.logger.error(`Failed to upload ${filename}: ${error.message}`);
      throw error;
    }
  }

  getFileUrl(filename: string): string {
    const protocol =
      this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true'
        ? 'https'
        : 'http';
    const host = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = this.configService.get<number>('MINIO_PORT', 9000);

    return `${protocol}://${host}:${port}/${this.bucketName}/${filename}`;
  }
}
