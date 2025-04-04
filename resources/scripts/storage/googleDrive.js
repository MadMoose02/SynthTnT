import { google } from 'googleapis';
import { PassThrough } from 'stream';

import logger from '../logger.js';
import Submitter from './submitter.js';

/**
 * Google Drive Submitter Class
 * Handles uploading files to Google Drive.
 */
class GoogleDriveSubmitter extends Submitter {
    /**
     * Initializes the Google Drive API client.
     * @param {string} serviceAccountEmail - The service account email.
     * @param {string} privateKey - The private key for the service account.
     * @param {string} folderId - The Google Drive folder ID where files will be uploaded.
     */
    constructor(serviceAccountEmail, privateKey, folderId) {
        super();

        if (!serviceAccountEmail || !privateKey || !folderId) {
            throw new Error(
                'GoogleDriveSubmitter: Missing required parameters.' + 
                'Ensure Google Drive service account email, private key and folder ID are set in the environment variables.'
            );
        }

        this.folderId = folderId;
        this.jwtClient = new google.auth.JWT(
            serviceAccountEmail,
            null,
            privateKey,
            ['https://www.googleapis.com/auth/drive'],
            null
        );

        this.jwtClient.authorize((err) => {
            if (err) {
                logger.error(`Failed to authorize Google Drive API: ${err.message}`);
            } else {
                logger.info('Successfully authorized Google Drive API.');
            }
        });

        this.drive = google.drive({ version: 'v3', auth: this.jwtClient });
    }

    /**
     * Uploads a file to Google Drive.
     * @param {Buffer|string} fileContent - The file content as a Buffer or string.
     * @param {string} fileName - The name of the file to upload.
     * @param {string} mimeType - The MIME type of the file.
     * @returns {Promise<Object>} The uploaded file's metadata.
     */
    async uploadFile(fileContent, fileName, mimeType) {
        try {
            const bufferStream = new PassThrough();
            bufferStream.end(fileContent);

            const response = await this.drive.files.create({
                media: {
                    mimeType: mimeType,
                    body: bufferStream,
                },
                requestBody: {
                    name: fileName,
                    parents: [this.folderId],
                },
                fields: 'id, name',
            });

            logger.info(`File uploaded successfully: ${response.data.name} (ID: ${response.data.id})`);
            return response.data;
        } catch (err) {
            logger.error(`Failed to upload file: ${err.message}`);
            throw err;
        }
    }
}

export default GoogleDriveSubmitter;