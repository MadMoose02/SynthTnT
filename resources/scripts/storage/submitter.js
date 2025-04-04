/**
 * Base Submitter Class
 * 
 * Provides a common interface for cloud storage submitters.
 */
class Submitter {
    /**
     * Uploads a file to the cloud storage.
     * This method should be implemented by subclasses.
     * @param {Buffer|string} fileContent - The file content as a Buffer or string.
     * @param {string} fileName - The name of the file to upload.
     * @param {string} mimeType - The MIME type of the file.
     * @returns {Promise<Object>} The uploaded file's metadata.
     */
    async uploadFile(fileContent, fileName, mimeType) {
        throw new Error('uploadFile() method must be implemented by subclasses');
    }

    /**
     * Uploads evaluation data (JSON) to the cloud storage.
     * @param {Object} data - The evaluation data to upload.
     * @param {string} fileName - The name of the JSON file.
     * @returns {Promise<Object>} The uploaded file's metadata.
     */
    async uploadEvaluationData(data, fileName) {
        const jsonData = JSON.stringify(data, null, 2);
        return this.uploadFile(jsonData, fileName, 'application/json');
    }

    /**
     * Uploads synthesized audio (WAV) to the cloud storage.
     * @param {Buffer} audioBuffer - The audio file content as a Buffer.
     * @param {string} fileName - The name of the WAV file.
     * @returns {Promise<Object>} The uploaded file's metadata.
     */
    async uploadSynthesizedAudio(audioBuffer, fileName) {
        return this.uploadFile(audioBuffer, fileName, 'audio/wav');
    }
}

export default Submitter;